import React from 'react';
import { clearStoredPlaybook, downloadStoredPlaybookBackup } from '../utils/storage';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Render crashed:', error, info.componentStack);
  }

  handleBackup = () => {
    const outcome = downloadStoredPlaybookBackup();
    if (outcome === 'empty') window.alert('There is no saved playbook on this device to back up.');
    if (outcome === 'failed') window.alert('The backup could not be created. Check the browser console.');
  };

  handleReset = () => {
    if (!window.confirm('Download a backup of your saved playbook, then clear it and restart with the default plays?')) return;
    const outcome = downloadStoredPlaybookBackup();
    if (outcome === 'failed') {
      window.alert('The backup failed, so nothing was cleared.');
      return;
    }
    clearStoredPlaybook();
    window.location.reload();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div role="alert" className="min-h-screen flex items-center justify-center bg-[#0d1117] p-6 text-slate-100">
        <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#161b22] p-6 space-y-4">
          <h1 className="text-lg font-bold text-white">Something went wrong</h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            The playbook hit an unexpected error. Your plays are still saved in this browser. Try reloading first; if it
            crashes again, back up your data and reset it.
          </p>
          <pre className="text-xs text-rose-300 bg-[#0d1117] border border-slate-700 rounded-lg p-3 max-h-32 overflow-auto whitespace-pre-wrap break-words">
            {error.message}
          </pre>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-sky-700 hover:bg-sky-800 text-white cursor-pointer"
            >
              Reload
            </button>
            <button
              type="button"
              onClick={this.handleBackup}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-500 cursor-pointer"
            >
              Download backup
            </button>
            <button
              type="button"
              onClick={this.handleReset}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-rose-800 hover:bg-rose-700 text-white cursor-pointer"
            >
              Back up &amp; reset data
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
