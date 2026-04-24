import React from 'react';
import { FaqItem } from './faq-item';
import { faq } from './faq';

export function FaqSection(): React.ReactElement {
  return (
    <div className="mx-auto max-w-3xl px-6 md:px-8">
      <h2 id="faq-heading" className="text-3xl md:text-4xl font-semibold text-gray-50 mb-3 tracking-tight">
        Frequently asked questions.
      </h2>
      <p className="text-gray-400 mb-10 max-w-2xl">Short answers to common questions.</p>
      <div>
        {faq.map((item) => (
          <FaqItem key={item.q} q={item.q} a={item.a} />
        ))}
      </div>
    </div>
  );
}
