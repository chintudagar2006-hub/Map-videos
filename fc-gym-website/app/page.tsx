import Intro from '@/components/Intro';
import Nav from '@/components/Nav';
import ScrollProgress from '@/components/ScrollProgress';
import Hero from '@/components/Hero';
import Marquee from '@/components/Marquee';
import ScrollSequence from '@/components/ScrollSequence';
import Brand from '@/components/Brand';
import Showcase from '@/components/Showcase';
import PreBook from '@/components/PreBook';
import Location from '@/components/Location';
import Footer from '@/components/Footer';
import StickyCTA from '@/components/StickyCTA';

export default function Home() {
  return (
    <>
      <Intro />
      <ScrollProgress />
      <Nav />
      <main>
        <Hero />
        <ScrollSequence />
        <Marquee />
        <Brand />
        <Showcase />
        <PreBook />
        <Location />
      </main>
      <Footer />
      <StickyCTA />
    </>
  );
}
