const WORDS = ['Pre-booking open', 'Rohtak', 'Get stronger', 'Ek Rupaya Chowk', 'Coming soon'];

export default function Marquee() {
  const row = (
    <div className="flex shrink-0 items-center gap-10 pr-10">
      {WORDS.map((w) => (
        <span key={w} className="flex items-center gap-10">
          <span className="display text-[2.2rem] md:text-[3rem]">{w}</span>
          <span className="inline-block h-2 w-2 bg-obsidian" />
        </span>
      ))}
    </div>
  );
  return (
    <div className="relative z-10 -my-px overflow-hidden bg-lime py-3 text-obsidian" aria-hidden="true">
      <div className="flex w-max motion-safe:animate-[marquee_28s_linear_infinite]">
        {row}
        {row}
      </div>
      <style>{`@keyframes marquee{to{transform:translateX(-50%)}}`}</style>
    </div>
  );
}
