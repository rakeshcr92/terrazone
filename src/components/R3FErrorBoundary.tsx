import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class R3FErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Suppress R3F-specific errors that don't affect functionality
    const isR3FError = error.message?.includes('R3F') || 
                      error.message?.includes('__r3f') ||
                      error.message?.includes('data-source-stack');
    
    if (isR3FError) {
      console.warn('⚠️ R3F internal error caught and suppressed:', error.message);
      return { hasError: false, error: null }; // Don't show error UI for R3F internals
    }
    
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    // Log non-R3F errors
    const isR3FError = error.message?.includes('R3F') || 
                      error.message?.includes('__r3f') ||
                      error.message?.includes('data-source-stack');
    
    if (!isR3FError) {
      console.error('❌ 3D Component Error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-black">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-white mb-2">3D Rendering Error</h3>
            <p className="text-white/60 text-sm mb-4">The 3D visualization encountered an error</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
