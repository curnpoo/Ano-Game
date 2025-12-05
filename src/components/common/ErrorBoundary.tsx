import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReset = () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="fixed inset-0 bg-90s-animated flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-[2rem] p-8 max-w-md w-full text-center shadow-2xl border-4 border-red-500 animate-bounce-in">
                        <div className="text-6xl mb-4">😵</div>
                        <h1 className="text-2xl font-black text-red-500 mb-2">Oops! Something went wrong.</h1>
                        <p className="text-gray-600 mb-6">
                            The game crashed. Don't worry, it happens!
                        </p>

                        <div className="bg-gray-100 p-4 rounded-xl mb-6 text-left overflow-auto max-h-32 text-xs font-mono text-gray-500">
                            {this.state.error?.message}
                        </div>

                        <button
                            onClick={this.handleReset}
                            className="w-full btn-90s bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-4 rounded-xl font-bold text-xl jelly-hover shadow-lg"
                        >
                            Restart Game 🔄
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
