import { SeoHead } from '@/components/seo-head';
import { About } from '@/components/site/about';
import { Accreditation } from '@/components/site/accreditation';
import { ApplicationSteps } from '@/components/site/application-steps';
import { CtaBanner } from '@/components/site/cta-banner';
import { DepartmentsShowcase } from '@/components/site/departments-showcase';
import { FixedVideoSection } from '@/components/site/fixed-video-section';
import { FloatingButtons } from '@/components/site/floating-buttons';
import { Hero } from '@/components/site/hero';
import { NewsCarousel } from '@/components/site/news-carousel';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { WhyUs } from '@/components/site/why-us';
import { Banner } from '@/types';
import { type Department } from '@/components/site/departments-showcase';
import { type FaqItem } from '@/components/site/faq';
import { type TestimonialItem } from '@/components/site/testimonials';
import { type NewsPost } from '@/lib/news';

interface Props {
  departments?: Department[];
  faqs?: FaqItem[];
  testimonials?: TestimonialItem[];
  posts?: NewsPost[];
  banners?: Banner[];
  stats?: {
    students_count?: number;
    teachers_count?: number;
    departments_count?: number;
  };
}

// Placeholder assets until the real campus video is produced.
const DEMO_VIDEO_URL = 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4';
const DEMO_VIDEO_POSTER = '/banner.webp';

export default function Welcome({ banners, departments, posts, stats }: Props) {
  return (
    <>
      <SeoHead />
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <Hero banners={banners} />
          <DepartmentsShowcase departments={departments} />
          <WhyUs />
          <ApplicationSteps />
          <About stats={stats} />
          <FixedVideoSection src={DEMO_VIDEO_URL} poster={DEMO_VIDEO_POSTER} />
          <Accreditation />
          <NewsCarousel items={posts} />
          <CtaBanner />
        </main>
        <SiteFooter />
        <FloatingButtons />
      </div>
    </>
  );
}
