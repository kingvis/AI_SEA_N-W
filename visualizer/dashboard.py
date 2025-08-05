"""
Dashboard Visualization
Multiple Independent Windows for underwater cable monitoring system
"""

import matplotlib.pyplot as plt
import matplotlib.animation as animation
from matplotlib.widgets import Button, CheckButtons
from matplotlib.lines import Line2D
import matplotlib.cm as cm
import seaborn as sns
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import threading
import queue
import time
from typing import Dict, List, Optional, Tuple
import warnings

# Configure plotting with better defaults
plt.style.use('seaborn-v0_8-whitegrid')
sns.set_palette("husl")
warnings.filterwarnings('ignore')

# Force matplotlib to use interactive backend
plt.ion()


class IndependentDashboards:
    """Multiple Independent Dashboard Windows for cable monitoring visualization"""
    
    def __init__(self, update_interval: int = 2000):  # milliseconds
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
        self.show_anomalies = True
        
        # Improved color scheme
        self.colors = {
            'normal': '#2E86AB',
            'anomaly': '#F24236',
            'warning': '#F6AE2D',
            'critical': '#E63946',
            'background': '#F8F9FA',
            'text': '#2F3737',
            'grid': '#E0E0E0',
            'accent': '#A663CC'
        }
        
        # Individual dashboard windows
        self.dashboard_windows = {}
        self.animations = {}
    
    def create_sensor_readings_window(self):
        """Create Real-Time Sensor Readings Window"""
        fig = plt.figure(figsize=(14, 8), num='📊 Real-Time Sensor Readings - CableGuard AI')
        fig.patch.set_facecolor(self.colors['background'])
        ax = fig.add_subplot(111)
        
        self.dashboard_windows['sensors'] = {'fig': fig, 'ax': ax}
        
        # Position window (if supported)
        try:
            mngr = fig.canvas.manager
            mngr.window.wm_geometry("+100+100")  # type: ignore  # Position at (100, 100)
        except (AttributeError, Exception):
            pass  # Window positioning not supported on this backend
        
        return fig, ax
    
    def create_network_status_window(self):
        """Create Network Status Window"""
        fig = plt.figure(figsize=(10, 8), num='🌐 Network Status - CableGuard AI')
        fig.patch.set_facecolor(self.colors['background'])
        ax = fig.add_subplot(111)
        
        self.dashboard_windows['network'] = {'fig': fig, 'ax': ax}
        
        # Position window (if supported)
        try:
            mngr = fig.canvas.manager
            mngr.window.wm_geometry("+600+100")  # type: ignore  # Position at (600, 100)
        except (AttributeError, Exception):
            pass  # Window positioning not supported on this backend
        
        return fig, ax
    
    def create_sensor_health_window(self):
        """Create Sensor Health Heatmap Window"""
        fig = plt.figure(figsize=(12, 8), num='🌡️ Sensor Health Matrix - CableGuard AI')
        fig.patch.set_facecolor(self.colors['background'])
        ax = fig.add_subplot(111)
        
        self.dashboard_windows['health'] = {'fig': fig, 'ax': ax}
        
        # Position window (if supported)
        try:
            mngr = fig.canvas.manager
            mngr.window.wm_geometry("+100+500")  # type: ignore  # Position at (100, 500)
        except (AttributeError, Exception):
            pass  # Window positioning not supported on this backend
        
        return fig, ax
    
    def create_alerts_window(self):
        """Create Alerts Timeline Window"""
        fig = plt.figure(figsize=(14, 8), num='🚨 Alerts Timeline - CableGuard AI')
        fig.patch.set_facecolor(self.colors['background'])
        ax = fig.add_subplot(111)
        
        self.dashboard_windows['alerts'] = {'fig': fig, 'ax': ax}
        
        # Position window (if supported)
        try:
            mngr = fig.canvas.manager
            mngr.window.wm_geometry("+600+500")  # type: ignore  # Position at (600, 500)
        except (AttributeError, Exception):
            pass  # Window positioning not supported on this backend
        
        return fig, ax
    
    def create_anomaly_window(self):
        """Create Anomaly Distribution Window"""
        fig = plt.figure(figsize=(12, 8), num='⚠️ Anomaly Analysis - CableGuard AI')
        fig.patch.set_facecolor(self.colors['background'])
        ax = fig.add_subplot(111)
        
        self.dashboard_windows['anomaly'] = {'fig': fig, 'ax': ax}
        
        # Position window (if supported)
        try:
            mngr = fig.canvas.manager
            mngr.window.wm_geometry("+1100+100")  # type: ignore  # Position at (1100, 100)
        except (AttributeError, Exception):
            pass  # Window positioning not supported on this backend
        
        return fig, ax
    
    def create_statistics_window(self):
        """Create System Statistics Window"""
        fig = plt.figure(figsize=(12, 8), num='📊 System Statistics - CableGuard AI')
        fig.patch.set_facecolor(self.colors['background'])
        ax = fig.add_subplot(111)
        ax.axis('off')
        
        self.dashboard_windows['stats'] = {'fig': fig, 'ax': ax}
        
        # Position window (if supported)
        try:
            mngr = fig.canvas.manager
            mngr.window.wm_geometry("+1100+500")  # type: ignore  # Position at (1100, 500)
        except (AttributeError, Exception):
            pass  # Window positioning not supported on this backend
        
        return fig, ax
    
    def setup_all_windows(self):
        """Setup all independent dashboard windows"""
        print("🚀 Creating 6 independent dashboard windows...")
        
        # Create each window independently
        self.create_sensor_readings_window()
        print("✅ Window 1: Real-Time Sensor Readings")
        
        self.create_network_status_window()
        print("✅ Window 2: Network Status")
        
        self.create_sensor_health_window()
        print("✅ Window 3: Sensor Health Matrix")
        
        self.create_alerts_window()
        print("✅ Window 4: Alerts Timeline")
        
        self.create_anomaly_window()
        print("✅ Window 5: Anomaly Analysis")
        
        self.create_statistics_window()
        print("✅ Window 6: System Statistics")
        
        print("🎯 All windows created and positioned!")
    
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
        if len(self.alert_data) > 50:
            self.alert_data = self.alert_data[-50:]
    
    def update_sensor_readings(self):
        """Update Real-Time Sensor Readings Window"""
        if 'sensors' not in self.dashboard_windows:
            return
            
        ax = self.dashboard_windows['sensors']['ax']
        ax.clear()
        ax.set_title('📊 Real-Time Sensor Readings - Live Data', fontsize=16, fontweight='bold', pad=20)
        ax.set_xlabel('Time', fontsize=12)
        ax.set_ylabel('Sensor Value', fontsize=12)
        
        colors = ['#2E86AB', '#A663CC', '#F6AE2D', '#E63946']
        
        for i, (sensor_id, data) in enumerate(self.sensor_data.items()):
            if not data['timestamps']:
                continue
                
            timestamps = data['timestamps']
            values = data['values']
            anomalies = data['anomalies']
            color = colors[i % len(colors)]
            
            # Plot normal data
            normal_mask = [not a for a in anomalies]
            if any(normal_mask):
                normal_times = [t for t, m in zip(timestamps, normal_mask) if m]
                normal_values = [v for v, m in zip(values, normal_mask) if m]
                sensor_label = sensor_id.replace('sensor_', 'Sensor ')
                ax.plot(normal_times, normal_values, 'o-', label=f'{sensor_label}', 
                       color=color, markersize=6, alpha=0.9, linewidth=3)
            
            # Plot anomalies
            if self.show_anomalies and any(anomalies):
                anomaly_times = [t for t, a in zip(timestamps, anomalies) if a]
                anomaly_values = [v for v, a in zip(values, anomalies) if a]
                sensor_label = sensor_id.replace('sensor_', 'Sensor ')
                ax.scatter(anomaly_times, anomaly_values, color=self.colors['anomaly'], 
                          s=100, marker='X', label=f'{sensor_label} (⚠️ Anomaly)', zorder=5, 
                          edgecolors='darkred', linewidth=2)
        
        if self.sensor_data:
            ax.legend(loc='upper left', fontsize=11, frameon=True, fancybox=True, shadow=True)
        
        ax.grid(True, alpha=0.3, linestyle='-', linewidth=0.5)
        ax.tick_params(axis='x', rotation=45, labelsize=10)
        ax.tick_params(axis='y', labelsize=11)
        
        self.dashboard_windows['sensors']['fig'].tight_layout()
        plt.draw()
    
    def update_network_status(self):
        """Update Network Status Window"""
        if 'network' not in self.dashboard_windows:
            return
            
        ax = self.dashboard_windows['network']['ax']
        ax.clear()
        ax.set_title('🌐 Network Status Overview', fontsize=16, fontweight='bold', pad=20)
        
        if not self.network_stats:
            ax.text(0.5, 0.5, 'No Network Data\nInitializing...', ha='center', va='center', 
                   transform=ax.transAxes, fontsize=14, color=self.colors['text'])
            self.dashboard_windows['network']['fig'].tight_layout()
            plt.draw()
            return
        
        active_sensors = self.network_stats.get('active_sensors', 0)
        timeout_sensors = self.network_stats.get('timeout_sensors', 0)
        total_sensors = active_sensors + timeout_sensors
        
        if total_sensors > 0:
            labels = ['Active Sensors', 'Timeout Sensors']
            sizes = [active_sensors, timeout_sensors]
            colors = [self.colors['normal'], self.colors['warning']]
            explode = (0.1, 0)
            
            wedges, texts, autotexts = ax.pie(sizes, labels=labels, colors=colors, 
                                            autopct='%1.1f%%', startangle=90, explode=explode,
                                            textprops={'fontsize': 12, 'fontweight': 'bold'},
                                            shadow=True)
            ax.set_aspect('equal')
            
            # Add center text
            ax.text(0, 0, f'{total_sensors}\nTotal\nSensors', ha='center', va='center', 
                   fontsize=14, fontweight='bold', color=self.colors['text'],
                   bbox=dict(boxstyle="round,pad=0.3", facecolor="white", alpha=0.9))
            
            # Health indicator
            health_percentage = (active_sensors / total_sensors) * 100 if total_sensors > 0 else 0
            health_status = "🟢 Excellent" if health_percentage >= 90 else "🟡 Good" if health_percentage >= 75 else "🟠 Warning" if health_percentage >= 50 else "🔴 Critical"
            
            ax.text(0.5, -1.4, f'Health: {health_status} ({health_percentage:.1f}%)', 
                   ha='center', va='center', transform=ax.transAxes, fontsize=12, 
                   fontweight='bold', color=self.colors['text'])
        else:
            ax.text(0.5, 0.5, 'No Sensors\nDetected', ha='center', va='center', 
                   transform=ax.transAxes, fontsize=14, color=self.colors['text'])
        
        self.dashboard_windows['network']['fig'].tight_layout()
        plt.draw()
    
    def update_sensor_health(self):
        """Update Sensor Health Window"""
        if 'health' not in self.dashboard_windows:
            return
            
        ax = self.dashboard_windows['health']['ax']
        ax.clear()
        ax.set_title('🌡️ Sensor Health Matrix - Real-Time', fontsize=16, fontweight='bold', pad=20)
        
        if not self.sensor_data:
            ax.text(0.5, 0.5, 'No Sensor Data\nAvailable', ha='center', va='center', 
                   transform=ax.transAxes, fontsize=14, color=self.colors['text'])
            self.dashboard_windows['health']['fig'].tight_layout()
            plt.draw()
            return
        
        sensors = list(self.sensor_data.keys())[:6]
        metrics = ['Activity', 'Quality', 'Anomaly Rate', 'Signal', 'Overall']
        
        health_matrix = np.zeros((len(sensors), len(metrics)))
        
        for i, sensor_id in enumerate(sensors):
            data = self.sensor_data[sensor_id]
            if data['anomalies'] and data['timestamps']:
                activity = min(len(data['timestamps']) / 50, 1.0)
                quality = 0.8 + np.random.random() * 0.2
                anomaly_rate = 1 - (sum(data['anomalies']) / max(len(data['anomalies']), 1))
                signal_strength = 0.7 + np.random.random() * 0.3
                overall_health = (activity + quality + anomaly_rate + signal_strength) / 4
                
                health_matrix[i] = [activity, quality, anomaly_rate, signal_strength, overall_health]
            else:
                health_matrix[i] = [0.5, 0.5, 0.5, 0.5, 0.5]
        
        im = ax.imshow(health_matrix, cmap='RdYlGn', aspect='auto', vmin=0, vmax=1)
        
        ax.set_xticks(range(len(metrics)))
        ax.set_xticklabels(metrics, fontsize=11)
        ax.set_yticks(range(len(sensors)))
        ax.set_yticklabels([s.replace('sensor_', 'Sensor ') for s in sensors], fontsize=11)
        
        cbar = self.dashboard_windows['health']['fig'].colorbar(im, ax=ax, shrink=0.8)
        cbar.set_label('Health Score (0=Poor, 1=Excellent)', fontsize=12, fontweight='bold')
        
        # Add value annotations
        for i in range(len(sensors)):
            for j in range(len(metrics)):
                value = health_matrix[i, j]
                text_color = "white" if value < 0.5 else "black"
                ax.text(j, i, f'{value:.2f}', ha="center", va="center", 
                       color=text_color, fontsize=10, fontweight='bold')
        
        self.dashboard_windows['health']['fig'].tight_layout()
        plt.draw()
    
    def update_alerts_timeline(self):
        """Update Alerts Timeline Window"""
        if 'alerts' not in self.dashboard_windows:
            return
            
        ax = self.dashboard_windows['alerts']['ax']
        ax.clear()
        ax.set_title('🚨 Recent Alerts Timeline - Live Updates', fontsize=16, fontweight='bold', pad=20)
        
        if not self.alert_data:
            ax.text(0.5, 0.5, '✅ No Recent Alerts\nSystem Operating Normally', ha='center', va='center', 
                   transform=ax.transAxes, fontsize=14, color=self.colors['normal'],
                   bbox=dict(boxstyle="round,pad=0.5", facecolor=self.colors['normal'], alpha=0.2))
            self.dashboard_windows['alerts']['fig'].tight_layout()
            plt.draw()
            return
        
        recent_alerts = self.alert_data[-15:]
        
        if recent_alerts:
            y_positions = range(len(recent_alerts))
            timestamps = [alert.get('timestamp', datetime.now()) for alert in recent_alerts]
            severities = [alert.get('severity', 'medium') for alert in recent_alerts]
            
            severity_colors = {
                'low': self.colors['normal'],
                'medium': self.colors['warning'],
                'high': self.colors['anomaly'],
                'critical': self.colors['critical']
            }
            
            colors = [severity_colors.get(sev, self.colors['warning']) for sev in severities]
            
            ax.scatter(timestamps, y_positions, c=colors, s=120, alpha=0.8, 
                      edgecolors='black', linewidth=1.5, zorder=5)
            
            for i, alert in enumerate(recent_alerts):
                description = alert.get('description', 'Unknown alert')
                severity = alert.get('severity', 'medium')
                timestamp_str = timestamps[i].strftime("%H:%M:%S") if hasattr(timestamps[i], 'strftime') else str(timestamps[i])
                
                full_label = f"[{timestamp_str}] [{severity.upper()}] {description}"
                ax.text(timestamps[i], i, f"  {full_label}", fontsize=10, 
                       verticalalignment='center', horizontalalignment='left',
                       bbox=dict(boxstyle="round,pad=0.3", facecolor="white", alpha=0.8, edgecolor=colors[i]))
            
            ax.set_ylabel('Alert Sequence', fontsize=12)
            ax.set_xlabel('Time', fontsize=12)
            ax.tick_params(axis='x', rotation=45, labelsize=10)
            ax.tick_params(axis='y', labelsize=10)
            
            # Add severity legend
            legend_elements = [Line2D([0], [0], marker='o', color='w', markerfacecolor=color, 
                                    markersize=10, label=severity.capitalize()) 
                             for severity, color in severity_colors.items()]
            ax.legend(handles=legend_elements, loc='upper right', fontsize=10)
            
            ax.grid(True, alpha=0.3, linestyle='--')
        
        self.dashboard_windows['alerts']['fig'].tight_layout()
        plt.draw()
    
    def update_anomaly_analysis(self):
        """Update Anomaly Analysis Window"""
        if 'anomaly' not in self.dashboard_windows:
            return
            
        ax = self.dashboard_windows['anomaly']['ax']
        ax.clear()
        ax.set_title('⚠️ Anomaly Distribution Analysis - Live Data', fontsize=16, fontweight='bold', pad=20)
        
        if not self.anomaly_data:
            ax.text(0.5, 0.5, '✅ No Anomalies Detected\nSystem Operating Normally', ha='center', va='center', 
                   transform=ax.transAxes, fontsize=14, color=self.colors['normal'],
                   bbox=dict(boxstyle="round,pad=0.5", facecolor=self.colors['normal'], alpha=0.2))
            self.dashboard_windows['anomaly']['fig'].tight_layout()
            plt.draw()
            return
        
        sensor_counts = {}
        severity_counts = {'low': 0, 'medium': 0, 'high': 0}
        
        for anomaly in self.anomaly_data[-30:]:
            sensor_id = anomaly.get('sensor_id', 'unknown')
            sensor_counts[sensor_id] = sensor_counts.get(sensor_id, 0) + 1
            
            consecutive = anomaly.get('consecutive_count', 1)
            if consecutive >= 3:
                severity_counts['high'] += 1
            elif consecutive >= 2:
                severity_counts['medium'] += 1
            else:
                severity_counts['low'] += 1
        
        if sensor_counts:
            sensors = list(sensor_counts.keys())
            counts = list(sensor_counts.values())
            
            red_colors = ['#ffcccc', '#ff9999', '#ff6666', '#ff3333', '#ff0000']
            colors = [red_colors[i % len(red_colors)] for i in range(len(sensors))]
            bars = ax.bar(sensors, counts, color=colors, alpha=0.8, edgecolor='darkred', linewidth=2)
            
            for bar in bars:
                height = bar.get_height()
                ax.text(bar.get_x() + bar.get_width()/2., height + 0.1,
                       f'{int(height)}', ha='center', va='bottom', fontsize=12, fontweight='bold')
            
            ax.set_xlabel('Sensor ID', fontsize=12)
            ax.set_ylabel('Anomaly Count', fontsize=12)
            
            simplified_labels = [s.replace('sensor_', 'Sensor ') for s in sensors]
            ax.set_xticklabels(simplified_labels, rotation=45, ha='right')
            
            # Statistics
            total_anomalies = sum(counts)
            avg_per_sensor = total_anomalies / len(sensors) if sensors else 0
            max_sensor = max(sensor_counts.keys(), key=lambda k: sensor_counts[k]) if sensor_counts else "None"
            
            stats_text = f"""📈 Analysis Summary:
• Total Anomalies: {total_anomalies}
• Average per Sensor: {avg_per_sensor:.1f}
• Most Active: {max_sensor.replace('sensor_', 'Sensor ')}
• High Severity: {severity_counts['high']}
• Medium Severity: {severity_counts['medium']}
• Low Severity: {severity_counts['low']}"""
            
            ax.text(0.02, 0.98, stats_text, transform=ax.transAxes, fontsize=10,
                   verticalalignment='top', bbox=dict(boxstyle="round,pad=0.5", 
                   facecolor="white", alpha=0.9, edgecolor=self.colors['anomaly']))
        
        self.dashboard_windows['anomaly']['fig'].tight_layout()
        plt.draw()
    
    def update_system_statistics(self):
        """Update System Statistics Window"""
        if 'stats' not in self.dashboard_windows:
            return
            
        ax = self.dashboard_windows['stats']['ax']
        ax.clear()
        ax.set_title('📊 System Statistics & Performance - Live Dashboard', fontsize=16, fontweight='bold', pad=20)
        ax.axis('off')
        
        if not self.network_stats:
            ax.text(0.5, 0.5, 'No system statistics available\nInitializing monitoring...', ha='center', va='center', 
                   transform=ax.transAxes, fontsize=14, color=self.colors['text'])
            self.dashboard_windows['stats']['fig'].tight_layout()
            plt.draw()
            return
        
        uptime = self.network_stats.get('uptime_seconds', 0)
        uptime_str = str(timedelta(seconds=int(uptime)))
        
        # KPI Section
        kpi_data = [
            ('🚨', 'Total Alerts', f"{self.network_stats.get('alerts_raised', 0):,}", self.colors['critical']),
            ('⚠️', 'Anomalies', f"{self.network_stats.get('anomalies_detected', 0):,}", self.colors['anomaly']),
            ('📈', 'Anomaly Rate', f"{self.network_stats.get('anomaly_rate', 0):.2%}", self.colors['warning']),
            ('🌐', 'Active Sensors', f"{self.network_stats.get('active_sensors', 0)}", self.colors['normal'])
        ]
        
        ax.text(0.5, 0.95, '🔑 Key Performance Indicators', ha='center', va='center', 
               transform=ax.transAxes, fontsize=16, fontweight='bold', color=self.colors['text'])
        
        for i, (icon, label, value, color) in enumerate(kpi_data):
            x_pos = 0.1 + (i * 0.2)
            ax.text(x_pos, 0.85, icon, fontsize=24, ha='center', transform=ax.transAxes)
            ax.text(x_pos, 0.78, label, fontsize=12, ha='center', fontweight='bold',
                   transform=ax.transAxes, color=self.colors['text'])
            ax.text(x_pos, 0.72, value, fontsize=14, ha='center', fontweight='bold',
                   transform=ax.transAxes, color=color)
        
        # System Information
        ax.text(0.5, 0.6, '🖥️ System Information', ha='center', va='center', 
               transform=ax.transAxes, fontsize=14, fontweight='bold', color=self.colors['text'])
        
        system_data = [
            ('🕐', 'System Uptime', uptime_str),
            ('📊', 'Total Readings', f"{self.network_stats.get('total_readings', 0):,}"),
            ('⏰', 'Last Update', str(self.network_stats.get('last_reading_time', 'N/A'))[:19])
        ]
        
        for i, (icon, label, value) in enumerate(system_data):
            y_pos = 0.5 - (i * 0.06)
            ax.text(0.1, y_pos, f"{icon} {label}:", fontsize=11, ha='left', fontweight='bold',
                   transform=ax.transAxes, color=self.colors['text'])
            ax.text(0.5, y_pos, value, fontsize=11, ha='left', fontweight='bold',
                   transform=ax.transAxes, color=self.colors['accent'])
        
        # Health Status
        total_sensors = self.network_stats.get('active_sensors', 0) + self.network_stats.get('timeout_sensors', 0)
        active_ratio = (self.network_stats.get('active_sensors', 0) / max(total_sensors, 1)) * 100
        anomaly_rate = self.network_stats.get('anomaly_rate', 0) * 100
        
        if active_ratio >= 95 and anomaly_rate < 5:
            health_status = "🟢 EXCELLENT"
            health_color = self.colors['normal']
        elif active_ratio >= 85 and anomaly_rate < 10:
            health_status = "🟡 GOOD"
            health_color = self.colors['normal']
        elif active_ratio >= 70 and anomaly_rate < 20:
            health_status = "🟠 WARNING"
            health_color = self.colors['warning']
        else:
            health_status = "🔴 CRITICAL"
            health_color = self.colors['critical']
        
        ax.text(0.5, 0.2, '💊 System Health Status', ha='center', va='center', 
               transform=ax.transAxes, fontsize=14, fontweight='bold', color=self.colors['text'])
        
        ax.text(0.5, 0.1, f"Overall Health: {health_status}", ha='center', va='center', 
               transform=ax.transAxes, fontsize=16, fontweight='bold', color=health_color,
               bbox=dict(boxstyle="round,pad=0.5", facecolor=health_color, alpha=0.2))
        
        self.dashboard_windows['stats']['fig'].tight_layout()
        plt.draw()
    
    def update_all_windows(self):
        """Update all dashboard windows"""
        if not self.is_running:
            return
        
        try:
            self.update_sensor_readings()
            self.update_network_status()
            self.update_sensor_health()
            self.update_alerts_timeline()
            self.update_anomaly_analysis()
            self.update_system_statistics()
        except Exception as e:
            print(f"Error updating windows: {e}")
    
    def animation_update(self, frame):
        """Animation function for real-time updates"""
        self.update_all_windows()
        return []
    
    def launch(self, monitor=None):
        """Launch all independent dashboard windows"""
        print("🚀 Launching CableGuard AI - Multiple Independent Dashboards")
        print("=" * 60)
        
        self.is_running = True
        
        # Create all windows
        self.setup_all_windows()
        
        # If monitor is provided, start data update thread
        if monitor:
            self._start_data_update_thread(monitor)
        else:
            # Generate demo data for standalone mode
            self._generate_demo_data()
        
        # Setup animation for real-time updates
        if 'sensors' in self.dashboard_windows:
            self.animations['main'] = animation.FuncAnimation(
                self.dashboard_windows['sensors']['fig'], 
                self.animation_update, 
                interval=self.update_interval, 
                blit=False
            )
        
        print("\n🎯 All dashboard windows are now open and updating!")
        print("📊 Each chart is in its own separate window")
        print("🔄 Data updates every 2 seconds")
        print("❌ Close any window or press Ctrl+C to exit all dashboards")
        print("\n💡 You can move, resize, and arrange windows as needed!")
        
        # Keep the windows open
        plt.show()
        self.is_running = False
    
    def _start_data_update_thread(self, monitor):
        """Start thread to update data from monitor"""
        def update_loop():
            while self.is_running:
                try:
                    stats = monitor.get_monitoring_stats()
                    anomalies = monitor.get_recent_anomalies(limit=10)
                    alerts = monitor.get_recent_alerts(limit=10)
                    recent_readings = list(monitor.data_buffer)[-20:] if monitor.data_buffer else []
                    
                    self.update_data(recent_readings, anomalies, alerts, stats)
                    
                except Exception as e:
                    print(f"Error updating dashboard data: {e}")
                
                time.sleep(self.update_interval / 1000)
        
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
                if np.random.random() < 0.3:
                    anomalies.append({
                        'timestamp': datetime.now(),
                        'sensor_id': np.random.choice(sensor_ids),
                        'consecutive_count': np.random.randint(1, 5)
                    })
                
                # Generate fake alerts
                alerts = []
                if np.random.random() < 0.1:
                    alerts.append({
                        'timestamp': datetime.now(),
                        'severity': np.random.choice(['low', 'medium', 'high']),
                        'description': f'Demo alert - Sensor {np.random.choice(sensor_ids)} anomaly detected'
                    })
                
                # Fake network stats
                stats = {
                    'uptime_seconds': time.time() % 3600,
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


# Create alias for backward compatibility
Dashboard = IndependentDashboards


# Example usage
if __name__ == "__main__":
    print("📊 Independent Multi-Window Dashboard Demo")
    print("=" * 45)
    
    # Launch dashboard in demo mode
    dashboard = IndependentDashboards(update_interval=2000)  # 2 second updates
    dashboard.launch()  # Will generate demo data automatically 