/**
 * Temp build helper: downloads the exact Google Fonts subsets this app uses
 * into public/fonts/ and generates resources/css/fonts.css with
 * font-display: swap + unicode-range. Delete after running.
 *
 * Families/weights chosen from actual codebase usage:
 *   - Tajawal 400/500/700/800  (primary sans + serif stack)
 *   - Cairo   400/700          (fallback; lazily fetched by browsers only if a
 *                               glyph is missing from Tajawal)
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const FAMILIES = [
    { name: 'Tajawal', weights: [400, 500, 700, 800] },
    { name: 'Cairo', weights: [400, 700] },
];

const SUBSETS = new Set(['arabic', 'latin']);
const fontsDir = path.resolve('public/fonts');
await mkdir(fontsDir, { recursive: true });

let css = `/* ─────────────────────────────────────────────────────────────
 * Self-hosted web fonts (generated from Google Fonts sources).
 * Regenerate with: node tmp-fetch-fonts.mjs
 * Filenames are versioned — bump "-v1" when replacing a file so the
 * 1-year immutable cache header never serves stale glyphs.
 * ───────────────────────────────────────────────────────────── */

`;

for (const family of FAMILIES) {
    const url = `https://fonts.googleapis.com/css2?family=${family.name}:wght@${family.weights.join(';')}&display=swap`;
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) {
        throw new Error(`Failed to fetch CSS for ${family.name}: ${res.status}`);
    }
    const source = await res.text();

    // Blocks look like:
    // /* arabic */\n@font-face {\n  font-family: 'Tajawal'; ... url(...woff2) ...; unicode-range: ...;\n}
    const blocks = [...source.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]+)\}/g)];

    for (const [, subset, body] of blocks) {
        if (!SUBSETS.has(subset)) continue;

        const weight = body.match(/font-weight:\s*(\d+)/)?.[1];
        const remoteUrl = body.match(/url\((https:[^)]+?\.woff2)\)/)?.[1];
        const unicodeRange = body.match(/unicode-range:\s*([^;]+);/)?.[1]?.trim();
        if (!weight || !remoteUrl || !unicodeRange) continue;

        const fileName = `${family.name.toLowerCase()}-v1-${subset}-${weight}.woff2`;
        const fileRes = await fetch(remoteUrl, { headers: { 'User-Agent': UA } });
        if (!fileRes.ok) {
            throw new Error(`Failed to fetch ${fileName}: ${fileRes.status}`);
        }
        const buf = Buffer.from(await fileRes.arrayBuffer());
        await writeFile(path.join(fontsDir, fileName), buf);

        css += `/* ${family.name} ${weight} — ${subset} */\n`;
        css += '@font-face {\n';
        css += `    font-family: '${family.name}';\n`;
        css += '    font-style: normal;\n';
        css += `    font-weight: ${weight};\n`;
        css += '    font-display: swap;\n';
        css += `    src: url('/fonts/${fileName}') format('woff2');\n`;
        css += `    unicode-range: ${unicodeRange};\n`;
        css += '}\n\n';

        console.log(`✓ ${fileName} (${(buf.length / 1024).toFixed(1)} KB)`);
    }
}

await writeFile(path.resolve('resources/css/fonts.css'), css);
console.log('\nWrote resources/css/fonts.css');