import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { WaFollowup } from '@/types/cms';
import { Check, Copy, MessageCircle, X } from 'lucide-react';
import { useState } from 'react';

interface WaFollowupsPanelProps {
    followups: WaFollowup[];
    title: string;
    hint: string;
    copyLabel: string;
    copiedLabel: string;
    dismissLabel: string;
}

/**
 * Post-action WhatsApp follow-ups: after a bulk/single decision the backend
 * hands back ready-made Arabic messages per affected student; the admin
 * sends each with one tap via the wa.me deep link, or copies the text.
 */
export function WaFollowupsPanel({ followups, title, hint, copyLabel, copiedLabel, dismissLabel }: WaFollowupsPanelProps) {
    const [dismissed, setDismissed] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    if (followups.length === 0 || dismissed) {
        return null;
    }

    const copyMessage = async (message: string, index: number) => {
        try {
            await navigator.clipboard.writeText(message);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch {
            // Clipboard unavailable (insecure context) — the WhatsApp button is the fallback.
        }
    };

    return (
        <div className="flex flex-col gap-3 rounded-xl border border-success/20 bg-success/5 px-4 py-3" data-testid="wa-followups">
            <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col">
                    <span className="flex items-center gap-2 text-sm font-bold text-success">
                        <MessageCircle className="size-4" />
                        {title}
                        <Badge variant="outline" className="tabular-nums">
                            {followups.length}
                        </Badge>
                    </span>
                    <span className="text-xs text-muted-foreground">{hint}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setDismissed(true)} aria-label={dismissLabel}>
                    <X className="size-4" />
                </Button>
            </div>
            <ul className="flex flex-col divide-y">
                {followups.map((followup, index) => (
                    <li key={`${followup.name}-${index}`} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                        <div className="flex min-w-0 flex-col">
                            <span className="text-sm font-semibold">{followup.name}</span>
                            <span className="truncate text-xs text-muted-foreground" dir="rtl">
                                {followup.message.split('\n').filter(Boolean)[1] ?? followup.message}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            {followup.link && (
                                <Button variant="outline" size="sm" asChild className="gap-1.5 border-success/40 text-success hover:bg-success/10">
                                    <a href={followup.link} target="_blank" rel="noopener noreferrer">
                                        <MessageCircle className="size-3.5" />
                                        WhatsApp
                                    </a>
                                </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => copyMessage(followup.message, index)} title={copyLabel} className="gap-1.5">
                                {copiedIndex === index ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
                                {copiedIndex === index ? copiedLabel : ''}
                            </Button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default WaFollowupsPanel;
