'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  Home,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isDetailsOpen: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isDetailsOpen: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to monitoring service
    logger.error('Error caught by boundary:', { error, errorInfo });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isDetailsOpen: false,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  toggleDetails = () => {
    this.setState((prevState) => ({
      isDetailsOpen: !prevState.isDetailsOpen,
    }));
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="bg-background flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="bg-destructive/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <AlertTriangle
                  className="text-destructive h-6 w-6"
                  aria-hidden="true"
                />
              </div>
              <CardTitle className="text-lg">Something went wrong</CardTitle>
              <CardDescription>
                We apologize for the inconvenience. An unexpected error has
                occurred.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <Button
                  onClick={this.handleRetry}
                  className="w-full"
                  aria-label="Try again - this will reload the component"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="w-full"
                  aria-label="Go to home page"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </div>

              {/* Error details section for development */}
              {(this.props.showErrorDetails ||
                process.env.NODE_ENV === 'development') &&
                this.state.error && (
                  <Collapsible
                    open={this.state.isDetailsOpen}
                    onOpenChange={this.toggleDetails}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between"
                        aria-expanded={this.state.isDetailsOpen}
                        aria-controls="error-details"
                      >
                        <span>Error Details</span>
                        {this.state.isDetailsOpen ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent
                      id="error-details"
                      className="space-y-2"
                    >
                      <div className="bg-muted rounded-md p-3 text-sm">
                        <div className="text-destructive mb-2 font-medium">
                          {this.state.error.name}: {this.state.error.message}
                        </div>
                        {this.state.error.stack && (
                          <details className="mt-2">
                            <summary className="text-muted-foreground hover:text-foreground cursor-pointer">
                              Stack trace
                            </summary>
                            <pre className="text-muted-foreground mt-2 max-h-32 overflow-auto text-xs whitespace-pre-wrap">
                              {this.state.error.stack}
                            </pre>
                          </details>
                        )}
                        {this.state.errorInfo?.componentStack && (
                          <details className="mt-2">
                            <summary className="text-muted-foreground hover:text-foreground cursor-pointer">
                              Component stack
                            </summary>
                            <pre className="text-muted-foreground mt-2 max-h-32 overflow-auto text-xs whitespace-pre-wrap">
                              {this.state.errorInfo.componentStack}
                            </pre>
                          </details>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

// Simple error fallback component
export const ErrorFallback: React.FC<{
  error?: Error;
  resetError?: () => void;
  title?: string;
  description?: string;
}> = ({
  error,
  resetError,
  title = 'Something went wrong',
  description = 'An error occurred while rendering this component.',
}) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <AlertTriangle className="text-destructive mb-4 h-8 w-8" />
    <h3 className="mb-2 text-lg font-semibold">{title}</h3>
    <p className="text-muted-foreground mb-4 max-w-md">{description}</p>
    {resetError && (
      <Button onClick={resetError} size="sm">
        <RefreshCw className="mr-2 h-4 w-4" />
        Try Again
      </Button>
    )}
    {process.env.NODE_ENV === 'development' && error && (
      <details className="mt-4 text-left">
        <summary className="text-muted-foreground cursor-pointer text-sm">
          Error details (development only)
        </summary>
        <pre className="bg-muted mt-2 max-w-full overflow-auto rounded p-2 text-xs">
          {error.message}
          {error.stack && `\n\n${error.stack}`}
        </pre>
      </details>
    )}
  </div>
);

export default ErrorBoundary;
