"""
Cable Monitor
Real-time monitoring system for underwater cable networks
"""

import time
import threading
import queue
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Callable, Union
import pandas as pd
import numpy as np
from collections import deque, defaultdict
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class CableMonitor:
    """Real-time monitoring system for cable networks"""
    
    def __init__(self, monitoring_interval: float = 1.0, buffer_size: int = 1000):
        self.monitoring_interval = monitoring_interval  # seconds
        self.buffer_size = buffer_size
        self.is_monitoring = False
        self.monitoring_thread = None
        
        # Data storage
        self.data_buffer = deque(maxlen=buffer_size)
        self.anomaly_queue = queue.Queue()
        self.alert_queue = queue.Queue()
        
        # Statistics tracking
        self.stats = {
            'total_readings': 0,
            'anomalies_detected': 0,
            'alerts_raised': 0,
            'start_time': None,
            'last_reading_time': None
        }
        
        # Alert thresholds and rules
        self.alert_rules = {
            'consecutive_anomalies': 3,
            'anomaly_rate_threshold': 0.2,  # 20% anomaly rate triggers alert
            'sensor_timeout': 300,  # 5 minutes without reading
            'critical_sensors': []  # List of sensors that trigger immediate alerts
        }
        
        # Callbacks for external systems
        self.callbacks = {
            'on_anomaly': [],
            'on_alert': [],
            'on_sensor_failure': []
        }
        
        # Per-sensor tracking
        self.sensor_states = defaultdict(lambda: {
            'last_seen': None,
            'consecutive_anomalies': 0,
            'recent_readings': deque(maxlen=50),
            'status': 'unknown'
        })
    
    def _get_sensor_state(self, sensor_id: str):
        """Get or create sensor state for given sensor ID"""
        if sensor_id not in self.sensor_states:
            from collections import defaultdict, deque
            self.sensor_states[sensor_id] = {
                'last_seen': None,
                'consecutive_anomalies': 0,
                'recent_readings': deque(maxlen=50),
                'status': 'unknown'
            }
        return self.sensor_states[sensor_id]
    
    def add_callback(self, event_type: str, callback: Callable):
        """Add callback function for specific events"""
        if event_type in self.callbacks:
            self.callbacks[event_type].append(callback)
        else:
            raise ValueError(f"Unknown event type: {event_type}")
    
    def start_monitoring(self, network, anomaly_detector, background: bool = True):
        """Start the monitoring system"""
        if self.is_monitoring:
            logger.warning("Monitoring already in progress")
            return
        
        self.network = network
        self.anomaly_detector = anomaly_detector
        self.is_monitoring = True
        self.stats['start_time'] = datetime.now()
        
        logger.info("🚀 Starting cable monitoring system...")
        
        if background:
            self.monitoring_thread = threading.Thread(target=self._monitoring_loop)
            self.monitoring_thread.daemon = True
            self.monitoring_thread.start()
        else:
            self._monitoring_loop()
    
    def stop_monitoring(self):
        """Stop the monitoring system"""
        self.is_monitoring = False
        if self.monitoring_thread and self.monitoring_thread.is_alive():
            self.monitoring_thread.join(timeout=5)
        
        logger.info("⏹️ Monitoring system stopped")
    
    def _monitoring_loop(self):
        """Main monitoring loop"""
        logger.info("📡 Monitoring loop started")
        
        while self.is_monitoring:
            try:
                # Get latest sensor readings from network
                readings = self.network.simulate_step()
                
                if readings:
                    self._process_readings(readings)
                
                # Check for sensor timeouts
                self._check_sensor_timeouts()
                
                # Analyze alert conditions
                self._analyze_alerts()
                
                time.sleep(self.monitoring_interval)
                
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                time.sleep(1)  # Brief pause before retrying
    
    def _process_readings(self, readings: List[Dict]):
        """Process new sensor readings"""
        for reading in readings:
            self._process_single_reading(reading)
    
    def _process_single_reading(self, reading: Dict):
        """Process a single sensor reading"""
        sensor_id = reading.get('sensor_id')
        timestamp = reading.get('timestamp', datetime.now())
        
        # Ensure sensor_id is a string
        if sensor_id is None:
            logger.warning("Reading missing sensor_id, skipping")
            return
        
        sensor_id = str(sensor_id)
        
        # Update statistics
        self.stats['total_readings'] += 1
        self.stats['last_reading_time'] = timestamp
        
        # Store in buffer
        self.data_buffer.append(reading)
        
        # Update sensor state
        sensor_state = self._get_sensor_state(sensor_id)
        sensor_state['last_seen'] = timestamp
        sensor_state['recent_readings'].append(reading)  # type: ignore
        sensor_state['status'] = 'active'
        
        # Detect anomalies if detector is available and trained
        if hasattr(self, 'anomaly_detector') and self.anomaly_detector.is_trained:
            try:
                is_anomaly, anomaly_score = self.anomaly_detector.predict_single(reading)
                reading['is_anomaly_detected'] = is_anomaly
                reading['anomaly_score'] = anomaly_score
                
                if is_anomaly:
                    self._handle_anomaly(reading, sensor_id)
                else:
                    # Reset consecutive anomaly counter for this sensor
                    sensor_state['consecutive_anomalies'] = 0
                    
            except Exception as e:
                logger.error(f"Error detecting anomaly for reading: {e}")
                reading['is_anomaly_detected'] = False
                reading['anomaly_score'] = 0.0
    
    def _handle_anomaly(self, reading: Dict, sensor_id: str):
        """Handle detected anomaly"""
        self.stats['anomalies_detected'] += 1
        sensor_state = self._get_sensor_state(sensor_id)
        sensor_state['consecutive_anomalies'] += 1  # type: ignore
        
        # Add to anomaly queue
        anomaly_event = {
            'timestamp': reading['timestamp'],
            'sensor_id': sensor_id,
            'reading': reading,
            'consecutive_count': sensor_state['consecutive_anomalies']
        }
        
        self.anomaly_queue.put(anomaly_event)
        
        # Execute anomaly callbacks
        for callback in self.callbacks['on_anomaly']:
            try:
                callback(anomaly_event)
            except Exception as e:
                logger.error(f"Error executing anomaly callback: {e}")
        
        value = reading.get('value', 0)
        score = reading.get('anomaly_score', 0)
        logger.warning(f"🚨 Anomaly detected - Sensor: {sensor_id}, Value: {value:.2f}, Score: {score:.3f}")
    
    def _check_sensor_timeouts(self):
        """Check for sensors that haven't reported in a while"""
        current_time = datetime.now()
        timeout_threshold = timedelta(seconds=self.alert_rules['sensor_timeout'])
        
        for sensor_id, state in self.sensor_states.items():
            if state['last_seen'] and state['status'] == 'active':
                time_since_last = current_time - state['last_seen']  # type: ignore
                
                if time_since_last > timeout_threshold:
                    self._handle_sensor_timeout(sensor_id, time_since_last)
    
    def _handle_sensor_timeout(self, sensor_id: str, timeout_duration: timedelta):
        """Handle sensor timeout"""
        self.sensor_states[sensor_id]['status'] = 'timeout'
        
        timeout_event = {
            'timestamp': datetime.now(),
            'sensor_id': sensor_id,
            'timeout_duration': timeout_duration.total_seconds(),
            'event_type': 'sensor_timeout'
        }
        
        # Execute sensor failure callbacks
        for callback in self.callbacks['on_sensor_failure']:
            try:
                callback(timeout_event)
            except Exception as e:
                logger.error(f"Error executing sensor failure callback: {e}")
        
        logger.error(f"⚠️ Sensor timeout - {sensor_id} (timeout: {timeout_duration})")
    
    def _analyze_alerts(self):
        """Analyze conditions that should trigger alerts"""
        current_time = datetime.now()
        
        # Check consecutive anomalies per sensor
        for sensor_id, state in self.sensor_states.items():
            consecutive_count = state.get('consecutive_anomalies', 0)
            if consecutive_count >= self.alert_rules['consecutive_anomalies']:
                self._raise_alert('consecutive_anomalies', {
                    'sensor_id': sensor_id,
                    'count': consecutive_count,
                    'timestamp': current_time
                })
        
        # Check overall anomaly rate
        if len(self.data_buffer) >= 100:  # Need minimum data for meaningful rate
            recent_data = list(self.data_buffer)[-100:]  # Last 100 readings
            anomaly_count = sum(1 for r in recent_data if r.get('is_anomaly_detected', False))
            anomaly_rate = anomaly_count / len(recent_data)
            
            if anomaly_rate > self.alert_rules['anomaly_rate_threshold']:
                self._raise_alert('high_anomaly_rate', {
                    'rate': anomaly_rate,
                    'threshold': self.alert_rules['anomaly_rate_threshold'],
                    'timestamp': current_time
                })
    
    def _raise_alert(self, alert_type: str, alert_data: Dict):
        """Raise a system alert"""
        self.stats['alerts_raised'] += 1
        
        alert = {
            'alert_id': f"alert_{int(time.time())}_{alert_type}",
            'alert_type': alert_type,
            'timestamp': datetime.now(),
            'severity': self._get_alert_severity(alert_type),
            'data': alert_data,
            'description': self._get_alert_description(alert_type, alert_data)
        }
        
        self.alert_queue.put(alert)
        
        # Execute alert callbacks
        for callback in self.callbacks['on_alert']:
            try:
                callback(alert)
            except Exception as e:
                logger.error(f"Error executing alert callback: {e}")
        
        logger.critical(f"🚨 ALERT: {alert['description']}")
    
    def _get_alert_severity(self, alert_type: str) -> str:
        """Get severity level for alert type"""
        severity_map = {
            'consecutive_anomalies': 'high',
            'high_anomaly_rate': 'medium',
            'sensor_timeout': 'high',
            'critical_sensor_anomaly': 'critical'
        }
        return severity_map.get(alert_type, 'medium')
    
    def _get_alert_description(self, alert_type: str, alert_data: Dict) -> str:
        """Generate human-readable alert description"""
        descriptions = {
            'consecutive_anomalies': f"Sensor {alert_data.get('sensor_id')} has {alert_data.get('count')} consecutive anomalies",
            'high_anomaly_rate': f"High anomaly rate detected: {alert_data.get('rate', 0):.1%} (threshold: {alert_data.get('threshold', 0):.1%})",
            'sensor_timeout': f"Sensor {alert_data.get('sensor_id')} timeout for {alert_data.get('timeout_duration', 0):.0f} seconds"
        }
        return descriptions.get(alert_type, f"Alert type: {alert_type}")
    
    def get_monitoring_stats(self) -> Dict:
        """Get current monitoring statistics"""
        current_time = datetime.now()
        uptime = (current_time - self.stats['start_time']).total_seconds() if self.stats['start_time'] else 0
        
        return {
            'is_monitoring': self.is_monitoring,
            'uptime_seconds': uptime,
            'total_readings': self.stats['total_readings'],
            'anomalies_detected': self.stats['anomalies_detected'],
            'alerts_raised': self.stats['alerts_raised'],
            'anomaly_rate': self.stats['anomalies_detected'] / max(1, self.stats['total_readings']),
            'active_sensors': len([s for s in self.sensor_states.values() if s['status'] == 'active']),
            'timeout_sensors': len([s for s in self.sensor_states.values() if s['status'] == 'timeout']),
            'buffer_utilization': len(self.data_buffer) / self.buffer_size,
            'last_reading_time': self.stats['last_reading_time']
        }
    
    def get_recent_anomalies(self, limit: int = 10) -> List[Dict]:
        """Get recent anomalies from queue"""
        anomalies = []
        try:
            while len(anomalies) < limit and not self.anomaly_queue.empty():
                anomalies.append(self.anomaly_queue.get_nowait())
        except queue.Empty:
            pass
        return anomalies
    
    def get_recent_alerts(self, limit: int = 10) -> List[Dict]:
        """Get recent alerts from queue"""
        alerts = []
        try:
            while len(alerts) < limit and not self.alert_queue.empty():
                alerts.append(self.alert_queue.get_nowait())
        except queue.Empty:
            pass
        return alerts
    
    def get_sensor_summary(self) -> Dict:
        """Get summary of all sensor states"""
        summary = {}
        for sensor_id, state in self.sensor_states.items():
            summary[sensor_id] = {
                'status': state['status'],
                'last_seen': state['last_seen'],
                'consecutive_anomalies': state['consecutive_anomalies'],
                'recent_reading_count': len(state['recent_readings'])  # type: ignore
            }
        return summary
    
    def export_data(self, filepath: str, format: str = 'json'):
        """Export monitoring data to file"""
        data = {
            'stats': self.get_monitoring_stats(),
            'sensor_summary': self.get_sensor_summary(),
            'recent_data': list(self.data_buffer)[-100:],  # Last 100 readings
            'export_timestamp': datetime.now().isoformat()
        }
        
        if format.lower() == 'json':
            with open(filepath, 'w') as f:
                json.dump(data, f, default=str, indent=2)
        elif format.lower() == 'csv':
            df = pd.DataFrame(list(self.data_buffer))
            df.to_csv(filepath, index=False)
        
        logger.info(f"📁 Data exported to {filepath}")


# Example usage
if __name__ == "__main__":
    print("📡 Cable Monitor Demo")
    print("=" * 30)
    
    # This would normally be run with actual network and detector
    # For demo purposes, we'll show the interface
    
    monitor = CableMonitor(monitoring_interval=2.0)
    
    # Add some demo callbacks
    def on_anomaly_callback(anomaly_event):
        print(f"🚨 Anomaly callback triggered: {anomaly_event['sensor_id']}")
    
    def on_alert_callback(alert):
        print(f"🔔 Alert callback triggered: {alert['description']}")
    
    monitor.add_callback('on_anomaly', on_anomaly_callback)
    monitor.add_callback('on_alert', on_alert_callback)
    
    print("✅ Monitor initialized with callbacks")
    print("📊 Monitoring statistics:")
    print(monitor.get_monitoring_stats()) 