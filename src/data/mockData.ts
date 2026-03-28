export interface CostDataPoint {
 date: string;
 cost: number;
 predicted?: number;
}

export interface ServiceCost {
 service: string;
 cost: number;
 color: string;
}

export interface Anomaly {
 id: string;
 type: 'idle-instance' | 'runaway-lambda' | 'traffic-spike';
 title: string;
 description: string;
 severity: 'critical' | 'high' | 'medium' | 'low';
 service: string;
 resourceId: string;
 region: string;
 costImpact: number;
 detectedAt: string;
 status: 'open' | 'investigating' | 'resolved';
}

export interface Alert {
 id: string;
 anomalyId: string;
 type: string;
 resourceId: string;
 region: string;
 costImpact: number;
 severity: 'critical' | 'high' | 'medium' | 'low';
 actionTaken: string;
 timestamp: string;
 resolved: boolean;
 snoozed: boolean;
}

export interface Optimization {
 id: string;
 date: string;
 service: string;
 resourceId: string;
 action: string;
 costBefore: number;
 costAfter: number;
 totalSavings: number;
 status: 'completed' | 'in-progress' | 'failed';
}

// 6 months cost data
const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
export const monthlyCostData: CostDataPoint[] = [
 { date: '2025-10', cost: 12450 },
 { date: '2025-11', cost: 13200 },
 { date: '2025-12', cost: 14800 },
 { date: '2026-01', cost: 13900 },
 { date: '2026-02', cost: 15200 },
 { date: '2026-03', cost: 11750 },
];

export const dailyCostData: CostDataPoint[] = Array.from({ length: 30 }, (_, i) => ({
 date: `Mar ${i + 1}`,
 cost: 350 + Math.sin(i * 0.5) * 120 + Math.random() * 80,
 predicted: i > 22 ? 380 + Math.sin(i * 0.5) * 100 : undefined,
}));

export const weeklyCostData: CostDataPoint[] = Array.from({ length: 7 }, (_, i) => {
 const d = new Date(2026, 2, 22 + i);
 return {
 date: d.toLocaleDateString('en-US', { weekday: 'short' }),
 cost: 340 + Math.random() * 150,
 };
});

export const serviceCosts: ServiceCost[] = [
 { service: 'EC2', cost: 4820, color: '#cc4444' },
 { service: 'Lambda', cost: 2150, color: '#aa5454' },
 { service: 'S3', cost: 1340, color: '#993333' },
 { service: 'RDS', cost: 2640, color: '#d8b0b0' },
 { service: 'CloudFront', cost: 800, color: '#c58a8a' },
];

