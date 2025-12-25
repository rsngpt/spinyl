import React from 'react';
import ExploreWizard from '../components/explore/ExploreWizard';

export const dynamic = 'force-dynamic';

export default function Explore() {
  return (
    <main style={{ paddingTop: '80px', minHeight: '100vh' }}>
      <div className="explore-container">
        <div className="wizard-header">
          <h1 className="wizard-title">
            Discover
          </h1>
          <p className="wizard-subtitle">
            Find your next obsession. Mix genres and artists to curate a personalized playlist just for you.
          </p>
        </div>

        <ExploreWizard />
      </div>
    </main>
  );
}
