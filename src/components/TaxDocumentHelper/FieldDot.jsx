export default function FieldDot({ position, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{ top: `${position.y * 100}%`, left: `${position.x * 100}%` }}
      className="absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
    >
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-dm-accent opacity-60" />
      <span className="relative inline-flex h-3 w-3 rounded-full bg-dm-accent ring-2 ring-white" />
    </button>
  );
}
