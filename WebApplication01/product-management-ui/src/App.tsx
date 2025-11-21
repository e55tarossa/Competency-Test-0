import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProductList from './components/products/ProductList';
import { Package } from 'lucide-react';
import { ToastContainer } from './components/ui/Toast';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000, // 30 seconds
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <header className="bg-blue-900 dark:bg-blue-950 border-b border-blue-800 dark:border-blue-900 sticky top-0 z-40 backdrop-blur-lg bg-blue-900/95 dark:bg-blue-950/95">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    Product Management
                  </h1>
                  <p className="text-xs text-blue-200">
                    Enterprise Solution
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <ProductList />
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Product Management System. All rights reserved.
            </p>
          </div>
        </footer>

        <ToastContainer />
      </div>
    </QueryClientProvider>
  );
}

export default App;
