import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  formatICalDate,
  escapeICalText,
  generateICalString,
  exportMeetingToICal,
} from './calendarExportUtils'

describe('calendarExportUtils', () => {
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

  describe('formatICalDate', () => {
    it('formats ISO date string into UTC iCal format correctly', () => {
      const formatted = formatICalDate('2026-07-29T10:30:00Z')
      expect(formatted).toBe('20260729T103000Z')
    })

    it('returns empty string for invalid dates', () => {
      expect(formatICalDate('invalid-date')).toBe('')
    })
  })

  describe('escapeICalText', () => {
    it('escapes commas, semicolons, and newlines correctly', () => {
      const input = 'Hello, world; line 1\nline 2'
      const escaped = escapeICalText(input)
      expect(escaped).toBe('Hello\\, world\\; line 1\\nline 2')
    })

    it('returns empty string for empty inputs', () => {
      expect(escapeICalText('')).toBe('')
      expect(escapeICalText(null)).toBe('')
    })
  })

  describe('generateICalString', () => {
    it('generates valid RFC 5545 VCALENDAR string structure', () => {
      const eventDetails = {
        title: 'Sprint Planning',
        description: 'Weekly sync meeting',
        startTime: '2026-07-30T09:00:00Z',
        endTime: '2026-07-30T10:00:00Z',
        location: 'https://meet.meetonmemory.org/room-123',
        uid: 'test-uid-123',
      }

      const icalStr = generateICalString(eventDetails)
      expect(icalStr).toContain('BEGIN:VCALENDAR')
      expect(icalStr).toContain('VERSION:2.0')
      expect(icalStr).toContain('SUMMARY:Sprint Planning')
      expect(icalStr).toContain('DESCRIPTION:Weekly sync meeting')
      expect(icalStr).toContain('LOCATION:https://meet.meetonmemory.org/room-123')
      expect(icalStr).toContain('DTSTART:20260730T090000Z')
      expect(icalStr).toContain('DTEND:20260730T100000Z')
      expect(icalStr).toContain('END:VCALENDAR')
    })
  })

  describe('exportMeetingToICal', () => {
    it('triggers file download without throwing errors', () => {
      const eventDetails = { title: 'Demo Meeting' }
      expect(() => exportMeetingToICal(eventDetails)).not.toThrow()
    })
  })
})
