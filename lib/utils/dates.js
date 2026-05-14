// Date utilities
import { format, formatDistanceToNow, parseISO, isValid, addDays } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'

const locales = {
  ar,
  en: enUS,
}

export function formatDate(date, formatStr = 'PPP', locale = 'en') {
  if (!date) return ''

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return ''

    return format(dateObj, formatStr, {
      locale: locales[locale] || enUS,
    })
  } catch {
    return ''
  }
}

export function formatDateShort(date, locale = 'en') {
  return formatDate(date, 'P', locale)
}

export function formatDateLong(date, locale = 'en') {
  return formatDate(date, 'PPPP', locale)
}

export function formatDateISO(date) {
  return formatDate(date, 'yyyy-MM-dd')
}

export function formatRelativeDate(date, locale = 'en') {
  if (!date) return ''

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return ''

    return formatDistanceToNow(dateObj, {
      addSuffix: true,
      locale: locales[locale] || enUS,
    })
  } catch {
    return ''
  }
}

export function getDaysUntilDue(dueDate) {
  if (!dueDate) return null

  try {
    const due = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate
    const today = new Date()
    const diffTime = due - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  } catch {
    return null
  }
}

export function isOverdue(dueDate) {
  const days = getDaysUntilDue(dueDate)
  return days !== null && days < 0
}

export function getDefaultDueDate(issueDate, days = 30) {
  if (!issueDate) return formatDateISO(addDays(new Date(), days))

  try {
    const issue = typeof issueDate === 'string' ? parseISO(issueDate) : issueDate
    return formatDateISO(addDays(issue, days))
  } catch {
    return formatDateISO(addDays(new Date(), days))
  }
}

export function getCurrentYear() {
  return new Date().getFullYear()
}

export function getCurrentDate() {
  return formatDateISO(new Date())
}
