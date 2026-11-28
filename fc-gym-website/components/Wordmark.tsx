/** Temporary concept wordmark (not official FC Gym branding). */
export default function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`display inline-flex items-baseline gap-[0.12em] ${className}`}>
      <span className="metal-text">FC</span>
      <span className="inline-block h-[0.14em] w-[0.14em] translate-y-[-0.05em] bg-lime" aria-hidden="true" />
      <span className="text-bone">GYM</span>
    </span>
  );
}
