#!/usr/bin/env python3
"""
Test Script for CableGuard AI System
Verifies all components work correctly
"""

import sys
import os

# Add project directories to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'simulator'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'detector'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'visualizer'))

try:
    from simulator.cable_network import CableNetwork
    from detector.anomaly_model import AnomalyDetector, generate_sample_data  # type: ignore
    from detector.monitor import CableMonitor  # type: ignore
    print("✅ All imports successful!")
except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)


def test_cable_network():
    """Test cable network functionality"""
    print("\n🔌 Testing Cable Network...")
    try:
        network = CableNetwork(num_cables=2, num_sensors_per_cable=3)
        status = network.get_network_status()
        print(f"✅ Network created: {status['total_cables']} cables, {status['total_sensors']} sensors")
        
        # Generate some readings
        readings = network.simulate_step()
        print(f"✅ Generated {len(readings)} sensor readings")
        
        # Test fault injection
        network.introduce_fault("cable_0", "sensor_failure")
        print("✅ Fault injection successful")
        
        return True
    except Exception as e:
        print(f"❌ Cable network test failed: {e}")
        return False


def test_anomaly_detector():
    """Test anomaly detection functionality"""
    print("\n🤖 Testing Anomaly Detector...")
    try:
        detector = AnomalyDetector(contamination=0.1)
        
        # Generate training data
        training_data, labels = generate_sample_data(n_samples=200, anomaly_rate=0.1)
        print(f"✅ Generated {len(training_data)} training samples")
        
        # Train the model
        metrics = detector.train(training_data, save_model=False)
        print(f"✅ Model trained: {metrics['anomalies_detected']} anomalies detected in training")
        
        # Test prediction
        test_reading = {
            'timestamp': '2024-01-01 12:00:00',
            'sensor_id': 'sensor_0_0',
            'sensor_type': 'temperature',
            'value': 25.0,
            'position_km': 500.0,
            'depth_m': 3000.0
        }
        
        is_anomaly, score = detector.predict_single(test_reading)
        print(f"✅ Single prediction: {'ANOMALY' if is_anomaly else 'NORMAL'} (Score: {score:.3f})")
        
        return True
    except Exception as e:
        print(f"❌ Anomaly detector test failed: {e}")
        return False


def test_monitor():
    """Test monitoring system functionality"""
    print("\n📡 Testing Monitor...")
    try:
        monitor = CableMonitor(monitoring_interval=0.1)
        
        # Test callbacks
        anomaly_count = 0
        alert_count = 0
        
        def anomaly_callback(event):
            nonlocal anomaly_count
            anomaly_count += 1
        
        def alert_callback(alert):
            nonlocal alert_count
            alert_count += 1
        
        monitor.add_callback('on_anomaly', anomaly_callback)
        monitor.add_callback('on_alert', alert_callback)
        print("✅ Callbacks added successfully")
        
        # Test statistics
        stats = monitor.get_monitoring_stats()
        print(f"✅ Got monitoring stats: {stats['total_readings']} readings processed")
        
        return True
    except Exception as e:
        print(f"❌ Monitor test failed: {e}")
        return False


def test_integration():
    """Test integrated system functionality"""
    print("\n🔄 Testing System Integration...")
    try:
        # Create components
        network = CableNetwork(num_cables=1, num_sensors_per_cable=2)
        detector = AnomalyDetector(contamination=0.1)
        monitor = CableMonitor(monitoring_interval=0.1)
        
        # Train detector
        training_data, _ = generate_sample_data(n_samples=100, anomaly_rate=0.1)
        detector.train(training_data, save_model=False)
        
        # Start monitoring briefly
        monitor.start_monitoring(network, detector, background=False)
        
        # Simulate a few steps
        for i in range(3):
            readings = network.simulate_step()
            monitor._process_readings(readings)
        
        # Stop monitoring
        monitor.stop_monitoring()
        
        stats = monitor.get_monitoring_stats()
        print(f"✅ Integration test complete: {stats['total_readings']} readings, {stats['anomalies_detected']} anomalies")
        
        return True
    except Exception as e:
        print(f"❌ Integration test failed: {e}")
        return False


def main():
    """Run all tests"""
    print("🧪 CableGuard AI System Tests")
    print("=" * 40)
    
    tests = [
        test_cable_network,
        test_anomaly_detector,
        test_monitor,
        test_integration
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
    
    print(f"\n📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! System is ready to use.")
        print("\n🚀 To run the full system, execute: python main.py")
    else:
        print("❌ Some tests failed. Please check the errors above.")
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main()) 