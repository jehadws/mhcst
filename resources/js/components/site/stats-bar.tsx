import { useSite } from '@/context/site-context';
import { useEffect, useRef, useState } from 'react';

type Stat = { value: number; suffix?: string; prefix?: string; label: string; plain?: boolean };

interface StatsBarProps {
  stats?: {
    students_count?: number;
    teachers_count?: number;
    departments_count?: number;
  };
}

function useCountUp(target: number, run: boolean, plain?: boolean): number {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!run) {
      return;
    }

    if (plain) {
      setN(target);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const dur = 1400;

    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, plain]);

  return n;
}

function StatItem({ stat, run }: { stat: Stat; run: boolean }) {
  const n = useCountUp(stat.value, run, stat.plain);
  const display = stat.plain ? String(n) : n.toLocaleString('en-US');

  return (
    <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
      <span className="font-display text-primary text-3xl leading-tight font-extrabold tabular-nums sm:text-4xl">
        {stat.prefix}
        {display}
        {stat.suffix}
      </span>
      <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
    </div>
  );
}

export function StatsBar({ stats }: StatsBarProps) {
  const { t } = useSite();
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setRun(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  const statItems: Stat[] = [
    { value: 2010, label: t.statsBar.founded, plain: true },
    {
      value: stats?.students_count ?? 1200,
      suffix: '+',
      label: t.statsBar.graduates,
    },
    {
      value: stats?.departments_count ?? 5,
      label: t.statsBar.departments,
    },
    { value: 12, prefix: '+', label: t.statsBar.partners },
    {
      value: stats?.teachers_count ?? 40,
      prefix: '+',
      label: t.statsBar.instructors,
    },
  ];

  return (
    <section className="relative z-10 px-4 pt-10 sm:px-6 lg:px-8">
      <div
        ref={ref}
        className="border-border bg-card divide-border mx-auto grid max-w-6xl grid-cols-2 divide-x rounded-xl border shadow-lg sm:grid-cols-3 lg:grid-cols-5"
      >
        {statItems.map((s) => (
          <StatItem key={s.label} stat={s} run={run} />
        ))}
      </div>
    </section>
  );
}
