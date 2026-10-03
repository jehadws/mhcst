import { usePage } from '@inertiajs/react';

/**
 * Renders the Inertia validation error bag (e.g. a refused delete) as a
 * dismissible-free banner at the top of CMS list pages. Server messages are
 * already bilingual, so they are shown as-is.
 */
export default function CmsErrorBanner() {
    const serverErrors = usePage().props.errors as Record<string, string> | undefined;
    const messages = Object.values(serverErrors ?? {});

    if (messages.length === 0) {
        return null;
    }

    return (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            <ul className="ps-5 list-disc space-y-1">
                {messages.map((message, index) => (
                    <li key={index}>{message}</li>
                ))}
            </ul>
        </div>
    );
}
