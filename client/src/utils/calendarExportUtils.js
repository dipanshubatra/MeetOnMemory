/**
 * Utility functions for exporting meeting schedules to iCalendar (.ics) format.
 * Follows RFC 5545 specifications.
 */

/**
 * Formats a Date object into iCalendar UTC timestamp string (YYYYMMDDTHHMMSSZ).
 * @param {Date|string|number} dateInput - Date instance or parsable date string
 * @returns {string} Formatted iCal timestamp string
 */
export const formatICalDate = (dateInput) => {
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) return ''

  const pad = (n) => String(n).padStart(2, '0')
  const year = d.getUTCFullYear()
  const month = pad(d.getUTCMonth() + 1)
  const day = pad(d.getUTCDate())
  const hours = pad(d.getUTCHours())
  const minutes = pad(d.getUTCMinutes())
  const seconds = pad(d.getUTCSeconds())

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`
}

/**
 * Escapes special characters for iCal text fields.
 * @param {string} str - Raw string text
 * @returns {string} Escaped string
 */
export const escapeICalText = (str) => {
  if (!str) return ''
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

/**
 * Generates an RFC 5545 compliant .ics calendar content string.
 * @param {Object} eventDetails - Event details object
 * @returns {string} .ics format string
 */
export const generateICalString = ({
  title = 'MeetOnMemory Meeting',
  description = 'Meeting organized via MeetOnMemory',
  startTime = new Date(),
  endTime = new Date(Date.now() + 60 * 60 * 1000),
  location = '',
  uid = `meet-${Date.now()}@meetonmemory.org`,
}) => {
  const dtStamp = formatICalDate(new Date())
  const dtStart = formatICalDate(startTime)
  const dtEnd = formatICalDate(endTime)

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MeetOnMemory//Meeting System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeICalText(title)}`,
    `DESCRIPTION:${escapeICalText(description)}`,
    location ? `LOCATION:${escapeICalText(location)}` : '',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n')
}

/**
 * Generates and downloads an iCalendar file (.ics) for a meeting.
 * @param {Object} eventDetails - Meeting details object
 * @param {string} [filename] - Output file name
 */
export const exportMeetingToICal = (eventDetails, filename = 'meeting-schedule.ics') => {
  const icalContent = generateICalString(eventDetails)
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
