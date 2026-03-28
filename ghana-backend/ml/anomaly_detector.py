import torch
import torch.nn as nn
import numpy as np
from typing import List, Dict
import asyncio

class CostAutoencoder(nn.Module):
    """
    Autoencoder that learns normal AWS cost patterns.
    High reconstruction error = anomaly detected.
    """
    def __init__(self, input_dim: int = 5):
        super().__init__()
        # Encoder: compress cost features
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 32),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(32, 16),
            nn.ReLU(),
            nn.Linear(16, 8),
            nn.ReLU(),
            nn.Linear(8, 3)  # bottleneck
        )
        # Decoder: reconstruct cost features
        self.decoder = nn.Sequential(
            nn.Linear(3, 8),
            nn.ReLU(),
            nn.Linear(8, 16),
            nn.ReLU(),
            nn.Linear(16, 32),
            nn.ReLU(),
            nn.Linear(32, input_dim),
            nn.Sigmoid()
        )

    def forward(self, x):
        encoded = self.encoder(x)
        decoded = self.decoder(encoded)
        return decoded

class AnomalyDetector:
    def __init__(self):
        self.model = CostAutoencoder(input_dim=5)
        self.threshold = 0.05  # reconstruction error threshold
        self.scaler_min = None
        self.scaler_max = None
        self.is_trained = False
        self.device = torch.device(
            'cuda' if torch.cuda.is_available() else 'cpu'
        )
        self.model.to(self.device)

    def normalize(self, data: np.ndarray) -> np.ndarray:
        if self.scaler_min is None:
            self.scaler_min = data.min(axis=0)
            self.scaler_max = data.max(axis=0)
        range_ = self.scaler_max - self.scaler_min
        range_[range_ == 0] = 1
        return (data - self.scaler_min) / range_

    async def train(self, cost_data: List[Dict]):
        """Train on normal cost patterns asynchronously"""
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self._train_sync, cost_data)

    def _train_sync(self, cost_data: List[Dict]):
        # Extract features: EC2, Lambda, S3, RDS, CloudFront
        features = np.array([
            [d.get('EC2', 0), d.get('Lambda', 0), d.get('S3', 0), 
             d.get('RDS', 0), d.get('CloudFront', 0)]
            for d in cost_data
        ], dtype=np.float32)

        features = self.normalize(features)
        tensor = torch.FloatTensor(features).to(self.device)

        optimizer = torch.optim.Adam(
            self.model.parameters(), lr=0.001
        )
        criterion = nn.MSELoss()

        self.model.train()
        for epoch in range(200):  # fast training
            optimizer.zero_grad()
            output = self.model(tensor)
            loss = criterion(output, tensor)
            loss.backward()
            optimizer.step()

        # Set threshold as 95th percentile of training errors
        self.model.eval()
        with torch.no_grad():
            outputs = self.model(tensor)
            errors = torch.mean(
                (outputs - tensor) ** 2, dim=1
            ).cpu().numpy()
            self.threshold = float(np.percentile(errors, 95))

        self.is_trained = True

    async def detect(self, cost_point: Dict) -> Dict:
        """Detect if a cost point is anomalous"""
        if not self.is_trained:
            return {"is_anomaly": False, "score": 0.0, "confidence": 0}

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, self._detect_sync, cost_point
        )

    def _detect_sync(self, cost_point: Dict) -> Dict:
        features = np.array([[
            cost_point.get('EC2', 0),
            cost_point.get('Lambda', 0),
            cost_point.get('S3', 0),
            cost_point.get('RDS', 0),
            cost_point.get('CloudFront', 0)
        ]], dtype=np.float32)

        features = self.normalize(features)
        tensor = torch.FloatTensor(features).to(self.device)

        self.model.eval()
        with torch.no_grad():
            output = self.model(tensor)
            error = float(
                torch.mean((output - tensor) ** 2).item()
            )

        is_anomaly = error > self.threshold
        score = min(error / (self.threshold * 2), 1.0)
        confidence = int(score * 100)

        severity = 'Low'
        if score > 0.8: severity = 'Critical'
        elif score > 0.6: severity = 'High'
        elif score > 0.4: severity = 'Medium'

        return {
            "is_anomaly": is_anomaly,
            "score": round(score, 4),
            "confidence": confidence,
            "severity": severity,
            "reconstruction_error": round(error, 6)
        }

# Global instance
anomaly_detector = AnomalyDetector()