export const anomalies: Anomaly[] = [
 { id: 'ANM-001', type: 'idle-instance', title: 'Idle EC2 Instance Detected', description: 'Instance i-0a1b2c3d has been idle for 72+ hours with <2% CPU utilization.', severity: 'high', service: 'EC2', resourceId: 'i-0a1b2c3d', region: 'us-east-1', costImpact: 18.50, detectedAt: '2026-03-27T14:30:00Z', status: 'open' },
 { id: 'ANM-002', type: 'runaway-lambda', title: 'Runaway Lambda Function', description: 'Function "process-orders"concurrency spiked from 50 to 800, costs surging.', severity: 'critical', service: 'Lambda', resourceId: 'process-orders', region: 'us-west-2', costImpact: 47.20, detectedAt: '2026-03-27T09:15:00Z', status: 'investigating' },
 { id: 'ANM-003', type: 'traffic-spike', title: 'Traffic Spike — Flash Sale Event', description: 'CloudFront requests 15x normal. Correlated with marketing campaign launch.', severity: 'medium', service: 'CloudFront', resourceId: 'd-cf789xyz', region: 'global', costImpact: 32.00, detectedAt: '2026-03-26T18:00:00Z', status: 'open' },
 { id: 'ANM-004', type: 'idle-instance', title: 'Unused RDS Instance', description: 'db-analytics-staging has 0 connections for 5 days.', severity: 'high', service: 'RDS', resourceId: 'db-analytics-staging', region: 'eu-west-1', costImpact: 28.40, detectedAt: '2026-03-25T10:00:00Z', status: 'open' },
 { id: 'ANM-005', type: 'runaway-lambda', title: 'Recursive Lambda Invocation', description: 'Function "image-resize"calling itself recursively, 12,000 invocations/min.', severity: 'critical', service: 'Lambda', resourceId: 'image-resize', region: 'us-east-1', costImpact: 89.00, detectedAt: '2026-03-25T03:20:00Z', status: 'resolved' },
 { id: 'ANM-006', type: 'idle-instance', title: 'Dev EC2 Left Running', description: 'Instance i-dev99887 (m5.xlarge) running over weekend with no SSH sessions.', severity: 'medium', service: 'EC2', resourceId: 'i-dev99887', region: 'us-east-1', costImpact: 12.80, detectedAt: '2026-03-24T08:00:00Z', status: 'resolved' },
 { id: 'ANM-007', type: 'traffic-spike', title: 'S3 Transfer Spike', description: 'Outbound transfer from s3://data-exports jumped 400% — possible misconfigured job.', severity: 'high', service: 'S3', resourceId: 's3://data-exports', region: 'us-east-1', costImpact: 55.60, detectedAt: '2026-03-23T16:45:00Z', status: 'investigating' },
 { id: 'ANM-008', type: 'idle-instance', title: 'Oversized EC2 Instance', description: 'Instance i-bigbox01 (r5.4xlarge) averaging 8% CPU — candidate for rightsizing.', severity: 'medium', service: 'EC2', resourceId: 'i-bigbox01', region: 'ap-southeast-1', costImpact: 22.10, detectedAt: '2026-03-22T12:00:00Z', status: 'open' },
 { id: 'ANM-009', type: 'runaway-lambda', title: 'Lambda Memory Over-provisioned', description: 'Function "auth-verify"allocated 3GB but uses max 256MB.', severity: 'low', service: 'Lambda', resourceId: 'auth-verify', region: 'us-west-2', costImpact: 5.40, detectedAt: '2026-03-21T09:30:00Z', status: 'open' },
 { id: 'ANM-010', type: 'traffic-spike', title: 'Bot Traffic on CloudFront', description: 'Detected bot traffic pattern causing 3x normal request volume.', severity: 'high', service: 'CloudFront', resourceId: 'd-cf123abc', region: 'global', costImpact: 41.00, detectedAt: '2026-03-20T22:00:00Z', status: 'resolved' },
 { id: 'ANM-011', type: 'idle-instance', title: 'Forgotten Staging RDS', description: 'RDS instance "staging-mysql"idle for 14 days.', severity: 'medium', service: 'RDS', resourceId: 'staging-mysql', region: 'us-east-1', costImpact: 15.20, detectedAt: '2026-03-19T07:00:00Z', status: 'open' },
 { id: 'ANM-012', type: 'runaway-lambda', title: 'Cold Start Cost Surge', description: 'Function "api-gateway-handler"cold starts increased 500% after deployment.', severity: 'medium', service: 'Lambda', resourceId: 'api-gateway-handler', region: 'us-east-1', costImpact: 8.70, detectedAt: '2026-03-18T14:15:00Z', status: 'investigating' },
];

export const alerts: Alert[] = anomalies.map((a, i) => ({
 id: `ALT-${String(i + 1).padStart(3, '0')}`,
 anomalyId: a.id,
 type: a.type === 'idle-instance' ? 'Idle Resource' : a.type === 'runaway-lambda' ? 'Cost Surge' : 'Traffic Anomaly',
 resourceId: a.resourceId,
 region: a.region,
 costImpact: a.costImpact,
 severity: a.severity,
 actionTaken: a.status === 'resolved' ? 'Auto-optimized' : a.status === 'investigating' ? 'Under review' : 'Pending',
 timestamp: a.detectedAt,
 resolved: a.status === 'resolved',
 snoozed: false,
}));

