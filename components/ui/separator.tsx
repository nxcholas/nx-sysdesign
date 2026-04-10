interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Separator({
  orientation = 'horizontal',
  className = '',
}: SeparatorProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={
        orientation === 'horizontal'
          ? `w-full h-px bg-panel-border ${className}`
          : `h-full w-px bg-panel-border ${className}`
      }
    />
  );
}
