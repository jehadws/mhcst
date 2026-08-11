import { router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { SharedData } from '@/types';
import { Download, FileSpreadsheet, FileText, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

interface CmsImportExportProps {
    importEndpoint: string;
    templateUrl?: string;
    exportUrl: string;
    exportPdfUrl: string;
    importLabel?: string;
    templateLabel?: string;
}

export default function CmsImportExport({
    importEndpoint,
    templateUrl,
    exportUrl,
    exportPdfUrl,
    importLabel = 'استيراد من Excel',
    templateLabel = 'تحميل قالب الاستيراد',
}: CmsImportExportProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importing, setImporting] = useState(false);
    const flash = usePage<SharedData>().props.flash;

    const handleImport = () => {
        const file = fileInputRef.current?.files?.[0];
        if (!file) return;

        setImporting(true);
        const formData = new FormData();
        formData.append('file', file);

        router.post(importEndpoint, formData, {
            forceFormData: true,
            onFinish: () => {
                setImporting(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    return (
        <div className="flex flex-col gap-3">
            {(flash.success || (flash.import_errors && flash.import_errors.length > 0)) && (
                <div className="space-y-2">
                    {flash.success && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm px-4 py-2.5 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300">
                            {flash.success}
                        </div>
                    )}
                    {flash.import_errors && flash.import_errors.length > 0 && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm px-4 py-2.5 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300">
                            <div className="font-bold mb-1">ملاحظات الاستيراد ({flash.import_errors.length}):</div>
                            <ul className="list-disc pr-5 space-y-0.5">
                                {flash.import_errors.map((error, i) => (
                                    <li key={i}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleImport}
                />
                <Button
                    variant="outline"
                    size="sm"
                    disabled={importing}
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                >
                    <Upload className="w-4 h-4" />
                    {importing ? 'جاري الاستيراد...' : importLabel}
                </Button>

                {templateUrl && (
                    <Button variant="ghost" size="sm" asChild className="gap-2">
                        <a href={templateUrl}>
                            <FileSpreadsheet className="w-4 h-4" />
                            {templateLabel}
                        </a>
                    </Button>
                )}

                <Button variant="outline" size="sm" asChild className="gap-2">
                    <a href={exportUrl} className="!gap-2">
                        <Download className="w-4 h-4" />
                        تصدير Excel
                    </a>
                </Button>

                <Button variant="outline" size="sm" asChild className="gap-2">
                    <a href={exportPdfUrl} target="_blank" rel="noopener noreferrer">
                        <FileText className="w-4 h-4" />
                        تصدير PDF
                    </a>
                </Button>
            </div>
        </div>
    );
}