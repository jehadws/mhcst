import { useSite } from '@/context/site-context';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const fieldClass =
  'w-full border-0 border-b border-line bg-transparent px-0 py-[10px] text-[14px] text-ink outline-none transition-colors placeholder:text-ink-muted/70 focus:border-coral disabled:opacity-50';

interface AuthFieldProps extends React.ComponentProps<'input'> {
  label: string;
  error?: string;
}

function AuthFieldShell({
  id,
  label,
  required,
  error,
  className,
  children,
}: {
  id?: string;
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <label htmlFor={id} className="mb-2 block text-[12px] text-ink-muted">
        {label}
        {required && (
          <span aria-hidden="true" className="text-coral">
            {' '}
            *
          </span>
        )}
      </label>
      {children}
      {error && <p className="m-0 mt-2 text-[11px] font-semibold text-coral">{error}</p>}
    </div>
  );
}

export function AuthField({ label, error, id, required, className, ...props }: AuthFieldProps) {
  return (
    <AuthFieldShell id={id} label={label} required={required} error={error} className={className}>
      <input id={id} required={required} className={fieldClass} {...props} />
    </AuthFieldShell>
  );
}

export function AuthPasswordField({ label, error, id, required, className, ...props }: AuthFieldProps) {
  const { t } = useSite();
  const [visible, setVisible] = useState(false);

  return (
    <AuthFieldShell id={id} label={label} required={required} error={error} className={className}>
      <div className="relative">
        <input id={id} required={required} type={visible ? 'text' : 'password'} className={cn(fieldClass, 'pe-10')} {...props} />
        <button
          type="button"
          className="absolute inset-y-0 end-0 grid w-9 place-items-center text-ink-muted transition-colors hover:text-coral"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? t.auth.hidePassword : t.auth.showPassword}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
        </button>
      </div>
    </AuthFieldShell>
  );
}
