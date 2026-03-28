import random
from datetime import datetime, timedelta

def generate_cost_data(days: int) -> list:
    data = []
    base = {
        'EC2': 80, 'Lambda': 15, 
        'S3': 6, 'RDS': 30, 'CloudFront': 5
    }
    for i in range(days, 0, -1):
        date = (datetime.now() - timedelta(days=i))
        is_weekend = date.weekday() >= 5
        multiplier = 0.6 if is_weekend else 1.0
        # Add realistic patterns
        if date.day in [1, 15]:  # billing spikes
            multiplier *= 1.3
        data.append({
            'date': date.strftime('%Y-%m-%d'),
            'EC2': round(base['EC2'] * multiplier * 
                        (1 + random.uniform(-0.15, 0.2)), 2),
            'Lambda': round(base['Lambda'] * multiplier * 
                           (1 + random.uniform(-0.2, 0.4)), 2),
            'S3': round(base['S3'] * 
                       (1 + random.uniform(-0.05, 0.08)), 2),
            'RDS': round(base['RDS'] * multiplier * 
                        (1 + random.uniform(-0.1, 0.15)), 2),
            'CloudFront': round(base['CloudFront'] * 
                               (1 + random.uniform(-0.1, 0.2)), 2),
        })
    return data
