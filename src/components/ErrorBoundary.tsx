import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ErrorFallback } from '@/components/ErrorFallback'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

// Class component karena React hanya menyediakan error boundary lewat
// lifecycle getDerivedStateFromError/componentDidCatch.
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled render error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) return <ErrorFallback />
    return this.props.children
  }
}
