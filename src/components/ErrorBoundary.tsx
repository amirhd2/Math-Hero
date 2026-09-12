import { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

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
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleHardReset = () => {
    if (window.confirm('آیا می‌خواهید برنامه مجدداً با تنظیمات اولیه بارگذاری شود؟')) {
      try {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            for (const registration of registrations) {
              registration.unregister();
            }
          });
        }
      } catch (e) {
        console.warn(e);
      }
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 font-['Vazirmatn',sans-serif]" dir="rtl">
          <div className="max-w-md w-full bg-slate-800/90 border border-slate-700 rounded-3xl p-6 text-center shadow-2xl space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-white">مشکلی در اجرای برنامه رخ داد</h2>
              <p className="text-sm text-slate-300">
                لطفاً با زدن دکمه زیر صفحه را مجدداً بارگذاری کنید.
              </p>
            </div>

            {this.state.error && (
              <div className="text-xs font-mono bg-slate-950/60 p-3 rounded-xl text-red-300 text-left overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                id="error-reload-button"
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                <RotateCcw className="w-4 h-4" />
                بارگذاری مجدد
              </button>
              <button
                type="button"
                id="error-reset-button"
                onClick={this.handleHardReset}
                className="py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
              >
                بازنشانی حافظه موقت
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
