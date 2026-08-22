import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import {
    defineConfig
} from 'vite';
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.jsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    build: {
        rollupOptions: {
            output: {
                // Merge per-icon micro-chunks (0.2-1KB each, ~20 requests over
                // HTTP/1.1) into one tree-shaken chunk. Only used icons are kept.
                manualChunks(id) {
                    if (id.includes('node_modules/lucide-react')) {
                        return 'icons';
                    }
                },
            },
        },
    },
});