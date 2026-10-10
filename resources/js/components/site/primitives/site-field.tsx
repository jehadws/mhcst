import { useSite } from '@/context/site-context';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { useState, type ReactNode } from 'react';

const fieldClass =
    'w-full border-0 border-b border-line bg-transparent px-0 py-[10px] text-[14px] text-ink outline-none transition-colors focus:border-coral disabled:opacity-50';

interface FieldShellProps {
    id: string;
    label: string;
    required?: boolean;
    error?: string;
    hint?: ReactNode;
    className?: string;
    children: ReactNode;
}

function FieldShell({ id, label, required, error, hint, className, children }: FieldShellProps) {
    return (
        <div className={cn('min-w-0', className)}>
            <label htmlFor={id} className="mb-2 block text-[12px] text-ink-muted">
                {label}
                {required ? (
                    <span aria-hidden="true" className="text-coral">
                        {' '}
                        *
                    </span>
                ) : null}
            </label>
            {children}
            {error ? (
                <p className="m-0 mt-2 text-[11px] font-semibold text-coral">{error}</p>
            ) : hint ? (
                <p className="m-0 mt-2 text-[11px] text-ink-muted">{hint}</p>
            ) : null}
        </div>
    );
}

interface SiteFieldProps extends Omit<React.ComponentProps<'input'>, 'className'> {
    id: string;
    label: string;
    error?: string;
    hint?: ReactNode;
    wrapClass?: string;
}

export function SiteField({ id, label, required, error, hint, wrapClass, ...props }: SiteFieldProps) {
    return (
        <FieldShell id={id} label={label} required={required} error={error} hint={hint} className={wrapClass}>
            <input id={id} required={required} className={fieldClass} {...props} />
        </FieldShell>
    );
}

export function SitePassword({ id, label, required, error, hint, wrapClass, ...props }: SiteFieldProps) {
    const { t } = useSite();
    const [visible, setVisible] = useState(false);

    return (
        <FieldShell id={id} label={label} required={required} error={error} hint={hint} className={wrapClass}>
            <div className="relative">
                <input id={id} required={required} type={visible ? 'text' : 'password'} className={cn(fieldClass, 'pe-10')} {...props} />
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? t.auth.hidePassword : t.auth.showPassword}
                    aria-pressed={visible}
                    className="absolute inset-y-0 end-0 grid w-9 place-items-center text-ink-muted transition-colors hover:text-coral"
                >
                    {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
                </button>
            </div>
        </FieldShell>
    );
}

interface SiteSelectProps extends Omit<React.ComponentProps<'select'>, 'className'> {
    id: string;
    label: string;
    required?: boolean;
    error?: string;
    hint?: ReactNode;
    wrapClass?: string;
}

export function SiteSelect({ id, label, required, error, hint, wrapClass, children, ...props }: SiteSelectProps) {
    return (
        <FieldShell id={id} label={label} required={required} error={error} hint={hint} className={wrapClass}>
            <select id={id} required={required} className={cn(fieldClass, 'cursor-pointer appearance-none')} {...props}>
                {children}
            </select>
        </FieldShell>
    );
}

interface SiteTextareaProps extends Omit<React.ComponentProps<'textarea'>, 'className'> {
    id: string;
    label: string;
    required?: boolean;
    error?: string;
    hint?: ReactNode;
    wrapClass?: string;
}

export function SiteTextarea({ id, label, required, error, hint, wrapClass, ...props }: SiteTextareaProps) {
    return (
        <FieldShell id={id} label={label} required={required} error={error} hint={hint} className={wrapClass}>
            <textarea id={id} required={required} className={cn(fieldClass, 'resize-y')} {...props} />
        </FieldShell>
    );
}

interface SiteRadioGroupProps {
    legend: string;
    name: string;
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
    wrapClass?: string;
}

export function SiteRadioGroup({ legend, name, options, value, onChange, error, required, wrapClass }: SiteRadioGroupProps) {
    return (
        <fieldset className={cn('min-w-0 border-0 p-0', wrapClass)}>
            <legend className="mb-2 text-[12px] text-ink-muted">
                {legend}
                {required ? (
                    <span aria-hidden="true" className="text-coral">
                        {' '}
                        *
                    </span>
                ) : null}
            </legend>
            <div className="flex flex-wrap gap-2">
                {options.map((option) => {
                    const checked = value === option.value;
                    return (
                        <label
                            key={option.value}
                            className={cn(
                                'cursor-pointer border px-[14px] py-[9px] text-[12px] font-bold transition-colors',
                                checked ? 'border-ink bg-ink text-white' : 'border-line text-ink-muted hover:border-coral hover:text-ink',
                            )}
                        >
                            <input
                                type="radio"
                                name={name}
                                value={option.value}
                                checked={checked}
                                onChange={() => onChange(option.value)}
                                className="sr-only"
                            />
                            {option.label}
                        </label>
                    );
                })}
            </div>
            {error ? <p className="m-0 mt-2 text-[11px] font-semibold text-coral">{error}</p> : null}
        </fieldset>
    );
}

/** Fieldset heading inside a long public form. */
export function FormSection({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
    return (
        <fieldset className={cn('border-b border-line pb-8', className)}>
            <legend className="pb-4 text-[20px] font-semibold tracking-[-0.03em] text-ink">{title}</legend>
            {children}
        </fieldset>
    );
}
