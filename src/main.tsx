import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/i18n'
import App from './routes/route'
import { NbToaster } from '@/components/ui/nb-toaster'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <NbToaster />
    </QueryClientProvider>
  </StrictMode>
)
