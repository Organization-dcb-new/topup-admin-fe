import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './routes/route'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
