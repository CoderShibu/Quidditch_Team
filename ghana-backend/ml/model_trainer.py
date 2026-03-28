from ml.anomaly_detector import anomaly_detector
from ml.cost_predictor import cost_predictor
from utils.mock_data import generate_cost_data
import asyncio

async def train_all_models():
    """Train all ML models asynchronously on startup"""
    print("Ghana AI: Training ML models...")
    
    # Generate 180 days of training data
    training_data = generate_cost_data(180)
    
    # Train both models concurrently
    await asyncio.gather(
        anomaly_detector.train(training_data),
        cost_predictor.train(training_data)
    )
    
    print("Ghana AI: All ML models trained and ready")
