import React from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItemProps {
  q: string;
  a: string;
}

export function FaqItem({ q, a }: FaqItemProps): React.ReactElement {
  return (
    <details className="group border-b border-panel-border">
      <summary className="flex items-center justify-between cursor-pointer list-none py-4 text-base font-medium text-gray-100 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
        <span>{q}</span>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className="text-gray-500 transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="pb-4 text-sm text-gray-400 leading-relaxed">{a}</div>
    </details>
  );
}
