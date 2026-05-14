'use client'

import { motion } from 'framer-motion'

export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  return (
    <motion.div
      className={`${sizes[size]} ${className}`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <div className="w-full h-full border-4 border-primary/20 border-t-primary rounded-full" />
    </motion.div>
  )
}

export function LoadingScreen({ text = 'Loading...' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground font-medium animate-pulse">{text}</p>
      </div>
    </div>
  )
}

export function LoadingOverlay({ show, text = 'Processing...' }) {
  if (!show) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-xl"
    >
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="md" />
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </motion.div>
  )
}
