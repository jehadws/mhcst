import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, X, UploadCloud, RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useSite } from '@/context/site-context';

interface ImageUploaderProps {
  value?: string | null;
  onChange: (path: string | null) => void;
  folder?: string;
  label?: string;
  accept?: string;
  className?: string;
}

async function uploadErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json();

    if (typeof data.message === 'string') {
      return data.message;
    }

    const errors = data.errors as Record<string, string[]> | undefined;
    const firstError = errors && Object.values(errors).flat()[0];

    if (firstError) {
      return firstError;
    }
  } catch {
    // Response was not JSON (e.g. redirect HTML).
  }

  if (res.status === 419) {
    return 'Session expired — refresh the page and try again.';
  }

  if (res.status === 403) {
    return 'You do not have permission to upload images.';
  }

  if (res.status === 401 || res.status === 302) {
    return 'You are not signed in — refresh the page and log in again.';
  }

  return 'Upload failed. Use PNG, JPG, or WEBP under 10 MB.';
}

export default function ImageUploader({
  value,
  onChange,
  folder = 'uploads',
  label = 'الصورة',
  accept = 'image/*',
  className,
}: ImageUploaderProps) {
  const { locale } = useSite();
  const isAr = locale === 'ar';
  const [loading, setLoading] = useState(false);
  const [removed, setRemoved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const previewUrl = value?.startsWith('http')
    ? value
    : value && value !== '__remove__'
      ? `/storage/${value}`
      : null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error(isAr ? 'الصورة أكبر من 10 ميجابايت' : 'Image must be 10 MB or smaller.');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    setLoading(true);
    setRemoved(false);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const csrfToken =
      (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

    try {
      const res = await fetch('/uploads/image', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (!res.ok) {
        throw new Error(await uploadErrorMessage(res));
      }

      const data = await res.json();
      onChange(data.path);
      toast.success(isAr ? 'تم رفع الصورة' : 'Image uploaded');
    } catch (err) {
      const message = err instanceof Error ? err.message : isAr ? 'فشل رفع الصورة' : 'Upload failed';
      toast.error(message);
      console.error(err);
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setRemoved(true);
    onChange('__remove__');
    toast.info(isAr ? 'سيتم حذف الصورة عند الحفظ' : 'Image will be removed when you save');
  };

  const handleUndoRemove = () => {
    setRemoved(false);
    onChange(null);
  };

  if (removed) {
    return (
      <div className={cn('space-y-2', className)}>
        <Label>{label}</Label>
        <div className="relative flex h-36 w-56 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-red-300 bg-red-50">
          <Trash2 className="h-8 w-8 text-red-400" />
          <span className="text-sm font-medium text-red-600">
            {isAr ? 'سيتم حذف الصورة' : 'Image will be removed'}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleUndoRemove}
            className="text-blue-600 hover:text-blue-700"
          >
            <RotateCcw className="ml-1 h-3 w-3" /> {isAr ? 'تراجع' : 'Undo'}
          </Button>
        </div>
      </div>
    );
  }

  if (previewUrl) {
    return (
      <div className={cn('space-y-2', className)}>
        <Label>{label}</Label>

        <div className="group relative w-fit">
          <img
            src={previewUrl}
            alt="Preview"
            className="h-36 w-56 rounded-lg border object-cover"
          />

          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1.5 text-white shadow-md transition-all hover:scale-110 hover:bg-red-600"
            title={isAr ? 'حذف الصورة' : 'Remove image'}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Label>{label}</Label>

      <div
        onClick={() => !loading && inputRef.current?.click()}
        className={cn(
          'relative flex h-36 w-56 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition',
          loading
            ? 'cursor-not-allowed border-muted bg-muted/50'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
        )}
      >
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : (
          <>
            <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {isAr ? 'اضغط لرفع صورة' : 'Click to upload'}
            </span>
            <span className="mt-1 text-[10px] text-muted-foreground/60">PNG, JPG, WEBP · 10 MB max</span>
          </>
        )}
      </div>

      <Input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
        disabled={loading}
      />
    </div>
  );
}
