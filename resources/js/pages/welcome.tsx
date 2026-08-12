import { SeoHead } from '@/components/seo-head';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { FloatingButtons } from '@/components/site/floating-buttons';
import { Hero } from '@/components/site/hero';
import { DepartmentsShowcase } from '@/components/site/departments-showcase';
import { WhyUs } from '@/components/site/why-us';
import { ApplicationSteps } from '@/components/site/application-steps';
import { About } from '@/components/site/about';
import { BlogPostsSection } from '@/components/site/blog-posts-section';
import { Testimonials } from '@/components/site/testimonials';
import { Faq } from '@/components/site/faq';
import { Contact } from '@/components/site/contact';
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

export default function Welcome({ departments, faqs, testimonials, posts, stats }: Props) {
  return (
    <>
      <SeoHead />
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <Hero stats={stats} />
          <DepartmentsShowcase departments={departments} />
          <WhyUs />
          <ApplicationSteps />
          <About />
          <Testimonials items={testimonials} />
          <BlogPostsSection items={posts} />
          <Faq items={faqs} />
          <Contact />
          <CtaBanner />
        </main>
        <SiteFooter />
        <FloatingButtons />
      </div>
    </>
  );
}