export const optimizations: Optimization[] = [
 { id: 'OPT-001', date: '2026-03-27', service: 'EC2', resourceId: 'i-0a1b2c3d', action: 'Stopped idle instance', costBefore: 18.50, costAfter: 0, totalSavings: 555, status: 'completed' },
 { id: 'OPT-002', date: '2026-03-25', service: 'Lambda', resourceId: 'image-resize', action: 'Fixed recursive invocation, set concurrency limit to 100', costBefore: 89.00, costAfter: 4.20, totalSavings: 2544, status: 'completed' },
 { id: 'OPT-003', date: '2026-03-24', service: 'EC2', resourceId: 'i-dev99887', action: 'Stopped weekend dev instance', costBefore: 12.80, costAfter: 0, totalSavings: 25.60, status: 'completed' },
 { id: 'OPT-004', date: '2026-03-22', service: 'EC2', resourceId: 'i-bigbox01', action: 'Rightsized from r5.4xlarge to r5.xlarge', costBefore: 22.10, costAfter: 5.50, totalSavings: 498, status: 'completed' },
 { id: 'OPT-005', date: '2026-03-20', service: 'CloudFront', resourceId: 'd-cf123abc', action: 'Deployed WAF bot protection rules', costBefore: 41.00, costAfter: 12.00, totalSavings: 870, status: 'completed' },
 { id: 'OPT-006', date: '2026-03-19', service: 'Lambda', resourceId: 'auth-verify', action: 'Reduced memory from 3GB to 512MB', costBefore: 5.40, costAfter: 0.90, totalSavings: 135, status: 'in-progress' },
 { id: 'OPT-007', date: '2026-03-18', service: 'RDS', resourceId: 'staging-mysql', action: 'Scheduled auto-stop after 2hr idle', costBefore: 15.20, costAfter: 3.00, totalSavings: 366, status: 'completed' },
 { id: 'OPT-008', date: '2026-03-15', service: 'S3', resourceId: 's3://data-exports', action: 'Added lifecycle policy, moved to Glacier after 30d', costBefore: 8.40, costAfter: 1.20, totalSavings: 216, status: 'completed' },
];

export const dashboardMetrics = {
 totalCostThisMonth: 11750,
 totalSaved: 5210.60,
 savingsPercentage: 30.7,
 totalAnomalies: 34,
 criticalAnomalies: 5,
 highAnomalies: 12,
 mediumAnomalies: 11,
 lowAnomalies: 6,
 optimizationsExecuted: 28,
 optimizationSuccessRate: 92,
 budget: 15000,
 burnRate: 391.67,
};

export const aiInsights = [
 "Your EC2 spend decreased 18% this week after rightsizing 3 instances. Keep monitoring i-bigbox01 for further optimization.",
 "Lambda costs are trending 12% above last month. Consider reviewing concurrency limits on 'process-orders' function.",
 "You could save an additional $320/month by converting 2 on-demand EC2 instances to Reserved Instances.",
 "S3 lifecycle policies saved $216 last month. Consider applying similar rules to 3 more buckets.",
 "CloudFront WAF rules reduced bot traffic costs by 71%. Similar patterns detected on distribution d-cf789xyz.",
];

export const anomalyTrendData = Array.from({ length: 14 }, (_, i) => ({
 date: `Mar ${i + 15}`,
 count: Math.floor(Math.random() * 5) + 1,
 critical: Math.floor(Math.random() * 2),
 high: Math.floor(Math.random() * 3),
}));

export const sparklineData = {
 cost: [420, 380, 450, 410, 390, 430, 370, 410, 350, 391],
 savings: [120, 180, 150, 210, 190, 250, 280, 310, 350, 420],
 anomalies: [3, 2, 5, 4, 2, 6, 3, 4, 2, 3],
 optimizations: [1, 2, 1, 3, 2, 2, 3, 4, 2, 3],
};
