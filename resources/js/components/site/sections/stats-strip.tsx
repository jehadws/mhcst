import { useSite } from '@/context/site-context';
import { cn } from '@/lib/utils';

interface Stats {
    students_count?: number;
    teachers_count?: number;
    departments_count?: number;
}

const pad = (n: number) => String(n).padStart(2, '0');

export function StatsStrip({ stats }: { stats?: Stats }) {
    const { t } = useSite();

    const items = [
        { value: `+${pad(stats?.teachers_count ?? 0)}`, label: t.statsBar.instructors },
        { value: pad(stats?.departments_count ?? 0), label: t.statsBar.departments },
        { value: `+${pad(stats?.students_count ?? 0)}`, label: t.statsBar.graduates },
        { value: t.hero.foundedYear, label: t.statsBar.founded },
    ];

    return (
        <section aria-label={t.statsBar.founded} className="border-line bg-white border-b">
            <div className="site-container grid grid-cols-2 site-md:grid-cols-4">
                {items.map((item, index) => (
                    <div
                        key={item.label}
                        className={cn(
                            'flex min-h-[120px] flex-col justify-center px-4 py-6 site-md:px-6',
                            index > 0 && 'site-md:border-line site-md:border-s',
                        )}
                    >
                        <strong className="font-site-latin block text-[27px] leading-none font-extrabold tracking-[-0.05em] text-ink">
                            {item.value}
                        </strong>
                        <span className="mt-2 block text-[11px] text-ink-muted">{item.label}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
