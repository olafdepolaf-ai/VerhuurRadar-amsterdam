import React from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import VerhuurRadarApp from './VerhuurRadarApp';

function App() {
  return (
    <ErrorBoundary>
      <VerhuurRadarApp />
    </ErrorBoundary>
  );
}

export default App;