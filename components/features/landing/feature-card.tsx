import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  body: string;
}

export function FeatureCard({ icon: Icon, title, body }: FeatureCardProps): React.ReactElement {
  return (
    <div className="rounded-lg border border-panel-border bg-header-bg/60 p-6 transition-colors hover:border-blue-500/40">
      <div className="text-blue-400 mb-3">
        <Icon size={20} aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-gray-100 mb-2">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{body}</p>
    </div>
  );
}
