import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  convertToCSV,
  exportAnalyticsToCSV,
  exportAnalyticsToJSON,
  exportAnalyticsToMarkdown,
} from './exportUtils'

describe('exportUtils', () => {
  let createObjectURLMock
  let revokeObjectURLMock

  beforeEach(() => {
    createObjectURLMock = vi.fn(() => 'blob:mock-url')
    revokeObjectURLMock = vi.fn()
    globalThis.URL.createObjectURL = createObjectURLMock
    globalThis.URL.revokeObjectURL = revokeObjectURLMock
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('convertToCSV', () => {
    it('returns empty string when given empty data', () => {
      expect(convertToCSV([])).toBe('')
      expect(convertToCSV(null)).toBe('')
    })

    it('converts array of objects to valid CSV format', () => {
      const data = [
        { Metric: 'Meetings', Count: 10 },
        { Metric: 'Policies', Count: 5 },
      ]
      const result = convertToCSV(data)
      expect(result).toContain('Metric,Count')
      expect(result).toContain('"Meetings","10"')
      expect(result).toContain('"Policies","5"')
    })

    it('escapes quotes properly inside values', () => {
      const data = [{ Description: 'Test "Quote"' }]
      const result = convertToCSV(data)
      expect(result).toContain('"Test ""Quote"""')
    })
  })

  describe('Export functions', () => {
    it('exports CSV without throwing', () => {
      const summary = {
        totalMeetings: 10,
        completedMeetings: 8,
        totalPolicies: 4,
        updatedPolicies: 2,
      }
      expect(() => exportAnalyticsToCSV(summary)).not.toThrow()
    })

    it('exports JSON without throwing', () => {
      const data = { summary: { totalMeetings: 5 }, trends: {} }
      expect(() => exportAnalyticsToJSON(data, 'Sample Insight')).not.toThrow()
    })

    it('exports Markdown without throwing', () => {
      const summary = { totalMeetings: 5, completedMeetings: 4 }
      expect(() => exportAnalyticsToMarkdown(summary, 'AI Analysis')).not.toThrow()
    })
  })
})
