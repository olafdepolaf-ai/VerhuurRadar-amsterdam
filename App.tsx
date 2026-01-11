import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import ErrorBoundary from './components/ErrorBoundary';
import VerhuurRadarApp from './VerhuurRadarApp';

function App() {
  const [showApp, setShowApp] = useState(false);

  if (!showApp) {
    return <LandingPage onStart={() => setShowApp(true)} />;
  }

  return (
    <ErrorBoundary>
      <VerhuurRadarApp />
    </ErrorBoundary>
  );
}

export default App;