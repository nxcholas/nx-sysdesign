import { Badge } from '@/components/ui/badge';
import { HTTP_METHOD_COLORS } from '@/lib/constants';
import type { HttpMethod } from '@/lib/types';

interface HttpMethodBadgeProps {
  method: HttpMethod;
  size?: 'sm' | 'md';
}

export function HttpMethodBadge({ method, size = 'md' }: HttpMethodBadgeProps) {
  const { bg, text } = HTTP_METHOD_COLORS[method];
  const sizeClass = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-3 py-1.5';

  return (
    <Badge className={`${bg} ${text} ${sizeClass} min-w-[56px]`}>
      {method}
    </Badge>
  );
}
