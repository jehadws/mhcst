import { useCms } from '@/hooks/use-cms';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface AdmissionScopeLevel {
    id: number;
    year: number;
    section: string;
}

export interface AdmissionScopeDepartment {
    id: number;
    name: string;
    levels: AdmissionScopeLevel[];
}

interface AdmissionScopeMatrixProps {
    departments: AdmissionScopeDepartment[];
    /** Selected level ids; empty means every level is open (explicit "all" state). */
    selectedLevelIds: number[];
    onChange: (ids: number[]) => void;
}

const cellToggle = (selected: boolean) =>
    cn(
        'inline-flex size-9 items-center justify-center rounded-lg border text-sm font-bold tabular-nums transition-colors',
        'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        selected
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-input bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground',
    );

const groupToggle = (selected: boolean) =>
    cn(
        'inline-flex h-8 items-center justify-center gap-1 rounded-full border px-3 text-xs font-bold transition-colors',
        'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        selected
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-input bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground',
    );

/**
 * Department × year × section matrix replacing the flat pill list on the
 * admission settings. The selected level ids are the single source of truth
 * for the admission scope: a department whose levels are all unselected does
 * not appear on the public application form at all.
 */
export function AdmissionScopeMatrix({ departments, selectedLevelIds, onChange }: AdmissionScopeMatrixProps) {
    const { c } = useCms();
    const s = c.settings;

    const allLevelIds = departments.flatMap((department) => department.levels.map((level) => level.id));
    const allSelected = allLevelIds.length > 0 && allLevelIds.every((id) => selectedLevelIds.includes(id));

    const setIds = (ids: number[], select: boolean): number[] =>
        select
            ? Array.from(new Set([...selectedLevelIds, ...ids]))
            : selectedLevelIds.filter((id) => !ids.includes(id));

    const selectedDepartments = departments.filter((department) =>
        department.levels.some((level) => selectedLevelIds.includes(level.id)),
    );

    const summary =
        allSelected || selectedLevelIds.length === 0
            ? s.scopeSummaryAll
            : s.scopeSummaryCounts
                  .replace('{departments}', String(selectedDepartments.length))
                  .replace('{totalDepartments}', String(departments.length))
                  .replace('{levels}', String(selectedLevelIds.length))
                  .replace('{totalLevels}', String(allLevelIds.length));

    if (departments.length === 0) {
        return (
            <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">{s.admissionNoDepartments}</div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{summary}</p>
                <div className="flex items-center gap-2">
                    <button type="button" className={groupToggle(allSelected)} aria-pressed={allSelected} onClick={() => onChange(allSelected ? [] : allLevelIds)}>
                        {allSelected && <Check className="size-3.5" />}
                        {s.selectAll}
                    </button>
                    <button
                        type="button"
                        className={groupToggle(false)}
                        onClick={() => onChange([])}
                        disabled={selectedLevelIds.length === 0}
                    >
                        {s.clearAll}
                    </button>
                </div>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{s.admissionScopeHint}</p>

            <div className="space-y-3">
                {departments.map((department) => {
                    const departmentLevelIds = department.levels.map((level) => level.id);
                    const departmentAllSelected =
                        departmentLevelIds.length > 0 && departmentLevelIds.every((id) => selectedLevelIds.includes(id));
                    const selectedCount = departmentLevelIds.filter((id) => selectedLevelIds.includes(id)).length;

                    const years = Array.from(new Set(department.levels.map((level) => level.year))).sort((a, b) => a - b);
                    const sections = Array.from(new Set(department.levels.map((level) => level.section))).sort((a, b) =>
                        a.localeCompare(b),
                    );

                    return (
                        <div key={department.id} className="rounded-xl border p-4">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-sm font-bold">{department.name}</span>
                                    <span className="text-xs tabular-nums text-muted-foreground">
                                        {selectedCount}/{departmentLevelIds.length}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    className={groupToggle(departmentAllSelected)}
                                    aria-pressed={departmentAllSelected}
                                    onClick={() => onChange(setIds(departmentLevelIds, !departmentAllSelected))}
                                    disabled={departmentLevelIds.length === 0}
                                >
                                    {departmentAllSelected && <Check className="size-3.5" />}
                                    {s.selectAll}
                                </button>
                            </div>

                            {department.levels.length === 0 ? (
                                <p className="text-xs text-muted-foreground">{s.noLevels}</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-xs text-muted-foreground">
                                                <th className="w-24 pb-2 text-start font-medium" />
                                                <th className="w-16 pb-2 text-center font-medium">{s.levelColumnAll}</th>
                                                {sections.map((section) => (
                                                    <th key={section} className="w-16 pb-2 text-center font-medium">
                                                        {section}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {years.map((year) => {
                                                const yearLevels = department.levels.filter((level) => level.year === year);
                                                const yearIds = yearLevels.map((level) => level.id);
                                                const yearAllSelected = yearIds.every((id) => selectedLevelIds.includes(id));

                                                return (
                                                    <tr key={year} className="border-t">
                                                        <th scope="row" className="py-1.5 pe-2 text-start text-xs font-bold">
                                                            {s.yearLabel.replace('{year}', String(year))}
                                                        </th>
                                                        <td className="py-1.5 text-center">
                                                            <button
                                                                type="button"
                                                                className={cn(cellToggle(yearAllSelected), 'size-9 min-w-12 text-xs')}
                                                                aria-pressed={yearAllSelected}
                                                                aria-label={`${department.name} — ${s.yearLabel.replace('{year}', String(year))}: ${s.selectAll}`}
                                                                onClick={() => onChange(setIds(yearIds, !yearAllSelected))}
                                                            >
                                                                <Check className="size-4" />
                                                            </button>
                                                        </td>
                                                        {sections.map((section) => {
                                                            const level = yearLevels.find((candidate) => candidate.section === section);

                                                            if (!level) {
                                                                return <td key={section} className="py-1.5 text-center" />;
                                                            }

                                                            const selected = selectedLevelIds.includes(level.id);

                                                            return (
                                                                <td key={section} className="py-1.5 text-center">
                                                                    <button
                                                                        type="button"
                                                                        className={cellToggle(selected)}
                                                                        aria-pressed={selected}
                                                                        aria-label={`${department.name} — ${s.yearLabel.replace('{year}', String(year))} — ${level.section}`}
                                                                        title={`${department.name} — ${s.yearLabel.replace('{year}', String(year))} — ${level.section}`}
                                                                        onClick={() => onChange(setIds([level.id], !selected))}
                                                                    >
                                                                        {level.section}
                                                                    </button>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default AdmissionScopeMatrix;
