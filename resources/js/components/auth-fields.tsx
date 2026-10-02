import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { useSite } from '@/context/site-context';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const authInputClass =
  'h-[50px] rounded-[10px] border-input bg-card px-4 text-sm transition-colors hover:border-muted-foreground/40 focus-visible:border-primary focus-visible:bg-background focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:ring-offset-0';

interface AuthFieldProps extends React.ComponentProps<'input'> {
  label: string;
  error?: string;
}

function AuthFieldLabel({ htmlFor, label, required }: { htmlFor?: string; label: string; required?: boolean }) {
  return (
    <label className="text-foreground text-sm font-bold" htmlFor={htmlFor}>
      {label}
      {required && (
        <span aria-hidden="true" className="text-destructive">
          {' '}
          *
        </span>
      )}
    </label>
  );
}

export function AuthField({ label, error, id, required, className, ...props }: AuthFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <AuthFieldLabel htmlFor={id} label={label} required={required} />
      <Input id={id} required={required} className={cn(authInputClass, className)} {...props} />
      <InputError message={error} />
    </div>
  );
}

export function AuthPasswordField({ label, error, id, required, className, ...props }: AuthFieldProps) {
  const { t } = useSite();
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <AuthFieldLabel htmlFor={id} label={label} required={required} />
      <div className="relative">
        <Input id={id} required={required} type={visible ? 'text' : 'password'} className={cn(authInputClass, 'pe-12', className)} {...props} />
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute inset-y-0 end-0 flex w-12 items-center justify-center rounded-[10px] transition-colors focus-visible:ring-2 focus-visible:outline-none"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? t.auth.hidePassword : t.auth.showPassword}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      <InputError message={error} />
    </div>
  );
}
