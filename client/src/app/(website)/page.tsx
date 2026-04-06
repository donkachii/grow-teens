import CtaSection from "./_components/CtaSection";
import Hero from "./_components/Hero";
import ImpactStats from "./_components/ImpactStats";
import Newsletter from "./_components/Newsletter";
import Objectives from "./_components/Objectives";
import Partners from "./_components/Partners";
import Programs from "./_components/Programs";
import Testimonials from "./_components/Testimonials";

export default function Home() {
  return (
    <>
      <Hero />
      <Objectives />
      <ImpactStats />
      <Programs />
      <Testimonials />
      <Partners />
      <CtaSection />
      <Newsletter />
    </>
  );
}
