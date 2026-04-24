import React from 'react';
import { FeatureCard } from './feature-card';
import { features } from './features';

export function FeatureGrid(): React.ReactElement {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {features.map((f) => (
        <FeatureCard key={f.title} icon={f.icon} title={f.title} body={f.body} />
      ))}
    </div>
  );
}
