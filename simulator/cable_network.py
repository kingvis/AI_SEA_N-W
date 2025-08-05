"""
Cable Network Simulator
Simulates underwater cable network behavior and generates synthetic data
"""

import numpy as np
import pandas as pd
import time
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional


class CableNetwork:
    """Simulates an underwater cable network with various parameters"""
    
    def __init__(self, num_cables: int = 5, num_sensors_per_cable: int = 10):
        """Initialize the cable network"""
        self.num_cables = num_cables
        self.num_sensors_per_cable = num_sensors_per_cable
        self.simulation_time = datetime.now()
        self.is_running = False
        
        # Initialize the cables dictionary
        self.cables = self._initialize_cables()
        
    def _initialize_cables(self) -> Dict:
        """Initialize cable network with default parameters"""
        cables = {}
        
        for cable_id in range(self.num_cables):
            # Generate cable properties
            cable_length = np.random.uniform(100, 2000)
            cable_depth = np.random.uniform(1000, 6000)
            cable_voltage = np.random.choice([220, 400, 500]) * 1000  # kV
            
            # Create cable entry
            cables[f"cable_{cable_id}"] = {
                "length_km": cable_length,
                "depth_m": cable_depth,
                "voltage_rating": cable_voltage,
                "sensors": self._create_sensors_for_cable(cable_id, cable_length),
                "status": "operational",
                "installation_date": datetime.now() - timedelta(days=np.random.randint(30, 1000))
            }
            
        return cables
    
    def _create_sensors_for_cable(self, cable_id: int, cable_length: float) -> Dict:
        """Create sensors for a specific cable"""
        sensors = {}
        
        for sensor_id in range(self.num_sensors_per_cable):
            sensor_position = (sensor_id + 1) * (cable_length / self.num_sensors_per_cable)
            sensor_type = np.random.choice(["temperature", "pressure", "vibration", "electrical"])
            
            sensors[f"sensor_{cable_id}_{sensor_id}"] = {
                "position_km": sensor_position,
                "type": sensor_type,
                "status": "active",
                "last_reading": None
            }
            
        return sensors
    
    def generate_sensor_data(self, cable_id: str, sensor_id: str, anomaly_prob: float = 0.05) -> Dict:
        """Generate realistic sensor data with optional anomalies"""
        if cable_id not in self.cables:
            raise ValueError(f"Cable {cable_id} not found")
            
        cable = self.cables[cable_id]
        
        if sensor_id not in cable["sensors"]:
            raise ValueError(f"Sensor {sensor_id} not found in cable {cable_id}")
            
        sensor = cable["sensors"][sensor_id]
        
        # Base values for different sensor types
        base_values = {
            "temperature": 4.0 + np.random.normal(0, 0.5),  # Deep sea temp ~4°C
            "pressure": cable["depth_m"] * 0.1 + np.random.normal(0, 2),  # Hydrostatic pressure
            "vibration": np.random.exponential(0.1),  # Low background vibration
            "electrical": cable["voltage_rating"] * (1 + np.random.normal(0, 0.01))  # Voltage
        }
        
        value = base_values[sensor["type"]]
        
        # Inject anomalies
        is_anomaly = np.random.random() < anomaly_prob
        if is_anomaly:
            if sensor["type"] == "temperature":
                value += np.random.uniform(5, 15)  # Temperature spike
            elif sensor["type"] == "pressure":
                value *= np.random.uniform(1.5, 3.0)  # Pressure increase
            elif sensor["type"] == "vibration":
                value += np.random.uniform(10, 50)  # High vibration
            elif sensor["type"] == "electrical":
                value *= np.random.uniform(0.7, 1.3)  # Voltage fluctuation
        
        return {
            "timestamp": self.simulation_time,
            "cable_id": cable_id,
            "sensor_id": sensor_id,
            "sensor_type": sensor["type"],
            "value": value,
            "position_km": sensor["position_km"],
            "depth_m": cable["depth_m"],
            "is_anomaly": is_anomaly
        }
    
    def simulate_step(self) -> List[Dict]:
        """Simulate one time step and return sensor readings"""
        readings = []
        
        for cable_id, cable_data in self.cables.items():
            for sensor_id, sensor_info in cable_data["sensors"].items():
                if sensor_info["status"] == "active":
                    reading = self.generate_sensor_data(cable_id, sensor_id)
                    readings.append(reading)
                    sensor_info["last_reading"] = reading["timestamp"]
        
        self.simulation_time += timedelta(minutes=1)
        return readings
    
    def get_network_status(self) -> Dict:
        """Get overall network status"""
        total_sensors = sum(len(cable["sensors"]) for cable in self.cables.values())
        active_sensors = sum(
            len([s for s in cable["sensors"].values() if s["status"] == "active"])
            for cable in self.cables.values()
        )
        
        return {
            "total_cables": len(self.cables),
            "total_sensors": total_sensors,
            "active_sensors": active_sensors,
            "simulation_time": self.simulation_time,
            "network_health": active_sensors / total_sensors if total_sensors > 0 else 0
        }
    
    def introduce_fault(self, cable_id: str, fault_type: str = "sensor_failure"):
        """Introduce a fault for testing purposes"""
        if cable_id not in self.cables:
            print(f"❌ Cable {cable_id} not found")
            return
            
        cable = self.cables[cable_id]
        
        if fault_type == "sensor_failure":
            # Randomly disable a sensor
            active_sensors = [sid for sid, sinfo in cable["sensors"].items() 
                            if sinfo["status"] == "active"]
            if active_sensors:
                sensor_to_fail = np.random.choice(active_sensors)
                cable["sensors"][sensor_to_fail]["status"] = "failed"
                print(f"⚠️ Sensor {sensor_to_fail} failed on {cable_id}")
            else:
                print(f"❌ No active sensors to fail on {cable_id}")
        
        elif fault_type == "cable_damage":
            cable["status"] = "damaged"
            # Disable all sensors on damaged cable
            for sensor_info in cable["sensors"].values():
                sensor_info["status"] = "failed"
            print(f"⚠️ Cable {cable_id} has been damaged")
    
    def repair_cable(self, cable_id: str):
        """Repair a cable and restore sensors"""
        if cable_id not in self.cables:
            print(f"❌ Cable {cable_id} not found")
            return
            
        cable = self.cables[cable_id]
        cable["status"] = "operational"
        
        # Restore all sensors
        for sensor_info in cable["sensors"].values():
            sensor_info["status"] = "active"
            
        print(f"✅ Cable {cable_id} repaired successfully")
    
    def get_cable_info(self, cable_id: str) -> Optional[Dict]:
        """Get information about a specific cable"""
        return self.cables.get(cable_id, None)
    
    def list_cables(self) -> List[str]:
        """Get list of all cable IDs"""
        return list(self.cables.keys())


