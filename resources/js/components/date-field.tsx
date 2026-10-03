import { Input } from '@/components/ui/input';
import { useSite } from '@/context/site-context';
import { cn } from '@/lib/utils';
import { CalendarDays } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface ParsedDateInput {
    /** Normalized ISO date (yyyy-mm-dd), '' when empty, null when unparsable. */
    iso: string | null;
    invalid: boolean;
}

/**
 * Accepts day-first dates (14/3/2026, 14-3-2026) and ISO (2026-03-14).
 * Anything else — including US month-first order — is rejected so the stored
 * value is never ambiguous.
 */
export function parseDateInput(raw: string): ParsedDateInput {
    const text = raw.trim();

    if (text === '') {
        return { iso: '', invalid: false };
    }

    let day: number;
    let month: number;
    let year: number;

    const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(text);

    if (iso) {
        year = Number(iso[1]);
        month = Number(iso[2]);
        day = Number(iso[3]);
    } else {
        const dayFirst = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(text);

        if (!dayFirst) {
            return { iso: null, invalid: true };
        }

        day = Number(dayFirst[1]);
        month = Number(dayFirst[2]);
        year = Number(dayFirst[3]);
    }

    const probe = new Date(Date.UTC(year, month - 1, day));

    if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) {
        return { iso: null, invalid: true };
    }

    return { iso: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, invalid: false };
}

export function isoToDisplayDate(iso: string): string {
    const [year, month, day] = iso.split('-');

    return `${day}/${month}/${year}`;
}

interface DateFieldProps {
    id: string;
    /** ISO yyyy-mm-dd, or '' for empty. */
    value: string;
    onChange: (iso: string) => void;
    /** Called on every keystroke; false while the typed text is unparsable. */
    onValidityChange?: (valid: boolean) => void;
    /** Cross-field validation failure driven by the parent. */
    invalid?: boolean;
    formatErrorMessage: string;
    className?: string;
}

/**
 * A localized text date field: the admin types (or reads) day/month/year,
 * while the form value stays ISO for the backend. An unparsable value never
 * reaches the form and blocks saving via onValidityChange.
 */
export function DateField({
    id,
    value,
    onChange,
    onValidityChange,
    invalid = false,
    formatErrorMessage,
    className,
}: DateFieldProps) {
    const { isRTL } = useSite();
    const [text, setText] = useState(() => (value ? isoToDisplayDate(value) : ''));
    const [parseError, setParseError] = useState(false);

    // Follow external resets (Discard button) without clobbering typing.
    useEffect(() => {
        const parsed = parseDateInput(text);

        if ((parsed.iso ?? '') !== value) {
            setText(value ? isoToDisplayDate(value) : '');
            setParseError(false);
            onValidityChange?.(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const handleChange = (raw: string) => {
        setText(raw);

        const parsed = parseDateInput(raw);

        setParseError(parsed.invalid);
        onValidityChange?.(!parsed.invalid);

        if (parsed.iso !== null) {
            onChange(parsed.iso);
        }
    };

    const parsed = parseDateInput(text);
    const showError = parseError;
    const longDate =
        parsed.iso && parsed.iso !== ''
            ? new Date(
                  Number(parsed.iso.slice(0, 4)),
                  Number(parsed.iso.slice(5, 7)) - 1,
                  Number(parsed.iso.slice(8, 10)),
              ).toLocaleDateString(isRTL ? 'ar-LY' : 'en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
              })
            : null;

    return (
        <div className={className}>
            <div className="relative">
                <CalendarDays className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    id={id}
                    dir="ltr"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="dd/mm/yyyy"
                    value={text}
                    onChange={(event) => handleChange(event.target.value)}
                    className={cn('ps-10 text-start tabular-nums', (showError || invalid) && 'border-destructive focus-visible:ring-destructive')}
                />
            </div>
            {showError ? (
                <p className="mt-1 text-xs font-medium text-destructive">{formatErrorMessage}</p>
            ) : longDate ? (
                <p className="mt-1 text-xs text-muted-foreground">{longDate}</p>
            ) : null}
        </div>
    );
}

export default DateField;
