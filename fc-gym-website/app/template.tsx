/** Route transition (home ↔ credits). Pure CSS so content is visible before JS hydrates (good LCP). */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
