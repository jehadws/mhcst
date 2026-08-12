import { SeoHead } from '@/components/seo-head';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { FloatingButtons } from '@/components/site/floating-buttons';
import { Hero } from '@/components/site/hero';
import { StatsBar } from '@/components/site/stats-bar';
import { DepartmentsShowcase } from '@/components/site/departments-showcase';
import { WhyUs } from '@/components/site/why-us';
import { ApplicationSteps } from '@/components/site/application-steps';
import { Scholarships } from '@/components/site/scholarships';
import { About } from '@/components/site/about';
import { Testimonials } from '@/components/site/testimonials';
import { Accreditation } from '@/components/site/accreditation';
import { Partnerships } from '@/components/site/partnerships';
import { BlogPostsSection } from '@/components/site/blog-posts-section';
import { CtaBanner } from '@/components/site/cta-banner';

interface Props {
  departments?: any[];
  faqs?: any[];
  testimonials?: any[];
  posts?: any[];
  stats?: {
    students_count?: number;
    teachers_count?: number;
    departments_count?: number;
  };
}

export default function Welcome({ departments, testimonials, posts, stats }: Props) {
  return (
    <>
      <SeoHead />
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <Hero />
          <StatsBar stats={stats} />
          <DepartmentsShowcase departments={departments} />
          <WhyUs />
          <ApplicationSteps />
          <Scholarships />
          <About stats={stats} />
          <Testimonials items={testimonials} />
          <Accreditation />
          <Partnerships />
          <BlogPostsSection items={posts} />
          <CtaBanner />
        </main>
        <SiteFooter />
        <FloatingButtons />
      </div>
    </>
  );
}
