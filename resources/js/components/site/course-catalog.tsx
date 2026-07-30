import { useSite } from '@/context/site-context';
import { categories, levelLabels, type CourseCategory, type Level } from '@/data/courses';
import { cn } from '@/lib/utils';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CourseCard } from './course-card';

type Sort = 'popular' | 'rating' | 'price-low' | 'price-high';

export function CourseCatalog({ courses }: { courses: any[] }) {
    const { t, tr, dir } = useSite();
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState<CourseCategory | 'all'>('all');
    const [level, setLevel] = useState<Level | 'all'>('all');
    const [sort, setSort] = useState<Sort>('popular');

    const levels: Level[] = ['beginner', 'intermediate', 'advanced'];

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        let list = courses.filter((c) => {
            const matchesCategory = category === 'all' || c.category === category;
            const matchesLevel = level === 'all' || c.level === level;
            const haystack = [c.title_en, c.title_ar, c.bio_en, c.bio_ar, c.instructors[0].name, c.instructors[0].name].join(' ').toLowerCase();
            const matchesQuery = q === '' || haystack.includes(q);
            return matchesCategory && matchesLevel && matchesQuery;
        });

        list = [...list].sort((a, b) => {
            switch (sort) {
                case 'rating':
                    return b.rating - a.rating;
                case 'price-low':
                    return a.price_usd - b.price_usd;
                case 'price-high':
                    return b.price_usd - a.price_usd;
                default:
                    return b.reviews - a.reviews;
            }
        });
        return list;
    }, [query, category, level, sort]);

    const hasFilters = query !== '' || category !== 'all' || level !== 'all';

    const clear = () => {
        setQuery('');
        setCategory('all');
        setLevel('all');
        setSort('popular');
    };

    const selectClasses =
        'h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40';

    return (
        <section id="courses" className="scroll-mt-20">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
                <div className="max-w-2xl">
                    <h2 className="text-foreground font-serif text-3xl font-bold tracking-tight sm:text-4xl">{t.catalog.title}</h2>
                    <p className="text-muted-foreground mt-3 leading-relaxed text-pretty">{t.catalog.subtitle}</p>
                </div>

                {/* Controls */}
                <div className="border-border bg-card mt-8 rounded-2xl border p-4 sm:p-5">
                    <div className="relative">
                        <Search
                            className={cn(
                                'text-muted-foreground pointer-events-none absolute top-1/2 size-4 -translate-y-1/2',
                                dir === 'rtl' ? 'right-3' : 'left-3',
                            )}
                        />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t.catalog.searchPlaceholder}
                            className={cn(
                                'border-input bg-background focus-visible:border-ring focus-visible:ring-ring/40 h-11 w-full rounded-lg border text-sm transition-colors outline-none focus-visible:ring-2',
                                dir === 'rtl' ? 'pr-9 pl-3' : 'pr-3 pl-9',
                            )}
                            aria-label={t.catalog.searchPlaceholder}
                        />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <div className="text-muted-foreground flex items-center gap-2 text-sm">
                            <SlidersHorizontal className="size-4" />
                        </div>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as CourseCategory | 'all')}
                            className={selectClasses}
                            aria-label={t.catalog.allCategories}
                        >
                            <option value="all">{t.catalog.allCategories}</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {tr(c.label)}
                                </option>
                            ))}
                        </select>

                        <select
                            value={level}
                            onChange={(e) => setLevel(e.target.value as Level | 'all')}
                            className={selectClasses}
                            aria-label={t.catalog.allLevels}
                        >
                            <option value="all">{t.catalog.allLevels}</option>
                            {levels.map((l) => (
                                <option key={l} value={l}>
                                    {tr(levelLabels[l])}
                                </option>
                            ))}
                        </select>

                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value as Sort)}
                            className={cn(selectClasses, dir === 'rtl' ? 'mr-auto' : 'ml-auto')}
                            aria-label={t.catalog.sortBy}
                        >
                            <option value="popular">{t.catalog.sortPopular}</option>
                            <option value="rating">{t.catalog.sortRating}</option>
                            <option value="price-low">{t.catalog.sortPriceLow}</option>
                            <option value="price-high">{t.catalog.sortPriceHigh}</option>
                        </select>
                    </div>
                </div>

                {/* Results meta */}
                <div className="mt-6 flex items-center justify-between">
                    <p className="text-muted-foreground text-sm">
                        <span className="text-foreground font-semibold">{filtered.length}</span>{' '}
                        {filtered.length === 1 ? t.catalog.resultsOne : t.catalog.resultsMany}
                    </p>
                    {hasFilters && (
                        <button
                            type="button"
                            onClick={clear}
                            className="text-muted-foreground hover:bg-secondary hover:text-foreground inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors"
                        >
                            <X className="size-4" />
                            {t.catalog.clear}
                        </button>
                    )}
                </div>

                {/* Grid */}
                {filtered.length > 0 ? (
                    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((course) => (
                            <CourseCard key={course.slug} course={course} />
                        ))}
                    </div>
                ) : (
                    <div className="border-border bg-card mt-6 rounded-2xl border border-dashed p-12 text-center">
                        <p className="text-muted-foreground">{t.catalog.empty}</p>
                        <button
                            type="button"
                            onClick={clear}
                            className="border-border bg-background hover:bg-secondary mt-4 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                        >
                            {t.catalog.clear}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
