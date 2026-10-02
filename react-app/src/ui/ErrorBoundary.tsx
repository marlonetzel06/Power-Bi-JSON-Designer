import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State { error: Error | null }

export class ErrorBoundary extends Component<{ children: ReactNode; fallback?: (error: Error, reset: () => void) => ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    const reset = () => this.setState({ error: null });
    if (this.props.fallback) return this.props.fallback(error, reset);
    return (
      <div className="flex h-full min-h-[200px] items-center justify-center bg-surface-page p-8 text-text-body">
        <div className="max-w-md text-center">
          <p className="mm-eyebrow mb-2">Error</p>
          <h1 className="mm-headline text-[20px]">Etwas ist schiefgelaufen / Something went wrong</h1>
          <pre className="mt-3 overflow-auto rounded-md bg-surface-subtle p-3 text-left font-mono text-[12px] text-text-muted">{error.message}</pre>
          <div className="mt-4 flex justify-center gap-2">
            <button type="button" onClick={reset} className="h-9 rounded-md border border-border-default bg-surface-card px-4 text-[13px] font-medium text-text-primary hover:bg-surface-subtle">Weiter / Continue</button>
            <button type="button" onClick={() => window.location.reload()} className="h-9 rounded-md bg-brand px-4 text-[13px] font-medium text-text-on-brand hover:bg-brand-hover">Neu laden / Reload</button>
          </div>
        </div>
      </div>
    );
  }
}
