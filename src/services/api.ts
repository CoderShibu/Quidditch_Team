const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('ghana_token')}`
})

// For simple endpoints that wrap everything under "data"
const handleResponse = async (res: Response) => {
  if (!res.ok) throw new Error(`API Error: ${res.status}`)
  const json = await res.json()
  return json.data ?? json
}

// For endpoints that return extra fields alongside "data" (costs, etc.)
const handleFullResponse = async (res: Response) => {
  if (!res.ok) throw new Error(`API Error: ${res.status}`)
  return res.json()
}

export const api = {
  // AUTH
  login: (username: string, password: string) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username, password})
    }).then(handleResponse),

  signup: (data: object) =>
    fetch(`${API_BASE}/auth/signup`, {
      method: 'POST', 
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    }).then(handleResponse),

  // COSTS — returns {data[], predictions[], totalCost, moneySaved, budget, mlAnomaly}
  getCosts: (range = 30) =>
    fetch(`${API_BASE}/costs/?range=${range}`, 
      {headers: getHeaders()}).then(handleFullResponse),

  getSummary: () =>
    fetch(`${API_BASE}/costs/summary`, 
      {headers: getHeaders()}).then(handleResponse),

  getBurnRate: () =>
    fetch(`${API_BASE}/costs/burn-rate`, 
      {headers: getHeaders()}).then(handleResponse),

  // ANOMALIES
  getAnomalies: (filters: Record<string, string> = {}) => {
    const params = new URLSearchParams(filters).toString()
    return fetch(`${API_BASE}/anomalies/?${params}`, 
      {headers: getHeaders()}).then(handleResponse)
  },

  resolveAnomaly: (id: number) =>
    fetch(`${API_BASE}/anomalies/${id}/resolve`, {
      method: 'POST', headers: getHeaders()
    }).then(handleResponse),

  getAnomalyTrend: () =>
    fetch(`${API_BASE}/anomalies/trend`, 
      {headers: getHeaders()}).then(handleResponse),

  // ALERTS
  getAlerts: (filters: Record<string, string> = {}) => {
    const params = new URLSearchParams(filters).toString()
    return fetch(`${API_BASE}/alerts/?${params}`, 
      {headers: getHeaders()}).then(handleResponse)
  },

  getAlertSummary: () =>
    fetch(`${API_BASE}/alerts/summary`, 
      {headers: getHeaders()}).then(handleResponse),

  resolveAlert: (id: number) =>
    fetch(`${API_BASE}/alerts/${id}/resolve`, {
      method: 'POST', headers: getHeaders()
    }).then(handleResponse),

  snoozeAlert: (id: number, hours: number) =>
    fetch(`${API_BASE}/alerts/${id}/snooze`, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({hours})
    }).then(handleResponse),

  getAlertSettings: () =>
    fetch(`${API_BASE}/alerts/settings`, 
      {headers: getHeaders()}).then(handleResponse),

  saveAlertSettings: (settings: object) =>
    fetch(`${API_BASE}/alerts/settings`, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify(settings)
    }).then(handleResponse),

  // OPTIMIZATIONS
  getOptimizations: () =>
    fetch(`${API_BASE}/optimizations/`, 
      {headers: getHeaders()}).then(handleResponse),

  getOptimizationSummary: () =>
    fetch(`${API_BASE}/optimizations/summary`, 
      {headers: getHeaders()}).then(handleResponse),

  // NOTIFICATIONS
  getNotifications: () =>
    fetch(`${API_BASE}/notifications/`, 
      {headers: getHeaders()}).then(handleResponse),

  markRead: (id: number) =>
    fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'POST', headers: getHeaders()
    }).then(handleResponse),

  markAllRead: () =>
    fetch(`${API_BASE}/notifications/read-all`, {
      method: 'POST', headers: getHeaders()
    }).then(handleResponse),

  // TRIGGERS
  getTriggers: () =>
    fetch(`${API_BASE}/triggers/`, 
      {headers: getHeaders()}).then(handleResponse),

  saveTriggers: (rules: object) =>
    fetch(`${API_BASE}/triggers/save`, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify(rules)
    }).then(handleResponse),

  // AI — ALL REAL GROQ/GEMINI API CALLS
  getAIInsights: (costContext: object) =>
    fetch(`${API_BASE}/ai/insight`, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify(costContext)
    }).then(handleResponse),

  analyzeAnomaly: (anomalyData: object) =>
    fetch(`${API_BASE}/ai/analyze-anomaly`, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify(anomalyData)
    }).then(handleResponse),

  chatWithAI: (message: string, history: any[], context: object) =>
    fetch(`${API_BASE}/ai/chat`, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({
        message, history, costContext: context
      })
    }).then(handleResponse),

  getReportSummary: (data: object) =>
    fetch(`${API_BASE}/ai/generate-report-summary`, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({
        selectedSections: [], costData: data
      })
    }).then(handleResponse),

  getOptimizeSuggestion: (data: object) =>
    fetch(`${API_BASE}/ai/optimize`, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify(data)
    }).then(handleResponse),

  // EMAIL & PDF
  sendReport: (payload: object) =>
    fetch(`${API_BASE}/email/send-report`, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse),
}
