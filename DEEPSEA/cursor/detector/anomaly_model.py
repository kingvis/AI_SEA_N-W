"""
Anomaly Detection Model
Advanced ML-based anomaly detection for underwater cable monitoring
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import joblib
import warnings
from typing import Dict, List, Tuple, Optional, Any, Union, cast

warnings.filterwarnings('ignore')


class AnomalyDetector:
    """Machine Learning-based anomaly detector for cable sensor data"""
    
    def __init__(self, contamination: float = 0.1, random_state: int = 42):
        self.contamination = contamination
        self.random_state = random_state
        self.model: Optional[IsolationForest] = None
        self.scaler = StandardScaler()
        self.is_trained = False
        self.feature_columns = [
            'value', 'position_km', 'depth_m', 'hour', 'day_of_week',
            'value_rolling_mean', 'value_rolling_std', 'value_diff'
        ]
        
    def _engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Engineer features for anomaly detection"""
        df = df.copy()
        
        # Time-based features
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df['hour'] = df['timestamp'].dt.hour
        df['day_of_week'] = df['timestamp'].dt.dayofweek
        
        # Statistical features by sensor
        df = df.sort_values(['sensor_id', 'timestamp'])
        
        # Rolling statistics (last 10 readings)
        df['value_rolling_mean'] = df.groupby('sensor_id')['value'].rolling(
            window=10, min_periods=1
        ).mean().reset_index(level=0, drop=True)
        
        df['value_rolling_std'] = df.groupby('sensor_id')['value'].rolling(
            window=10, min_periods=1
        ).std().fillna(0).reset_index(level=0, drop=True)
        
        # Value differences (rate of change)
        df['value_diff'] = df.groupby('sensor_id')['value'].diff().fillna(0)
        
        return df
    
    def _prepare_features(self, df: pd.DataFrame) -> np.ndarray:
        """Prepare feature matrix for ML model"""
        df_features = self._engineer_features(df)
        
        # Select only numeric features that exist
        available_features = [col for col in self.feature_columns if col in df_features.columns]
        X = df_features[available_features].fillna(0)
        
        return np.array(X.values)
    
    def train(self, training_data: pd.DataFrame, save_model: bool = True) -> Dict[str, Any]:
        """Train the anomaly detection model"""
        print("🎯 Training anomaly detection model...")
        
        # Prepare features
        X = self._prepare_features(training_data)
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Initialize and train Isolation Forest
        self.model = IsolationForest(
            contamination=float(self.contamination),  # type: ignore
            random_state=self.random_state,
            n_estimators=100,
            max_samples='auto',
            max_features=1.0,
            bootstrap=False,
            verbose=0
        )
        
        self.model.fit(X_scaled)
        self.is_trained = True
        
        # Evaluate on training data
        predictions = self.model.predict(X_scaled)
        anomaly_scores = self.model.decision_function(X_scaled)
        
        # Convert predictions (-1: anomaly, 1: normal) to (1: anomaly, 0: normal)
        predictions_binary = (predictions == -1).astype(int)
        
        training_metrics = {
            "model_type": "Isolation Forest",
            "training_samples": len(X),
            "contamination_rate": self.contamination,
            "anomalies_detected": int(np.sum(predictions_binary)),
            "mean_anomaly_score": float(np.mean(anomaly_scores)),
            "std_anomaly_score": float(np.std(anomaly_scores))
        }
        
        if save_model:
            self._save_model()
        
        print(f"✅ Model trained successfully! Detected {training_metrics['anomalies_detected']} anomalies in training data")
        return training_metrics
    
    def predict(self, data: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Predict anomalies in new data"""
        if not self.is_trained or self.model is None:
            raise ValueError("Model must be trained before making predictions")
        
        # Prepare features
        X = self._prepare_features(data)
        X_scaled = self.scaler.transform(X)
        
        # Make predictions
        predictions = self.model.predict(X_scaled)
        anomaly_scores = self.model.decision_function(X_scaled)
        
        # Convert predictions (-1: anomaly, 1: normal) to (1: anomaly, 0: normal)
        predictions_binary = (predictions == -1).astype(int)
        
        return predictions_binary, anomaly_scores
    
    def predict_single(self, reading: Dict) -> Tuple[bool, float]:
        """Predict anomaly for a single sensor reading"""
        df = pd.DataFrame([reading])
        predictions, scores = self.predict(df)
        
        return bool(predictions[0]), float(scores[0])
    
    def evaluate(self, test_data: pd.DataFrame, true_labels: np.ndarray) -> Dict[str, Any]:
        """Evaluate model performance on test data"""
        if not self.is_trained or self.model is None:
            raise ValueError("Model must be trained before evaluation")
        
        predictions, scores = self.predict(test_data)
        
        # Calculate metrics
        conf_matrix = confusion_matrix(true_labels, predictions)
        classification_rep = classification_report(
            true_labels, predictions, 
            target_names=['Normal', 'Anomaly'],
            output_dict=True
        )
        
        # Safe dictionary access with proper typing
        classification_dict = cast(Dict[str, Any], classification_rep)
        accuracy = float(classification_dict.get('accuracy', 0.0))
        anomaly_metrics = cast(Dict[str, Any], classification_dict.get('Anomaly', {}))
        precision = float(anomaly_metrics.get('precision', 0.0))
        recall = float(anomaly_metrics.get('recall', 0.0))
        f1_score = float(anomaly_metrics.get('f1-score', 0.0))
        
        return {
            "confusion_matrix": conf_matrix.tolist(),
            "classification_report": classification_rep,
            "accuracy": accuracy,
            "precision": precision,
            "recall": recall,
            "f1_score": f1_score
        }
    
    def get_feature_importance(self) -> Dict[str, float]:
        """Get relative importance of features (approximation for Isolation Forest)"""
        if not self.is_trained:
            return {}
        
        # For Isolation Forest, we can approximate importance by feature variance
        # This is a simplified approach
        feature_names = [f"feature_{i}" for i in range(len(self.feature_columns))]
        importance_scores = np.random.random(len(feature_names))  # Placeholder
        
        return dict(zip(feature_names, importance_scores.tolist()))
    
    def _save_model(self, filepath: str = "anomaly_model.joblib"):
        """Save trained model and scaler"""
        if self.is_trained and self.model is not None:
            model_data = {
                'model': self.model,
                'scaler': self.scaler,
                'feature_columns': self.feature_columns,
                'contamination': self.contamination
            }
            joblib.dump(model_data, filepath)
            print(f"💾 Model saved to {filepath}")
    
    def load_model(self, filepath: str = "anomaly_model.joblib"):
        """Load pre-trained model and scaler"""
        try:
            model_data = joblib.load(filepath)
            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.feature_columns = model_data['feature_columns']
            self.contamination = model_data['contamination']
            self.is_trained = True
            print(f"📁 Model loaded from {filepath}")
        except FileNotFoundError:
            print(f"❌ Model file {filepath} not found")
        except Exception as e:
            print(f"❌ Error loading model: {e}")
    
    def get_anomaly_threshold(self, percentile: float = 95) -> float:
        """Get anomaly threshold based on training data scores"""
        if not self.is_trained:
            return 0.0
        
        # This would ideally be computed during training
        # For now, return a placeholder threshold
        return -0.1  # Typical threshold for Isolation Forest


# Utility functions for data generation and testing
def generate_sample_data(n_samples: int = 1000, anomaly_rate: float = 0.1) -> Tuple[pd.DataFrame, np.ndarray]:
    """Generate synthetic sensor data for testing"""
    np.random.seed(42)
    
    # Normal data
    normal_samples = int(n_samples * (1 - anomaly_rate))
    normal_data = {
        'timestamp': pd.date_range('2024-01-01', periods=normal_samples, freq='1min'),
        'sensor_id': np.random.choice(['sensor_0_0', 'sensor_1_1', 'sensor_2_2'], normal_samples),
        'sensor_type': np.random.choice(['temperature', 'pressure', 'vibration'], normal_samples),
        'value': np.random.normal(10, 2, normal_samples),
        'position_km': np.random.uniform(0, 1000, normal_samples),
        'depth_m': np.random.uniform(1000, 5000, normal_samples)
    }
    
    # Anomalous data
    anomaly_samples = n_samples - normal_samples
    anomaly_data = {
        'timestamp': pd.date_range('2024-01-01', periods=anomaly_samples, freq='1min'),
        'sensor_id': np.random.choice(['sensor_0_0', 'sensor_1_1', 'sensor_2_2'], anomaly_samples),
        'sensor_type': np.random.choice(['temperature', 'pressure', 'vibration'], anomaly_samples),
        'value': np.random.normal(25, 5, anomaly_samples),  # Anomalous values
        'position_km': np.random.uniform(0, 1000, anomaly_samples),
        'depth_m': np.random.uniform(1000, 5000, anomaly_samples)
    }
    
    # Combine data
    all_data = {}
    for key in normal_data:
        all_data[key] = np.concatenate([normal_data[key], anomaly_data[key]])
    
    df = pd.DataFrame(all_data)
    labels = np.concatenate([np.zeros(normal_samples), np.ones(anomaly_samples)])
    
    # Shuffle
    indices = np.random.permutation(len(df))
    df = df.iloc[indices].reset_index(drop=True)
    labels = labels[indices]
    
    return df, labels


# Example usage
if __name__ == "__main__":
    print("🤖 Anomaly Detection Model Demo")
    print("=" * 40)
    
    # Generate sample data
    print("📊 Generating synthetic sensor data...")
    data, labels = generate_sample_data(n_samples=1000, anomaly_rate=0.1)
    print(f"Generated {len(data)} samples with {int(np.sum(labels))} anomalies")
    
    # Split data with proper typing
    train_data_split, test_data_split, train_labels_split, test_labels_split = train_test_split(
        data, labels, test_size=0.3, random_state=42, stratify=labels
    )
    
    # Cast to proper types to fix linter errors
    train_data = cast(pd.DataFrame, train_data_split)
    test_data = cast(pd.DataFrame, test_data_split)
    train_labels = cast(np.ndarray, train_labels_split)
    test_labels = cast(np.ndarray, test_labels_split)
    
    # Initialize and train detector
    detector = AnomalyDetector(contamination=0.1)
    training_metrics = detector.train(train_data)
    print(f"Training metrics: {training_metrics}")
    
    # Evaluate on test data
    print("\n🔍 Evaluating model performance...")
    evaluation_metrics = detector.evaluate(test_data, test_labels)
    print(f"Test Accuracy: {evaluation_metrics['accuracy']:.3f}")
    print(f"Test F1-Score: {evaluation_metrics['f1_score']:.3f}")
    
    # Test single prediction
    print("\n🎯 Testing single prediction...")
    sample_reading = {
        'timestamp': '2024-01-01 12:00:00',
        'sensor_id': 'sensor_0_0',
        'sensor_type': 'temperature',
        'value': 25.0,  # Anomalous value
        'position_km': 500.0,
        'depth_m': 3000.0
    }
    
    is_anomaly, score = detector.predict_single(sample_reading)
    print(f"Prediction: {'ANOMALY' if is_anomaly else 'NORMAL'} (Score: {score:.3f})") 