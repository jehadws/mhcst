import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';
import { initializeTheme } from './hooks/use-appearance';
import { SiteProvider } from './context/site-context';
import { Toaster } from './components/ui/sonner';

declare global {
    const route: typeof routeFn;
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        const initialPage = props.initialPage;
        const locale = initialPage?.props?.locale ?? 'en';
        const direction = initialPage?.props?.direction ?? 'ltr';

        root.render(
            <SiteProvider initialLocale={locale} initialDirection={direction}>
                <App {...props} />
                <Toaster />
            </SiteProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
