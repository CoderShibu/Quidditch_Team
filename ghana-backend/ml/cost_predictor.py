import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from typing import List, Dict
import asyncio
from datetime import datetime, timedelta

class CostPredictor:
    """
    Predicts future AWS costs using Gradient Boosting.
    Trained on historical daily cost data.
    """
    def __init__(self):
        self.models = {}  # one model per service
        self.services = ['EC2', 'Lambda', 'S3', 'RDS', 'CloudFront']
        self.is_trained = False

    def _make_features(self, df: pd.DataFrame) -> np.ndarray:
        """Extract time features for prediction"""
        features = pd.DataFrame({
            'day_of_week': pd.to_datetime(df['date']).dt.dayofweek,
            'day_of_month': pd.to_datetime(df['date']).dt.day,
            'month': pd.to_datetime(df['date']).dt.month,
            'week_of_year': pd.to_datetime(df['date']).dt.isocalendar().week,
            'is_weekend': (pd.to_datetime(df['date']).dt.dayofweek >= 5).astype(int),
        })
        # Add lag features (yesterday, 7 days ago)
        for service in self.services:
            if service in df.columns:
                features[f'{service}_lag1'] = df[service].shift(1).fillna(df[service].mean())
                features[f'{service}_lag7'] = df[service].shift(7).fillna(df[service].mean())
                features[f'{service}_rolling7'] = df[service].rolling(7, min_periods=1).mean()
        return features.values

    async def train(self, cost_data: List[Dict]):
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self._train_sync, cost_data)

    def _train_sync(self, cost_data: List[Dict]):
        df = pd.DataFrame(cost_data)
        X = self._make_features(df)

        for service in self.services:
            if service not in df.columns:
                continue
            y = df[service].values
            pipeline = Pipeline([
                ('scaler', StandardScaler()),
                ('model', GradientBoostingRegressor(
                    n_estimators=100,
                    learning_rate=0.1,
                    max_depth=4,
                    random_state=42
                ))
            ])
            pipeline.fit(X[1:], y[1:])  # skip first row (no lag)
            self.models[service] = pipeline

        self.is_trained = True

    async def predict_next_days(
        self, cost_data: List[Dict], days: int = 7
    ) -> List[Dict]:
        if not self.is_trained:
            return self._fallback_prediction(cost_data, days)

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, self._predict_sync, cost_data, days
        )

    def _predict_sync(
        self, cost_data: List[Dict], days: int
    ) -> List[Dict]:
        df = pd.DataFrame(cost_data)
        predictions = []
        last_date = pd.to_datetime(df['date'].iloc[-1])

        for i in range(1, days + 1):
            future_date = last_date + timedelta(days=i)
            future_df = pd.DataFrame([{
                'date': future_date.strftime('%Y-%m-%d'),
                **{s: df[s].iloc[-1] for s in self.services if s in df}
            }])
            # Append to df for lag features
            df = pd.concat([df, future_df], ignore_index=True)
            X = self._make_features(df)
            pred = {'date': future_date.strftime('%Y-%m-%d'), 
                    'predicted': True}

            for service in self.services:
                if service in self.models:
                    val = self.models[service].predict(X[-1:])[0]
                    pred[service] = max(0, round(float(val), 2))
                    df.loc[df.index[-1], service] = pred[service]

            predictions.append(pred)

        return predictions

    def _fallback_prediction(
        self, cost_data: List[Dict], days: int
    ) -> List[Dict]:
        last = cost_data[-1]
        last_date = datetime.strptime(last['date'], '%Y-%m-%d')
        predictions = []
        for i in range(1, days + 1):
            future = last_date + timedelta(days=i)
            predictions.append({
                'date': future.strftime('%Y-%m-%d'),
                'predicted': True,
                'EC2': round(last.get('EC2', 80) * (1 + np.random.uniform(-0.05, 0.05)), 2),
                'Lambda': round(last.get('Lambda', 15) * (1 + np.random.uniform(-0.05, 0.05)), 2),
                'S3': round(last.get('S3', 6) * (1 + np.random.uniform(-0.02, 0.02)), 2),
                'RDS': round(last.get('RDS', 30) * (1 + np.random.uniform(-0.04, 0.04)), 2),
                'CloudFront': round(last.get('CloudFront', 5) * (1 + np.random.uniform(-0.03, 0.03)), 2),
            })
        return predictions

cost_predictor = CostPredictor()
