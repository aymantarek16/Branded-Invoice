'use client'

import { Toaster as SonnerToaster } from 'sonner'

const Toaster = ({ ...props }) => {
  return (
    <SonnerToaster
      richColors
      closeButton
      position="top-center"
      toastOptions={{
        classNames: {
          toast: 'font-sans',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
