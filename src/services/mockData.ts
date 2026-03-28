// Mock data fallbacks for offline mode

const generateCostData = () => {
  const data = [];
  const base = { EC2: 80, Lambda: 15, S3: 6, RDS: 30, CloudFront: 5 };
  for (let i = 30; i > 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const mult = isWeekend ? 0.6 : 1.0;
    data.push({
      date: date.toISOString().split('T')[0],
      EC2: Math.round(base.EC2 * mult * (1 + Math.random() * 0.2)),
      Lambda: Math.round(base.Lambda * mult * (1 + Math.random() * 0.2)),
      S3: Math.round(base.S3 * (1 + Math.random() * 0.1)),
      RDS: Math.round(base.RDS * mult * (1 + Math.random() * 0.2)),
      CloudFront: Math.round(base.CloudFront * (1 + Math.random() * 0.2)),
    });
  }
  return data;
};

const costsData = {
  success: true,
  data: generateCostData(),
  predictions: [
    { date: '2026-04-01', predicted: true, EC2: 90, Lambda: 18, S3: 7, RDS: 32, CloudFront: 6 },
    { date: '2026-04-02', predicted: true, EC2: 92, Lambda: 19, S3: 7, RDS: 33, CloudFront: 6 }
  ],
  totalCost: 11750.00,
  moneySaved: 5210.60,
  budget: 15000,
  mlAnomaly: { is_anomaly: false, score: 0.1, confidence: 99, severity: 'Low' }
};

export const mockData = {
  costsData,
  
  summaryData: {
    totalThisMonth: 11750, moneySaved: 5210.60, totalAnomalies: 34, 
    optimizationsExecuted: 28, savingsPercentage: 30.7, budgetUsed: 78.3
  },
  
  burnRateData: {
    dailyBurn: 391.67, avgDaily: 391.67, projectedMonth: 12141, daysRemaining: 3,
    velocity: [342,378,401,356,389,412,391], velocityChange: 4.2,
    byService: [
      {service:"EC2", spent:4821, budget:6000},
      {service:"Lambda", spent:1893, budget:3000},
      {service:"RDS", spent:1240, budget:2000},
      {service:"S3", spent:642, budget:1500}
    ]
  },
  
  anomaliesData: [
    { id: 1, title: "Idle EC2 Instance Detected", type: "idle-instance", description: "Instance i-0xmock has been running at <2% CPU for 72+ hours.", service: "EC2", resourceId: "i-09fmock", region: "us-east-1", severity: "high", status: "open", costImpact: 45.20, detectedAt: new Date().toISOString(), cascade: [] },
    { id: 2, title: "Lambda Runaway Execution", type: "runaway-lambda", description: "fn-process-orders invoked 847,000 times in 6 hours.", service: "Lambda", resourceId: "fn-orders", region: "us-east-1", severity: "critical", status: "investigating", costImpact: 121.50, detectedAt: new Date().toISOString(), cascade: [] }
  ],
  
  anomalyTrendData: [
    { date: "Oct 10", count: 4, critical: 1, high: 2 },
    { date: "Oct 11", count: 2, critical: 0, high: 1 },
    { date: "Oct 12", count: 7, critical: 2, high: 3 }
  ],
  
  alertsData: [
    { id: 1, title: "Budget threshold reached", message: "Monthly spend has crossed 75% of $15,000 budget.", severity: "critical", status: "active", service: "Billing", createdAt: new Date().toISOString(), cost: null },
    { id: 2, title: "EC2 idle instance", message: "i-04ab7c2f running at <1% CPU for 72 hours.", severity: "high", status: "active", service: "EC2", createdAt: new Date().toISOString(), cost: 21.60 }
  ],
  
  alertSummaryData: { active: 2, critical: 1, resolved: 0, total: 2 },
  
  alertSettingsData: { emailAlerts: true, slackAlerts: false, budgetThreshold: 80, anomalyAutoResolve: true, criticalOnly: false },

  optimizationsData: [
    { id: 1, title: "Stopped idle staging database", service: "RDS", resourceId: "db-staging-01", savedAmount: 120.00, savedPerDay: 4.00, appliedAt: new Date().toISOString(), status: "applied", type: "stop-idle" },
    { id: 2, title: "Reserved instance recommendation", service: "RDS", resourceId: "db-prod-01", savedAmount: 340.00, savedPerDay: 11.33, appliedAt: null, status: "pending", type: "reserved" }
  ],
  
  optimizationSummaryData: { totalSaved: 120.00, executedCount: 1, pendingCount: 1, successRate: 50.0 },
  
  notificationsData: [
    { id: 1, title: "Critical anomaly detected", message: "Idle EC2 instance i-04ab7c2f has been running at <1% CPU for 72 hours.", type: "anomaly", severity: "critical", read: false, createdAt: new Date().toISOString() },
    { id: 2, title: "Optimization applied successfully", message: "Staged database stopped. $120.00 saved this month.", type: "optimization", severity: "success", read: true, createdAt: new Date().toISOString() }
  ],
  
  triggersData: {
    auto: { enabled: false, stopAfterHours: 2, terminateAfterDays: 1, action: "Stop Instance", services: {"ec2": true, "lambda": true, "rds": false, "s3": false} },
    manual: { enabled: true, alertMethod: "Both", alertAfterHours: 1, showCostInAlert: true, requireConfirmation: true }
  },
  
  aiInsightsData: {
    insights: [
      { title: "EC2 Idle Detection", body: "2 EC2 instances idle 72h. Stop them to save $94/day immediately.", action: "Stop Now", confidence: 94, icon: "server" },
      { title: "Lambda Cost Spike", body: "fn-process-orders consuming 340% excess concurrency costing $121/day.", action: "Reduce Limit", confidence: 89, icon: "zap" }
    ]
  },

  aiAnalyzeAnomalyData: {
    analysis: "Anomaly detected in Service resource consuming $45.20/day above normal baseline.",
    rootCause: "Resource running without productive workload for extended period.",
    recommendation: "Immediately execute: Stop resource",
    estimatedSavings: 45.20,
    confidence: 87,
    steps: ["Verify no active connections", "Create backup snapshot", "Execute stop action"],
    priority: "Immediate",
    estimatedFixTime: "5 minutes"
  },

  aiChatData: {
    reply: "Ghana AI is currently operating in offline fallback mode. Based on current cached data, your top priority is addressing the critical EC2 anomalies costing $100/day.",
    suggestions: ["Show anomaly details", "Optimize Lambda functions", "View cost breakdown"]
  },

  aiReportSummaryData: {
    summary: "Ghana AI (Offline Context). Current monthly spend stands at $11,750 against a $15,000 budget, with a daily burn rate of $391.67 representing 78.3% budget utilization. Immediate action on anomalies could prevent budget overrun."
  },

  optimizeSuggestionData: [
    { resourceId: "i-09fmock", service: "EC2", action: "Stop Instance", reason: "Instance idle > threshold hours", savingsPerDay: 45.20, savingsPerMonth: 1356, confidence: 94, riskLevel: "Low", steps: ["Verify no active SSH connections", "Stop instance via AWS API"] }
  ]
};
