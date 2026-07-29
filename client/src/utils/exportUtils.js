/**
 * Utility functions for exporting meeting analytics and action items
 * to CSV, JSON, and Markdown formats.
 */

/**
 * Downloads formatted text content as a file in the browser.
 * @param {string} content - Raw string content to download
 * @param {string} filename - Output filename (e.g. 'analytics-report.csv')
 * @param {string} mimeType - MIME type for the Blob
 */
export const downloadBlob = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Converts an array of objects to CSV string.
 * @param {Array<Object>} data - Array of key-value objects
 * @returns {string} CSV formatted string
 */
export const convertToCSV = (data) => {
  if (!data || data.length === 0) return ''
  const headers = Object.keys(data[0])
  const headerRow = headers.join(',')
  const rows = data.map((row) =>
    headers
      .map((header) => {
        const val = row[header] !== undefined && row[header] !== null ? String(row[header]) : ''
        return `"${val.replace(/"/g, '""')}"`
      })
      .join(','),
  )
  return [headerRow, ...rows].join('\n')
}

/**
 * Exports meeting analytics summary to CSV format.
 * @param {Object} summary - Summary metrics object
 */
export const exportAnalyticsToCSV = (summary) => {
  if (!summary) return
  const exportData = [
    { Metric: 'Total Meetings', Value: summary.totalMeetings ?? 0 },
    { Metric: 'Completed Meetings', Value: summary.completedMeetings ?? 0 },
    { Metric: 'Total Policies', Value: summary.totalPolicies ?? 0 },
    { Metric: 'Updated Policies', Value: summary.updatedPolicies ?? 0 },
  ]
  const csvContent = convertToCSV(exportData)
  downloadBlob(csvContent, 'meeting-analytics-report.csv', 'text/csv;charset=utf-8;')
}

/**
 * Exports meeting analytics and AI insights to JSON format.
 * @param {Object} data - Analytics data payload
 * @param {string} aiInsights - AI insights text
 */
export const exportAnalyticsToJSON = (data, aiInsights = '') => {
  const exportPayload = {
    exportedAt: new Date().toISOString(),
    summary: data?.summary ?? {},
    trends: data?.trends ?? {},
    aiInsights: aiInsights,
  }
  const jsonContent = JSON.stringify(exportPayload, null, 2)
  downloadBlob(jsonContent, 'meeting-analytics-report.json', 'application/json')
}

/**
 * Exports meeting analytics summary and AI insights to Markdown format.
 * @param {Object} summary - Analytics summary metrics
 * @param {string} aiInsights - AI insights text
 */
export const exportAnalyticsToMarkdown = (summary, aiInsights = '') => {
  const markdown = `# Meeting Analytics Report
*Exported on: ${new Date().toLocaleDateString()}*

## Key Metrics
- **Total Meetings:** ${summary?.totalMeetings ?? 0}
- **Completed Meetings:** ${summary?.completedMeetings ?? 0}
- **Total Policies:** ${summary?.totalPolicies ?? 0}
- **Updated Policies:** ${summary?.updatedPolicies ?? 0}

## AI Executive Insights
${aiInsights || 'No AI insights generated.'}
`
  downloadBlob(markdown, 'meeting-analytics-report.md', 'text/markdown;charset=utf-8;')
}
