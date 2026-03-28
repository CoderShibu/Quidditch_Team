import { mockData } from './mockData';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('ghana_token')}`
})

const handleResponse = async (res: Response, fallbackKey?: keyof typeof mockData) => {
  if (!res.ok) {
    if (fallbackKey && mockData[fallbackKey]) return mockData[fallbackKey];
    throw new Error(`API Error: ${res.status}`)
  }
  const json = await res.json()
  return json.data ?? json
}

const handleFullResponse = async (res: Response, fallbackKey?: keyof typeof mockData) => {
  if (!res.ok) {
    if (fallbackKey && mockData[fallbackKey]) return mockData[fallbackKey];
    throw new Error(`API Error: ${res.status}`)
  }
  return res.json()
}

const withFallback = async (
  fetchPromise: Promise<Response>, 
  handler: Function, 
  fallbackKey?: keyof typeof mockData
) => {
  try {
    const res = await fetchPromise;
    return await handler(res, fallbackKey);
  } catch (error) {
    if (fallbackKey && mockData[fallbackKey]) {
      console.warn(`[Ghana Offline Mode] API failed, using fallback data for: ${fallbackKey}`);
      return mockData[fallbackKey];
    }
    throw error;
  }
}

export const api = {
  // AUTH
  login: (username: string, password: string) =>
    withFallback(
      fetch(`${API_BASE}/auth/login`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, password})
      }), handleResponse
    ),

  signup: (data: object) =>
    withFallback(
      fetch(`${API_BASE}/auth/signup`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      }), handleResponse
    ),

  // COSTS
  getCosts: (range = 30) =>
    withFallback(
      fetch(`${API_BASE}/costs/?range=${range}`, {headers: getHeaders()}),
      handleFullResponse, 'costsData'
    ),

  getSummary: () =>
    withFallback(
      fetch(`${API_BASE}/costs/summary`, {headers: getHeaders()}),
      handleResponse, 'summaryData'
    ),

  getBurnRate: () =>
    withFallback(
      fetch(`${API_BASE}/costs/burn-rate`, {headers: getHeaders()}),
      handleResponse, 'burnRateData'
    ),

  // ANOMALIES
  getAnomalies: (filters: Record<string, string> = {}) => {
    const params = new URLSearchParams(filters).toString()
    return withFallback(
      fetch(`${API_BASE}/anomalies/?${params}`, {headers: getHeaders()}),
      handleResponse, 'anomaliesData'
    )
  },

  resolveAnomaly: (id: number) =>
    withFallback(
      fetch(`${API_BASE}/anomalies/${id}/resolve`, {
        method: 'POST', headers: getHeaders()
      }), handleResponse
    ),

  getAnomalyTrend: () =>
    withFallback(
      fetch(`${API_BASE}/anomalies/trend`, {headers: getHeaders()}),
      handleResponse, 'anomalyTrendData'
    ),

  // ALERTS
  getAlerts: (filters: Record<string, string> = {}) => {
    const params = new URLSearchParams(filters).toString()
    return withFallback(
      fetch(`${API_BASE}/alerts/?${params}`, {headers: getHeaders()}),
      handleResponse, 'alertsData'
    )
  },

  getAlertSummary: () =>
    withFallback(
      fetch(`${API_BASE}/alerts/summary`, {headers: getHeaders()}),
      handleResponse, 'alertSummaryData'
    ),

  resolveAlert: (id: number) =>
    withFallback(
      fetch(`${API_BASE}/alerts/${id}/resolve`, {
        method: 'POST', headers: getHeaders()
      }), handleResponse
    ),

  snoozeAlert: (id: number, hours: number) =>
    withFallback(
      fetch(`${API_BASE}/alerts/${id}/snooze`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify({hours})
      }), handleResponse
    ),

  getAlertSettings: () =>
    withFallback(
      fetch(`${API_BASE}/alerts/settings`, {headers: getHeaders()}),
      handleResponse, 'alertSettingsData'
    ),

  saveAlertSettings: (settings: object) =>
    withFallback(
      fetch(`${API_BASE}/alerts/settings`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify(settings)
      }), handleResponse
    ),

  // OPTIMIZATIONS
  getOptimizations: () =>
    withFallback(
      fetch(`${API_BASE}/optimizations/`, {headers: getHeaders()}),
      handleResponse, 'optimizationsData'
    ),

  getOptimizationSummary: () =>
    withFallback(
      fetch(`${API_BASE}/optimizations/summary`, {headers: getHeaders()}),
      handleResponse, 'optimizationSummaryData'
    ),

  // NOTIFICATIONS
  getNotifications: () =>
    withFallback(
      fetch(`${API_BASE}/notifications/`, {headers: getHeaders()}),
      handleResponse, 'notificationsData'
    ),

  markRead: (id: number) =>
    withFallback(
      fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'POST', headers: getHeaders()
      }), handleResponse
    ),

  markAllRead: () =>
    withFallback(
      fetch(`${API_BASE}/notifications/read-all`, {
        method: 'POST', headers: getHeaders()
      }), handleResponse
    ),

  // TRIGGERS
  getTriggers: () =>
    withFallback(
      fetch(`${API_BASE}/triggers/`, {headers: getHeaders()}),
      handleResponse, 'triggersData'
    ),

  saveTriggers: (rules: object) =>
    withFallback(
      fetch(`${API_BASE}/triggers/save`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify(rules)
      }), handleResponse
    ),

  // AI
  getAIInsights: (costContext: object) =>
    withFallback(
      fetch(`${API_BASE}/ai/insight`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify(costContext)
      }), handleResponse, 'aiInsightsData'
    ),

  analyzeAnomaly: (anomalyData: object) =>
    withFallback(
      fetch(`${API_BASE}/ai/analyze-anomaly`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify(anomalyData)
      }), handleResponse, 'aiAnalyzeAnomalyData'
    ),

  chatWithAI: (message: string, history: any[], context: object) =>
    withFallback(
      fetch(`${API_BASE}/ai/chat`, {
        method: 'POST', headers: getHeaders(), 
        body: JSON.stringify({message, history, costContext: context})
      }), handleResponse, 'aiChatData'
    ),

  getReportSummary: (data: object) =>
    withFallback(
      fetch(`${API_BASE}/ai/generate-report-summary`, {
        method: 'POST', headers: getHeaders(),
        body: JSON.stringify({selectedSections: [], costData: data})
      }), handleResponse, 'aiReportSummaryData'
    ),

  getOptimizeSuggestion: (data: object) =>
    withFallback(
      fetch(`${API_BASE}/ai/optimize`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
      }), handleResponse, 'optimizeSuggestionData'
    ),

  // EMAIL
  sendReport: (payload: object) =>
    withFallback(
      fetch(`${API_BASE}/email/send-report`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify(payload)
      }), handleResponse
    )
}
