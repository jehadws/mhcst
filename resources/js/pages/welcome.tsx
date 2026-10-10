import { SeoHead } from '@/components/seo-head';
import { Admissions } from '@/components/site/sections/admissions';
import { CampusSplit } from '@/components/site/sections/campus-split';
import { CtaBand } from '@/components/site/sections/cta-band';
import { HeroSection } from '@/components/site/sections/hero-section';
import { IntroStatement } from '@/components/site/sections/intro-statement';
import { NewsHome } from '@/components/site/sections/news-home';
import { Programs, type Department } from '@/components/site/sections/programs';
import { StatsStrip } from '@/components/site/sections/stats-strip';
import { TrustBand } from '@/components/site/sections/trust-band';
import { Values } from '@/components/site/sections/values';
import { SiteLayout } from '@/components/site/site-layout';
import type { Banner } from '@/types';
import { type NewsPost } from '@/lib/news';

interface Props {
  departments?: Department[];
  posts?: NewsPost[];
  banners?: Banner[];
  stats?: {
    students_count?: number;
    teachers_count?: number;
    departments_count?: number;
  };
}

export default function Welcome({ banners, departments, posts, stats }: Props) {
  return (
    <>
      <SeoHead />
      <SiteLayout>
        <HeroSection banners={banners} />
        <StatsStrip stats={stats} />
        <IntroStatement />
        <Programs departments={departments} />
        <CampusSplit />
        <Admissions />
        <Values />
        <TrustBand />
        <NewsHome posts={posts} />
        <CtaBand />
      </SiteLayout>
    </>
  );
}
