import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/i18n'
import App from './routes/route'
import { Toaster } from 'react-hot-toast'
import { QueryClientProvider } from '@tanstack/react-query'

import { queryClient } from '@/lib/queryClient'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>
)
