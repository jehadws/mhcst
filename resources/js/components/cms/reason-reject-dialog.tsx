import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { FormEventHandler, useState } from 'react';
import { XCircle } from 'lucide-react';

interface ReasonRejectDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => void;
    title: string;
    description: string;
    reasonLabel: string;
    reasonPlaceholder: string;
    presets: readonly string[];
    confirmText: string;
    cancelText: string;
    processing?: boolean;
}

/**
 * The shared reject/withdraw dialog with Arabic reason templates: preset
 * chips fill the textarea, and the admin can still edit the reason before
 * submitting. Used by the enrollment queue and the admission queue.
 */
export function ReasonRejectDialog({
    isOpen,
    onClose,
    onSubmit,
    title,
    description,
    reasonLabel,
    reasonPlaceholder,
    presets,
    confirmText,
    cancelText,
    processing = false,
}: ReasonRejectDialogProps) {
    const [reason, setReason] = useState('');

    const submit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        if (reason.trim().length < 3) return;
        onSubmit(reason.trim());
        setReason('');
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    setReason('');
                    onClose();
                }
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="font-display">{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="flex flex-col gap-4">
                    {presets.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {presets.map((preset) => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setReason(preset)}
                                    className={`rounded-full border px-3 py-1.5 text-start text-xs font-medium transition-colors ${
                                        reason === preset
                                            ? 'border-destructive/50 bg-destructive/10 text-destructive'
                                            : 'hover:border-destructive/40 text-muted-foreground'
                                    }`}
                                >
                                    {preset}
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="reason-reject-textarea" className="text-sm font-bold">
                            {reasonLabel}
                        </label>
                        <Textarea
                            id="reason-reject-textarea"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={reasonPlaceholder}
                            rows={4}
                            required
                            minLength={3}
                            maxLength={1000}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            {cancelText}
                        </Button>
                        <Button type="submit" variant="destructive" disabled={processing || reason.trim().length < 3} className="gap-2">
                            <XCircle className="size-4" />
                            {confirmText}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default ReasonRejectDialog;