# Example usage and testing
if __name__ == "__main__":
    print("🔌 Cable Network Simulator Demo")
    print("=" * 40)
    
    # Create network
    network = CableNetwork(num_cables=3, num_sensors_per_cable=5)
    
    # Show initial status
    status = network.get_network_status()
    print(f"📊 Network Status: {status}")
    print(f"📋 Cables: {network.list_cables()}")
    
    # Generate some sample data
    print("\n📊 Generating sample data...")
    for i in range(3):
        readings = network.simulate_step()
        print(f"Step {i+1}: Generated {len(readings)} sensor readings")
        if readings:
            sample_reading = readings[0]
            print(f"  Sample: {sample_reading['sensor_id']} = {sample_reading['value']:.2f} {sample_reading['sensor_type']}")
    
    # Test fault injection
    print("\n⚠️ Testing fault injection...")
    if network.list_cables():
        first_cable = network.list_cables()[0]
        network.introduce_fault(first_cable, "sensor_failure")
        
        # Check status after fault
        new_status = network.get_network_status()
        print(f"📊 Status after fault: {new_status}")
        
        # Repair the cable
        network.repair_cable(first_cable)
        
        # Final status
        final_status = network.get_network_status()
        print(f"📊 Final status: {final_status}")
    
    print("✅ Demo completed successfully!") 