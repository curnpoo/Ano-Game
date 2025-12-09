import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { RoadmapPage } from './components/screens/RoadmapPage.tsx'

import { ErrorBoundary } from './components/common/ErrorBoundary.tsx'

// Simple path-based routing for static pages
const getComponent = () => {
  const path = window.location.pathname.replace(/\/$/, '') || '/'; // Remove trailing slash

  if (path === '/roadmap') {
    return <RoadmapPage />;
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
