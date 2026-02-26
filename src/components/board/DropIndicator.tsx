interface DropIndicatorProps {
  color?: string;
}

export function DropIndicator({ color = '#3b82f6' }: DropIndicatorProps) {
  return (
    <div className="relative flex items-center my-0.5 pointer-events-none">
      <div
        className="absolute left-0 w-2 h-2 rounded-full -translate-x-1"
        style={{ backgroundColor: color }}
      />
      <div
        className="w-full h-0.5 rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}
