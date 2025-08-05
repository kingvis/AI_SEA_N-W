#!/usr/bin/env python3
"""
Quick verification script for CableGuard AI
"""

import sys
import warnings
warnings.filterwarnings('ignore')

def test_components():
    """Quick test of all components"""
    print("🔌 CableGuard AI - Quick Component Test")
    print("=" * 45)
    
    try:
        # Test 1: Cable Network
        print("1️⃣ Testing Cable Network...")
        from simulator.cable_network import CableNetwork
        network = CableNetwork(num_cables=2, num_sensors_per_cable=3)
        status = network.get_network_status()
        print(f"   ✅ Network: {status['total_cables']} cables, {status['total_sensors']} sensors")
        
        # Test 2: Anomaly Detector
        print("2️⃣ Testing Anomaly Detector...")
        from detector.anomaly_model import AnomalyDetector, generate_sample_data
        detector = AnomalyDetector(contamination=0.1)
        training_data, _ = generate_sample_data(n_samples=100, anomaly_rate=0.1)
        detector.train(training_data, save_model=False)
        print(f"   ✅ Detector trained with {len(training_data)} samples")
        
        # Test 3: Monitor
        print("3️⃣ Testing Monitor...")
        from detector.monitor import CableMonitor
        monitor = CableMonitor(monitoring_interval=1.0)
        stats = monitor.get_monitoring_stats()
        print(f"   ✅ Monitor initialized, buffer: {stats['buffer_utilization']:.1%}")
        
        # Test 4: Dashboard
        print("4️⃣ Testing Dashboard...")
        from visualizer.dashboard import Dashboard
        dashboard = Dashboard(update_interval=1000)
        print(f"   ✅ Dashboard ready for launch")
        
        print("\n🎉 All components working perfectly!")
        print("🚀 Main system should be running with interactive dashboard")
        print("📊 Check for matplotlib window or dashboard interface")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = test_components()
    sys.exit(0 if success else 1) 