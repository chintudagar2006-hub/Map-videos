/** Pure-CSS opening (≈1.4s). Server-rendered so it covers the first paint; skipped on repeat visits. */
export default function Intro() {
  return (
    <div className="intro" aria-hidden="true">
      <div className="intro-mark display">
        <span className="metal-text">FC</span>
        <span className="mx-[0.08em] inline-block h-[0.13em] w-[0.13em] bg-lime align-middle" />
        <span className="text-bone">GYM</span>
        <span className="intro-bar" />
      </div>
    </div>
  );
}
