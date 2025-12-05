import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AppProvider } from './providers/AppProvider';
import { router } from './routes';

function LoadingFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

const App = () => (
  <AppProvider>
    <Suspense fallback={<LoadingFallback />}>
      <RouterProvider
        router={router}
        future={{ v7_startTransition: true }}
      />
    </Suspense>
  </AppProvider>
);

export default App;

