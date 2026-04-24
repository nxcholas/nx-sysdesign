import React from 'react';
import { categories } from './categories';

const pill =
  'inline-flex px-2.5 py-1 rounded-full border border-panel-border bg-canvas-bg text-xs font-mono text-gray-300 mr-1.5 mb-1.5';

export function ComponentShowcase(): React.ReactElement {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((cat) => (
        <div key={cat.name}>
          <h3 className="text-sm font-semibold text-gray-100 mb-3">{cat.name}</h3>
          <div className="flex flex-wrap">
            {cat.items.map((item) => (
              <span key={item} className={pill}>
                {item}
              </span>
            ))}
            {cat.moreCount > 0 && (
              <span className={pill}>+{cat.moreCount} more</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
