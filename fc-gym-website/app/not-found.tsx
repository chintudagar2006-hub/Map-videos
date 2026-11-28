import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="gutter grid min-h-screen place-items-center text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="display mt-4 text-[clamp(3rem,10vw,8rem)]">Wrong <span className="metal-text">rep.</span></h1>
        <Link href="/" className="link-line mt-8 inline-block text-bone">Back to FC Gym</Link>
      </div>
    </main>
  );
}
