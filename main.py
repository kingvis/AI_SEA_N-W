#!/usr/bin/env python3
"""
CableGuard AI - Main Application Entry Point
"""

import sys
import warnings
warnings.filterwarnings('ignore')

print("🔌 CableGuard AI - Underwater Cable Monitoring System")
print("=" * 50)

try:
    print("🔧 Loading modules...")
    from simulator.cable_network import CableNetwork
    from detector.anomaly_model import AnomalyDetector, generate_sample_data  # type: ignore
    from detector.monitor import CableMonitor  # type: ignore
    from visualizer.dashboard import Dashboard  # type: ignore
    print("✅ All modules loaded successfully")
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Please ensure all files are in the correct directories")
    sys.exit(1)


def main():
    """Main application entry point"""
    try:
        # Initialize components
        print("🔧 Initializing components...")
        network = CableNetwork(num_cables=3, num_sensors_per_cable=5)
        detector = AnomalyDetector(contamination=0.1)
        monitor = CableMonitor(monitoring_interval=2.0)
        dashboard = Dashboard(update_interval=2000)
        
        print("✅ All components initialized successfully")
        
        # Generate some training data for the detector
        print("🎯 Training anomaly detector...")
        training_data, _ = generate_sample_data(n_samples=500, anomaly_rate=0.1)
        detector.train(training_data, save_model=False)
        
        print("🚀 Starting monitoring system...")
        
        # Start the monitoring system in background
        monitor.start_monitoring(network, detector, background=True)
        
        # Give it a moment to start
        import time
        time.sleep(1)
        
        # Launch dashboard (this will run in foreground)
        print("📊 Launching interactive dashboard...")
        print("🎮 Use the dashboard controls to interact with the system")
        print("❌ Close the dashboard window or press Ctrl+C to exit")
        
        dashboard.launch(monitor)
        
    except KeyboardInterrupt:
        print("\n⏹️ Monitoring stopped by user")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        print("🔌 CableGuard AI shutting down...")
        if 'monitor' in locals() and monitor.is_monitoring:
            monitor.stop_monitoring()


if __name__ == "__main__":
    main() 