import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { ErrorBoundary } from './components/common/ErrorBoundary.tsx'


// Lazy Load Roadmap to save initial bundle size
const RoadmapPage = lazy(() => import('./components/screens/RoadmapPage.tsx').then(module => ({ default: module.RoadmapPage })));

// Simple path-based routing for static pages
const getComponent = () => {
  const path = window.location.pathname.replace(/\/$/, '') || '/'; // Remove trailing slash

  if (path === '/roadmap') {
    return (
      <Suspense fallback={<div className="w-full h-dvh bg-black flex items-center justify-center text-white">Loading Roadmap...</div>}>
        <RoadmapPage />
      </Suspense>
    );
  }

  // Default: main app
  return <App />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      {getComponent()}
    </ErrorBoundary>
  </StrictMode>,
)
