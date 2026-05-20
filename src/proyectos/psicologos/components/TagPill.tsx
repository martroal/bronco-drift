import type { Tag } from '../lib/queries';

export default function TagPill({
  tag,
  onRemove,
  size = 'sm',
}: {
  tag: Tag;
  onRemove?: () => void;
  size?: 'xs' | 'sm';
}) {
  const padding = size === 'xs' ? 'px-1.5 py-0' : 'px-2 py-0.5';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full text-[10px] font-medium ${padding}`}
      style={{
        backgroundColor: `${tag.color}1f`,
        color: tag.color,
        border: `1px solid ${tag.color}55`,
      }}
    >
      {tag.nombre}
      {onRemove && (
        <button
          onClick={onRemove}
          className="hover:opacity-70"
          aria-label={`Quitar tag ${tag.nombre}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
