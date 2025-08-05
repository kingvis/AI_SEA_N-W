"""
Dashboard Visualization
Interactive dashboard for underwater cable monitoring system
"""

import matplotlib.pyplot as plt
import matplotlib.animation as animation
from matplotlib.widgets import Button, CheckButtons
import seaborn as sns
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import threading
import queue
import time
from typing import Dict, List, Optional, Tuple
import warnings

# Configure plotting
plt.style.use('seaborn-v0_8-darkgrid')
sns.set_palette("husl")
warnings.filterwarnings('ignore')


class Dashboard:
    """Interactive dashboard for cable monitoring visualization"""
    
    def __init__(self, update_interval: int = 1000):  # milliseconds
        self.update_interval = update_interval
        self.is_running = False
        self.data_queue = queue.Queue()
        
        # Data storage for visualization
        self.sensor_data = {}
        self.anomaly_data = []
        self.alert_data = []
        self.network_stats = {}
        
        # Dashboard configuration
        self.max_data_points = 100
        self.selected_sensors = set()
        self.show_anomalies = True
        self.auto_scale = True
        
        # Color scheme
        self.colors = {
            'normal': '#2E86AB',
            'anomaly': '#F24236',
            'warning': '#F6AE2D',
            'critical': '#E63946',
            'background': '#F8F9FA',
            'text': '#2F3737'
        }
        
        # Initialize matplotlib components
        self.fig = None
        self.axes = {}
        self.lines = {}
        self.animation = None
    
    def setup_dashboard(self):
        """Setup the dashboard layout and components"""
        # Create figure with subplots
        self.fig = plt.figure(figsize=(16, 10))
        self.fig.suptitle('🔌 CableGuard AI - Underwater Cable Monitoring Dashboard', fontsize=16, fontweight='bold')
        
        # Define subplot layout
        gs = self.fig.add_gridspec(3, 3, hspace=0.3, wspace=0.3)
        
        # Main time series plot (top row, spans 2 columns)
        self.axes['timeseries'] = self.fig.add_subplot(gs[0, :2])
        self.axes['timeseries'].set_title('📊 Real-Time Sensor Readings')
        self.axes['timeseries'].set_xlabel('Time')
        self.axes['timeseries'].set_ylabel('Sensor Value')
        
        # Network status plot (top right)
        self.axes['network'] = self.fig.add_subplot(gs[0, 2])
        self.axes['network'].set_title('🌐 Network Status')
        
        # Anomaly distribution (middle left)
        self.axes['anomaly_dist'] = self.fig.add_subplot(gs[1, 0])
        self.axes['anomaly_dist'].set_title('⚠️ Anomaly Distribution')
        
        # Sensor health heatmap (middle center)
        self.axes['heatmap'] = self.fig.add_subplot(gs[1, 1])
        self.axes['heatmap'].set_title('🌡️ Sensor Health Heatmap')
        
        # Alert timeline (middle right)
        self.axes['alerts'] = self.fig.add_subplot(gs[1, 2])
        self.axes['alerts'].set_title('🚨 Recent Alerts')
        
        # System statistics (bottom row)
        self.axes['stats'] = self.fig.add_subplot(gs[2, :])
        self.axes['stats'].set_title('📈 System Statistics')
        self.axes['stats'].axis('off')  # Text-based display
        
        # Setup interactive controls
        self._setup_controls()
        
        plt.tight_layout()
    
    def _setup_controls(self):
        """Setup interactive controls"""
        # Control panel area
        control_ax = plt.axes((0.02, 0.02, 0.15, 0.2))
        control_ax.set_title('Controls')
        control_ax.axis('off')
        
        # Checkboxes for sensor selection
        self.sensor_checkboxes = CheckButtons(
            plt.axes((0.02, 0.25, 0.12, 0.15)),
            ['Sensor 1', 'Sensor 2', 'Sensor 3', 'All Sensors'],
            [True, True, True, False]
        )
        self.sensor_checkboxes.on_clicked(self._on_sensor_toggle)
        
        # Buttons for actions
        self.refresh_button = Button(plt.axes((0.02, 0.45, 0.06, 0.04)), 'Refresh')
        self.refresh_button.on_clicked(self._on_refresh)
        
        self.export_button = Button(plt.axes((0.09, 0.45, 0.06, 0.04)), 'Export')
        self.export_button.on_clicked(self._on_export)
    
    def _on_sensor_toggle(self, label):
        """Handle sensor selection toggle"""
        if label == 'All Sensors':
            if label in self.selected_sensors:
                self.selected_sensors.clear()
            else:
                self.selected_sensors = {'Sensor 1', 'Sensor 2', 'Sensor 3'}
        else:
            if label in self.selected_sensors:
                self.selected_sensors.remove(label)
            else:
                self.selected_sensors.add(label)
    
    def _on_refresh(self, event):
        """Handle refresh button click"""
        self._update_all_plots()
    
    def _on_export(self, event):
        """Handle export button click"""
        if self.fig is not None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"dashboard_export_{timestamp}.png"
            self.fig.savefig(filename, dpi=300, bbox_inches='tight')
            print(f"📁 Dashboard exported to {filename}")
    
    def update_data(self, sensor_readings: List[Dict], anomalies: List[Dict], 
                   alerts: List[Dict], network_stats: Dict):
        """Update dashboard data"""
        # Process sensor readings
        for reading in sensor_readings:
            sensor_id = reading.get('sensor_id', 'unknown')
            if sensor_id not in self.sensor_data:
                self.sensor_data[sensor_id] = {
                    'timestamps': [],
                    'values': [],
                    'anomalies': []
                }
            
            # Add new data point
            self.sensor_data[sensor_id]['timestamps'].append(reading.get('timestamp', datetime.now()))
            self.sensor_data[sensor_id]['values'].append(reading.get('value', 0))
            self.sensor_data[sensor_id]['anomalies'].append(reading.get('is_anomaly_detected', False))
            
            # Limit data points
            if len(self.sensor_data[sensor_id]['timestamps']) > self.max_data_points:
                self.sensor_data[sensor_id]['timestamps'].pop(0)
                self.sensor_data[sensor_id]['values'].pop(0)
                self.sensor_data[sensor_id]['anomalies'].pop(0)
        
        # Store other data
        self.anomaly_data.extend(anomalies)
        self.alert_data.extend(alerts)
        self.network_stats = network_stats
        
        # Limit stored data
        if len(self.anomaly_data) > self.max_data_points:
            self.anomaly_data = self.anomaly_data[-self.max_data_points:]
        if len(self.alert_data) > 50:  # Keep last 50 alerts
            self.alert_data = self.alert_data[-50:]
    
    def _update_timeseries_plot(self):
        """Update the main time series plot"""
        ax = self.axes['timeseries']
        ax.clear()
        ax.set_title('📊 Real-Time Sensor Readings')
        ax.set_xlabel('Time')
        ax.set_ylabel('Sensor Value')
        
        for sensor_id, data in self.sensor_data.items():
            if not data['timestamps']:
                continue
                
            timestamps = data['timestamps']
            values = data['values']
            anomalies = data['anomalies']
            
            # Plot normal data
            normal_mask = [not a for a in anomalies]
            if any(normal_mask):
                normal_times = [t for t, m in zip(timestamps, normal_mask) if m]
                normal_values = [v for v, m in zip(values, normal_mask) if m]
                ax.plot(normal_times, normal_values, 'o-', label=f'{sensor_id} (Normal)', 
                       color=self.colors['normal'], markersize=4, alpha=0.7)
            
            # Plot anomalies
            if self.show_anomalies and any(anomalies):
                anomaly_times = [t for t, a in zip(timestamps, anomalies) if a]
                anomaly_values = [v for v, a in zip(values, anomalies) if a]
                ax.scatter(anomaly_times, anomaly_values, color=self.colors['anomaly'], 
                          s=50, marker='X', label=f'{sensor_id} (Anomaly)', zorder=5)
        
        ax.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
        ax.grid(True, alpha=0.3)
        
        # Auto-format time axis
        if any(self.sensor_data.values()):
            ax.tick_params(axis='x', rotation=45)
    
    def _update_network_status(self):
        """Update network status visualization"""
        ax = self.axes['network']
        ax.clear()
        ax.set_title('🌐 Network Status')
        
        if not self.network_stats:
            ax.text(0.5, 0.5, 'No Data', ha='center', va='center', transform=ax.transAxes)
            return
        
        # Create pie chart of sensor status
        active_sensors = self.network_stats.get('active_sensors', 0)
        timeout_sensors = self.network_stats.get('timeout_sensors', 0)
        total_sensors = active_sensors + timeout_sensors
        
        if total_sensors > 0:
            labels = ['Active', 'Timeout']
            sizes = [active_sensors, timeout_sensors]
            colors = [self.colors['normal'], self.colors['warning']]
            
            wedges, texts, autotexts = ax.pie(sizes, labels=labels, colors=colors, 
                                            autopct='%1.1f%%', startangle=90)
            ax.set_aspect('equal')
        else:
            ax.text(0.5, 0.5, 'No Sensors', ha='center', va='center', transform=ax.transAxes)
    
    def _update_anomaly_distribution(self):
        """Update anomaly distribution plot"""
        ax = self.axes['anomaly_dist']
        ax.clear()
        ax.set_title('⚠️ Anomaly Distribution')
        
        if not self.anomaly_data:
            ax.text(0.5, 0.5, 'No Anomalies', ha='center', va='center', transform=ax.transAxes)
            return
        
        # Count anomalies by sensor
        sensor_counts = {}
        for anomaly in self.anomaly_data[-20:]:  # Last 20 anomalies
            sensor_id = anomaly.get('sensor_id', 'unknown')
            sensor_counts[sensor_id] = sensor_counts.get(sensor_id, 0) + 1
        
        if sensor_counts:
            sensors = list(sensor_counts.keys())
            counts = list(sensor_counts.values())
            bars = ax.bar(sensors, counts, color=self.colors['anomaly'], alpha=0.7)
            
            # Add value labels on bars
            for bar in bars:
                height = bar.get_height()
                ax.text(bar.get_x() + bar.get_width()/2., height + 0.1,
                       f'{int(height)}', ha='center', va='bottom')
            
            ax.set_xlabel('Sensor ID')
            ax.set_ylabel('Anomaly Count')
            plt.setp(ax.get_xticklabels(), rotation=45, ha='right')
    
    def _update_sensor_heatmap(self):
        """Update sensor health heatmap"""
        ax = self.axes['heatmap']
        ax.clear()
        ax.set_title('🌡️ Sensor Health Heatmap')
        
        if not self.sensor_data:
            ax.text(0.5, 0.5, 'No Data', ha='center', va='center', transform=ax.transAxes)
            return
        
        # Create health matrix (simplified example)
        sensors = list(self.sensor_data.keys())[:5]  # Limit to 5 sensors for display
        metrics = ['Activity', 'Anomaly Rate', 'Signal Quality']
        
        health_matrix = np.random.rand(len(sensors), len(metrics))  # Placeholder data
        
        # Calculate actual metrics where possible
        for i, sensor_id in enumerate(sensors):
            data = self.sensor_data[sensor_id]
            if data['anomalies']:
                anomaly_rate = sum(data['anomalies']) / len(data['anomalies'])
                health_matrix[i, 1] = 1 - anomaly_rate  # Higher is better
        
        im = ax.imshow(health_matrix, cmap='RdYlGn', aspect='auto', vmin=0, vmax=1)
        
        # Set ticks and labels
        ax.set_xticks(range(len(metrics)))
        ax.set_xticklabels(metrics)
        ax.set_yticks(range(len(sensors)))
        ax.set_yticklabels(sensors)
        
        # Add colorbar
        cbar = plt.colorbar(im, ax=ax, shrink=0.8)
        cbar.set_label('Health Score')
        
        # Add text annotations
        for i in range(len(sensors)):
            for j in range(len(metrics)):
                text = ax.text(j, i, f'{health_matrix[i, j]:.2f}',
                             ha="center", va="center", color="black", fontsize=8)
    
    def _update_alerts_timeline(self):
        """Update alerts timeline"""
        ax = self.axes['alerts']
        ax.clear()
        ax.set_title('🚨 Recent Alerts')
        
        if not self.alert_data:
            ax.text(0.5, 0.5, 'No Alerts', ha='center', va='center', transform=ax.transAxes)
            return
        
        # Get recent alerts
        recent_alerts = self.alert_data[-10:]  # Last 10 alerts
        
        if recent_alerts:
            y_positions = range(len(recent_alerts))
            timestamps = [alert.get('timestamp', datetime.now()) for alert in recent_alerts]
            severities = [alert.get('severity', 'medium') for alert in recent_alerts]
            
            # Color code by severity
            severity_colors = {
                'low': self.colors['normal'],
                'medium': self.colors['warning'],
                'high': self.colors['anomaly'],
                'critical': self.colors['critical']
            }
            
            colors = [severity_colors.get(sev, self.colors['warning']) for sev in severities]
            
            ax.scatter(timestamps, y_positions, c=colors, s=100, alpha=0.7)
            
            # Add alert descriptions
            for i, alert in enumerate(recent_alerts):
                description = alert.get('description', 'Unknown alert')[:30] + '...'
                ax.text(timestamps[i], i, description, fontsize=8, 
                       verticalalignment='center', horizontalalignment='left')
            
            ax.set_ylabel('Alert Index')
            ax.set_xlabel('Time')
            plt.setp(ax.get_xticklabels(), rotation=45, ha='right')
    
    def _update_statistics_display(self):
        """Update system statistics display"""
        ax = self.axes['stats']
        ax.clear()
        ax.set_title('📈 System Statistics')
        ax.axis('off')
        
        # Prepare statistics text
        stats_text = []
        
        if self.network_stats:
            uptime = self.network_stats.get('uptime_seconds', 0)
            uptime_str = str(timedelta(seconds=int(uptime)))
            
            stats_text.extend([
                f"🕐 System Uptime: {uptime_str}",
                f"📊 Total Readings: {self.network_stats.get('total_readings', 0):,}",
                f"⚠️ Anomalies Detected: {self.network_stats.get('anomalies_detected', 0):,}",
                f"🚨 Alerts Raised: {self.network_stats.get('alerts_raised', 0):,}",
                f"📈 Anomaly Rate: {self.network_stats.get('anomaly_rate', 0):.2%}",
                f"🌐 Active Sensors: {self.network_stats.get('active_sensors', 0)}",
                f"⏰ Last Reading: {self.network_stats.get('last_reading_time', 'N/A')}"
            ])
        else:
            stats_text.append("No system statistics available")
        
        # Display statistics in columns
        col1_text = '\n'.join(stats_text[:4])
        col2_text = '\n'.join(stats_text[4:])
        
        ax.text(0.05, 0.8, col1_text, transform=ax.transAxes, fontsize=11,
               verticalalignment='top', fontfamily='monospace')
        ax.text(0.55, 0.8, col2_text, transform=ax.transAxes, fontsize=11,
               verticalalignment='top', fontfamily='monospace')
    
    def _update_all_plots(self):
        """Update all dashboard plots"""
        if not self.is_running:
            return
        
        self._update_timeseries_plot()
        self._update_network_status()
        self._update_anomaly_distribution()
        self._update_sensor_heatmap()
        self._update_alerts_timeline()
        self._update_statistics_display()
        
        if self.fig is not None:
            self.fig.canvas.draw()
    
    def animate(self, frame):
        """Animation function for real-time updates"""
        self._update_all_plots()
        return []
    
    def launch(self, monitor=None):
        """Launch the interactive dashboard"""
        print("🚀 Launching CableGuard AI Dashboard...")
        
        self.is_running = True
        self.setup_dashboard()
        
        # Setup animation for real-time updates
        if self.fig is not None:
            self.animation = animation.FuncAnimation(
                self.fig, self.animate, interval=self.update_interval, blit=False
            )
        
        # If monitor is provided, start data update thread
        if monitor:
            self._start_data_update_thread(monitor)
        else:
            # Generate demo data for standalone mode
            self._generate_demo_data()
        
        plt.show()
        self.is_running = False
    
    def _start_data_update_thread(self, monitor):
        """Start thread to update data from monitor"""
        def update_loop():
            while self.is_running:
                try:
                    # Get fresh data from monitor
                    stats = monitor.get_monitoring_stats()
                    anomalies = monitor.get_recent_anomalies(limit=10)
                    alerts = monitor.get_recent_alerts(limit=10)
                    
                    # Convert recent buffer data to sensor readings format
                    recent_readings = list(monitor.data_buffer)[-20:] if monitor.data_buffer else []
                    
                    self.update_data(recent_readings, anomalies, alerts, stats)
                    
                except Exception as e:
                    print(f"Error updating dashboard data: {e}")
                
                time.sleep(self.update_interval / 1000)  # Convert to seconds
        
        update_thread = threading.Thread(target=update_loop)
        update_thread.daemon = True
        update_thread.start()
    
    def _generate_demo_data(self):
        """Generate demo data for standalone dashboard"""
        def demo_data_loop():
            sensor_ids = ['sensor_0_0', 'sensor_1_1', 'sensor_2_2']
            
            while self.is_running:
                # Generate fake sensor readings
                readings = []
                for sensor_id in sensor_ids:
                    reading = {
                        'timestamp': datetime.now(),
                        'sensor_id': sensor_id,
                        'value': np.random.normal(10, 2) + np.random.random() * 5,
                        'is_anomaly_detected': np.random.random() < 0.1
                    }
                    readings.append(reading)
                
                # Generate fake anomalies
                anomalies = []
                if np.random.random() < 0.3:  # 30% chance of anomaly
                    anomalies.append({
                        'timestamp': datetime.now(),
                        'sensor_id': np.random.choice(sensor_ids),
                        'consecutive_count': np.random.randint(1, 5)
                    })
                
                # Generate fake alerts
                alerts = []
                if np.random.random() < 0.1:  # 10% chance of alert
                    alerts.append({
                        'timestamp': datetime.now(),
                        'severity': np.random.choice(['low', 'medium', 'high']),
                        'description': 'Demo alert for testing dashboard'
                    })
                
                # Fake network stats
                stats = {
                    'uptime_seconds': time.time() % 3600,  # Demo uptime
                    'total_readings': np.random.randint(1000, 5000),
                    'anomalies_detected': np.random.randint(10, 100),
                    'alerts_raised': np.random.randint(1, 20),
                    'anomaly_rate': np.random.uniform(0.05, 0.15),
                    'active_sensors': len(sensor_ids),
                    'timeout_sensors': 0,
                    'last_reading_time': datetime.now()
                }
                
                self.update_data(readings, anomalies, alerts, stats)
                time.sleep(self.update_interval / 1000)
        
        demo_thread = threading.Thread(target=demo_data_loop)
        demo_thread.daemon = True
        demo_thread.start()


# Example usage
if __name__ == "__main__":
    print("📊 Dashboard Demo")
    print("=" * 25)
    
    # Launch dashboard in demo mode
    dashboard = Dashboard(update_interval=2000)  # 2 second updates
    dashboard.launch()  # Will generate demo data automatically 