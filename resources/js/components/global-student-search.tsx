import { Input } from '@/components/ui/input';
import type { StudentSearchResult } from '@/types/cms';
import { Link, usePage } from '@inertiajs/react';
import { Loader2, Search, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/**
 * The top-bar global student search (phase 4): debounced lookup by name /
 * student number / phone, reachable from every dashboard page. Results are
 * scoped server-side by CmsAuthorizationService (teachers only see their
 * own students), so the box is shown to canManage and isTeacher only.
 */
export function GlobalStudentSearch({ placeholder, hint, emptyLabel }: { placeholder: string; hint: string; emptyLabel: string }) {
    const page = usePage<{ cmsCapabilities?: { canManage: boolean; isTeacher: boolean } }>();
    const capabilities = page.props.cmsCapabilities ?? { canManage: false, isTeacher: false };

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<StudentSearchResult[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const enabled = capabilities.canManage || capabilities.isTeacher;

    useEffect(() => {
        const term = query.trim();

        if (!enabled || term.length < 2) {
            setResults([]);
            setOpen(false);
            setLoading(false);

            return;
        }

        setLoading(true);
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const response = await fetch(`/cms/search/students?q=${encodeURIComponent(term)}`, {
                    signal: controller.signal,
                    headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                });
                const payload = await response.json();
                setResults(payload.data ?? []);
                setOpen(true);
            } catch {
                // Aborted or network hiccup — keep whatever was shown before.
            } finally {
                setLoading(false);
            }
        }, 250);

        return () => {
            controller.abort();
            clearTimeout(timer);
        };
    }, [query, enabled]);

    useEffect(() => {
        const onClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', onClickOutside);

        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    if (!enabled) {
        return null;
    }

    return (
        <div ref={containerRef} className="relative hidden md:block">
            <Search className="text-muted-foreground pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => query.trim().length >= 2 && results.length > 0 && setOpen(true)}
                onKeyDown={(event) => event.key === 'Escape' && setOpen(false)}
                placeholder={placeholder}
                aria-label={placeholder}
                className="h-9 w-52 ps-9 text-sm focus:w-72 lg:w-64 lg:focus:w-80"
            />
            {loading && (
                <Loader2 className="text-muted-foreground absolute end-3 top-1/2 size-3.5 -translate-y-1/2 animate-spin" />
            )}
            {open && (
                <div className="bg-popover absolute top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border shadow-lg">
                    {results.length === 0 ? (
                        <p className="px-4 py-3 text-xs text-muted-foreground">{query.trim().length < 2 ? hint : emptyLabel}</p>
                    ) : (
                        <ul className="max-h-80 overflow-y-auto">
                            {results.map((student) => (
                                <li key={student.id}>
                                    <Link
                                        href={`/cms/students/${student.id}`}
                                        onClick={() => {
                                            setOpen(false);
                                            setQuery('');
                                        }}
                                        className="hover:bg-muted flex items-center gap-3 px-4 py-2.5"
                                    >
                                        <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full">
                                            <UserRound className="size-4" />
                                        </span>
                                        <span className="flex min-w-0 flex-col">
                                            <span className="truncate text-sm font-semibold">{student.name}</span>
                                            <span className="text-muted-foreground truncate text-xs tabular-nums">
                                                {student.student_no}
                                                {student.level ? ` — ${student.level.department ?? ''} ${student.level.year}/${student.level.section}` : ''}
                                            </span>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

export default GlobalStudentSearch;
