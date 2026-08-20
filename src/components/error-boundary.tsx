/**
 * Error Boundary Components
 * 
 * #25 - Settings Black Screen Bug Prevention
 * Uses proper panel-level isolation so a single Settings failure 
 * does not kill the entire OS shell.
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Fallback UI to show on error */
  fallback?: ReactNode;
  /** Custom error handler */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Whether to show reset button */
  showReset?: boolean;
  /** Panel name for error identification */
  panelName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string;
}

/**
 * Generic Error Boundary for isolating panel failures
 * Prevents one crashing component from taking down the whole OS
 */
export class PanelErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: `err-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `err-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log internally for debugging
    console.error(`[PanelErrorBoundary${this.props.panelName ? `:${this.props.panelName}` : ''}]`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorId: `err-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex flex-col items-center justify-center p-6 h-full bg-[#1a1a2e]/90 rounded-xl">
          <AlertTriangle className="w-12 h-12 text-yellow-500/70 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-white/50 text-center mb-4 max-w-md">
            {this.props.panelName 
              ? `The ${this.props.panelName} panel encountered an error.`
              : 'This section encountered an unexpected error.'
            }
          </p>
          
          {/* Error ID for support (not exposed as internal terminology) */}
          <p className="text-xs text-white/30 mb-4">
            Reference: {this.state.errorId.slice(0, 12)}...
          </p>

          {(this.props.showReset !== false) && (
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white/80 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary for functional components
 */
export function usePanelError(panelName?: string) {
  const [error, setError] = React.useState<Error | null>(null);

  const captureError = React.useCallback((error: Error) => {
    console.error(`[PanelError:${panelName || 'unknown'}]`, error);
    setError(error);
  }, [panelName]);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    hasError: !!error,
    captureError,
    clearError,
  };
}

/**
 * Settings-specific error boundary with extra protection
 * #25 - Prevents settings changes from crashing the OS
 */
export function SettingsErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <PanelErrorBoundary
      panelName="Settings"
      onError={(error) => {
        // Log settings-specific errors with context
        console.warn('[SettingsError]', {
          message: error.message,
          // Don't log full stack to console in production
          hint: 'Settings change may have caused this',
        });
      }}
    >
      {children}
    </PanelErrorBoundary>
  );
}

/**
 * HOC to wrap any component with error boundary
 */
export function withErrorBoundary<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  options?: Omit<ErrorBoundaryProps, 'children'>
) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const ComponentWithErrorBoundary = (props: T) => (
    <PanelErrorBoundary {...options} panelName={displayName}>
      <WrappedComponent {...props} />
    </PanelErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;
  
  return ComponentWithErrorBoundary;
}

// Default export for convenient usage
export default PanelErrorBoundary;
