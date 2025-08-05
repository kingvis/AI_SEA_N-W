#!/usr/bin/env python3
"""
CableGuard AI - Main Application Entry Point
"""

import sys
import os

# Add project directories to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'simulator'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'detector'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'visualizer'))

from simulator.cable_network import CableNetwork
from detector.anomaly_model import AnomalyDetector
from detector.monitor import CableMonitor
from visualizer.dashboard import Dashboard


def main():
    """Main application entry point"""
    print("🔌 CableGuard AI - Underwater Cable Monitoring System")
    print("=" * 50)
    
    # Initialize components
    network = CableNetwork()
    detector = AnomalyDetector()
    monitor = CableMonitor()
    dashboard = Dashboard()
    
    print("✅ All components initialized successfully")
    print("🚀 Starting monitoring system...")
    
    # Start the monitoring system
    try:
        monitor.start_monitoring(network, detector)
        dashboard.launch()
    except KeyboardInterrupt:
        print("\n⏹️ Monitoring stopped by user")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        print("🔌 CableGuard AI shutting down...")


if __name__ == "__main__":
    main() 