'use client'

import { useEffect } from 'react'

const IGNORED_REJECTION_MESSAGES = [
  'A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received',
]

function getReasonMessage(reason) {
  if (!reason) return ''
  if (typeof reason === 'string') return reason
  return reason.message || String(reason)
}

export function ConsoleNoiseFilter() {
  useEffect(() => {
    const handleUnhandledRejection = (event) => {
      const message = getReasonMessage(event.reason)

      if (IGNORED_REJECTION_MESSAGES.some((ignored) => message.includes(ignored))) {
        event.preventDefault()
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return null
}
