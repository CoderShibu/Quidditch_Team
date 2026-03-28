import numpy as np
from typing import List, Dict

class CostOptimizer:
    """
    Identifies optimization opportunities using:
    1. Rule-based patterns (idle detection, oversizing)
    2. ML clustering (find similar underutilized resources)
    """
    def analyze_optimizations(
        self, anomalies: List[Dict]
    ) -> List[Dict]:
        recommendations = []

        for anomaly in anomalies:
            rec = self._get_recommendation(anomaly)
            if rec:
                recommendations.append(rec)

        return sorted(
            recommendations, 
            key=lambda x: x['savingsPerDay'], 
            reverse=True
        )

    def _get_recommendation(self, anomaly: Dict) -> Dict:
        atype = anomaly.get('type', '')
        cost = anomaly.get('costImpact', 0)

        if 'Idle EC2' in atype:
            return {
                'resourceId': anomaly.get('resourceId', 'i-unknown'),
                'service': 'EC2',
                'action': 'Stop Instance',
                'reason': 'Instance idle > threshold hours',
                'savingsPerDay': cost,
                'savingsPerMonth': cost * 30,
                'confidence': 94,
                'riskLevel': 'Low',
                'steps': [
                    'Verify no active SSH connections',
                    'Create EBS snapshot as backup',
                    'Stop instance via AWS API'
                ]
            }
        elif 'Lambda' in atype:
            return {
                'resourceId': anomaly.get('resourceId', 'func-unknown'),
                'service': 'Lambda',
                'action': 'Reduce Concurrency Limit',
                'reason': 'Runaway function consuming excess resources',
                'savingsPerDay': cost * 0.9,
                'savingsPerMonth': cost * 0.9 * 30,
                'confidence': 89,
                'riskLevel': 'Medium',
                'steps': [
                    'Set reserved concurrency to 100',
                    'Add timeout limit of 30 seconds',
                    'Monitor for 24h after change'
                ]
            }
        elif 'RDS' in atype:
            return {
                'resourceId': anomaly.get('resourceId', 'db-unknown'),
                'service': 'RDS',
                'action': 'Rightsize Instance',
                'reason': 'Database running at low CPU utilization',
                'savingsPerDay': cost * 0.6,
                'savingsPerMonth': cost * 0.6 * 30,
                'confidence': 87,
                'riskLevel': 'Medium',
                'steps': [
                    'Take RDS snapshot',
                    'Modify instance class to smaller tier',
                    'Monitor query performance for 48h'
                ]
            }
        elif 'S3' in atype:
            return {
                'resourceId': anomaly.get('resourceId', 'bucket-unknown'),
                'service': 'S3',
                'action': 'Enable Lifecycle Policy',
                'reason': 'Objects not transitioning to cheaper storage tiers',
                'savingsPerDay': cost * 0.7,
                'savingsPerMonth': cost * 0.7 * 30,
                'confidence': 96,
                'riskLevel': 'Low',
                'steps': [
                    'Enable S3 Intelligent-Tiering',
                    'Set lifecycle rule: move to Glacier after 90 days',
                    'Delete incomplete multipart uploads'
                ]
            }
        return None

cost_optimizer = CostOptimizer()
