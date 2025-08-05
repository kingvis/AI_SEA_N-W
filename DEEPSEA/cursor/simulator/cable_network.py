"""
Cable Network Simulator - Clean Implementation
"""

import numpy as np
import pandas as pd
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional


class CableNetwork:
    """Simulates an underwater cable network"""
    
    def __init__(self, num_cables: int = 5, num_sensors_per_cable: int = 10):
        self.num_cables = num_cables
        self.num_sensors_per_cable = num_sensors_per_cable
        self.simulation_time = datetime.now()
        self.is_running = False
        self.cables = self._create_network()
        
    def _create_network(self) -> Dict:
        """Create the complete cable network"""
        network = {}
        
        for cable_id in range(self.num_cables):
            cable_name = f"cable_{cable_id}"
            cable_length = np.random.uniform(100, 2000)
            cable_depth = np.random.uniform(1000, 6000)
            
            # Create sensors for this cable
            sensors = {}
            for sensor_id in range(self.num_sensors_per_cable):
                sensor_name = f"sensor_{cable_id}_{sensor_id}"
                sensors[sensor_name] = {
                    "position_km": (sensor_id + 1) * (cable_length / self.num_sensors_per_cable),
                    "type": np.random.choice(["temperature", "pressure", "vibration", "electrical"]),
                    "status": "active",
                    "last_reading": None
                }
            
            # Create cable
            network[cable_name] = {
                "length_km": cable_length,
                "depth_m": cable_depth,
                "voltage_rating": np.random.choice([220, 400, 500]) * 1000,
                "sensors": sensors,
                "status": "operational",
                "installation_date": datetime.now() - timedelta(days=np.random.randint(30, 1000))
            }
            
        return network
    
    def generate_sensor_data(self, cable_id: str, sensor_id: str, anomaly_prob: float = 0.05) -> Dict:
        """Generate sensor reading"""
        cable = self.cables[cable_id]
        sensor = cable["sensors"][sensor_id]
        
        # Base values
        base_values = {
            "temperature": 4.0 + np.random.normal(0, 0.5),
            "pressure": cable["depth_m"] * 0.1 + np.random.normal(0, 2),
            "vibration": np.random.exponential(0.1),
            "electrical": cable["voltage_rating"] * (1 + np.random.normal(0, 0.01))
        }
        
        value = base_values[sensor["type"]]
        
        # Add anomalies
        is_anomaly = np.random.random() < anomaly_prob
        if is_anomaly:
            if sensor["type"] == "temperature":
                value += np.random.uniform(5, 15)
            elif sensor["type"] == "pressure":
                value *= np.random.uniform(1.5, 3.0)
            elif sensor["type"] == "vibration":
                value += np.random.uniform(10, 50)
            elif sensor["type"] == "electrical":
                value *= np.random.uniform(0.7, 1.3)
        
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
        """Generate readings for all active sensors"""
        readings = []
        
        for cable_id, cable in self.cables.items():
            for sensor_id, sensor in cable["sensors"].items():
                if sensor["status"] == "active":
                    reading = self.generate_sensor_data(cable_id, sensor_id)
                    readings.append(reading)
        
        self.simulation_time += timedelta(minutes=1)
        return readings
    
    def get_network_status(self) -> Dict:
        """Get network statistics"""
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
        """Introduce a fault"""
        if cable_id not in self.cables:
            return
            
        cable = self.cables[cable_id]
        
        if fault_type == "sensor_failure":
            active_sensors = [sid for sid, s in cable["sensors"].items() if s["status"] == "active"]
            if active_sensors:
                sensor_to_fail = np.random.choice(active_sensors)
                cable["sensors"][sensor_to_fail]["status"] = "failed"
                print(f"⚠️ Sensor {sensor_to_fail} failed")
        elif fault_type == "cable_damage":
            cable["status"] = "damaged"
            for sensor in cable["sensors"].values():
                sensor["status"] = "failed"
            print(f"⚠️ Cable {cable_id} damaged")
    
    def repair_cable(self, cable_id: str):
        """Repair a cable"""
        if cable_id in self.cables:
            cable = self.cables[cable_id]
            cable["status"] = "operational"
            for sensor in cable["sensors"].values():
                sensor["status"] = "active"
            print(f"✅ Cable {cable_id} repaired")


if __name__ == "__main__":
    print("🔌 Testing Cable Network")
    network = CableNetwork(2, 3)
    status = network.get_network_status()
    print(f"✅ Network: {status['total_cables']} cables, {status['total_sensors']} sensors")
    
    readings = network.simulate_step()
    print(f"✅ Generated {len(readings)} readings")
    
    if network.cables:
        first_cable = list(network.cables.keys())[0]
        network.introduce_fault(first_cable)
        
    print("✅ Test completed successfully!") 