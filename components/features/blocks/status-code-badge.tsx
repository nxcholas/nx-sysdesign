import { Badge } from '@/components/ui/badge';
import { STATUS_CODE_COLORS, STATUS_CODE_GROUP_LABELS } from '@/lib/constants';
import type { StatusCodeGroup } from '@/lib/types';

interface StatusCodeBadgeProps {
  group: StatusCodeGroup;
  code?: number;
  label?: string;
  size?: 'sm' | 'md';
}

export function StatusCodeBadge({
  group,
  code,
  label,
  size = 'md',
}: StatusCodeBadgeProps) {
  const { bg, text } = STATUS_CODE_COLORS[group];
  const sizeClass = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-3 py-1.5';

  const display = code
    ? `${code}${label ? ` ${label}` : ''}`
    : group;

  return (
    <div className="flex flex-col items-center gap-0.5">
      <Badge className={`${bg} ${text} ${sizeClass} min-w-[56px]`}>
        {display}
      </Badge>
      {!code && (
        <span className="text-[10px] text-gray-400 font-mono">
          {STATUS_CODE_GROUP_LABELS[group]}
        </span>
      )}
    </div>
  );
}
