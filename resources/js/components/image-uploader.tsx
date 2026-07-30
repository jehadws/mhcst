import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, X, UploadCloud, RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  value?: string | null;
  onChange: (path: string | null) => void;
  folder?: string;
  label?: string;
  accept?: string;
  className?: string;
}

export default function ImageUploader({
  value,
  onChange,
  folder = 'uploads',
  label = 'الصورة',
  accept = 'image/*',
  className,
}: ImageUploaderProps) {
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

    setLoading(true);
    setRemoved(false);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const res = await fetch(route('uploads.image'), {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-TOKEN':
            (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
        },
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      onChange(data.path);
      toast.success('تم رفع الصورة');
    } catch (err) {
      toast.error('فشل رفع الصورة');
      console.error(err);
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setRemoved(true);
    onChange('__remove__');
    toast.info('سيتم حذف الصورة عند الحفظ');
  };

  const handleUndoRemove = () => {
    setRemoved(false);
    onChange(null);
  };

  // === وضع "سيتم الحذف" ===
  if (removed) {
    return (
      <div className={cn('space-y-2', className)}>
        <Label>{label}</Label>
        <div className="relative w-56 h-36 border-2 border-dashed border-red-300 bg-red-50 rounded-lg flex flex-col items-center justify-center gap-2">
          <Trash2 className="w-8 h-8 text-red-400" />
          <span className="text-sm text-red-600 font-medium">سيتم حذف الصورة</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleUndoRemove}
            className="text-blue-600 hover:text-blue-700"
          >
            <RotateCcw className="w-3 h-3 ml-1" /> تراجع
          </Button>
        </div>
      </div>
    );
  }

  // === فيه صورة ===
  if (previewUrl) {
    return (
      <div className={cn('space-y-2', className)}>
        <Label>{label}</Label>

        <div className="relative w-fit group">
          {/* الصورة */}
          <img
            src={previewUrl}
            alt="Preview"
            className="w-56 h-36 object-cover rounded-lg border"
          />

          {/* زر الحذف في الزاوية العلوية — العلامة المائية */}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md transition-all hover:scale-110"
            title="حذف الصورة"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // === فارغ — منطقة الرفع ===
  return (
    <div className={cn('space-y-2', className)}>
      <Label>{label}</Label>

      <div
        onClick={() => !loading && inputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center w-56 h-36 rounded-lg border-2 border-dashed transition cursor-pointer',
          loading
            ? 'border-muted bg-muted/50 cursor-not-allowed'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
        )}
      >
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        ) : (
          <>
            <UploadCloud className="w-8 h-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">اضغط لرفع صورة</span>
            <span className="text-[10px] text-muted-foreground/60 mt-1">PNG, JPG, WEBP</span>
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