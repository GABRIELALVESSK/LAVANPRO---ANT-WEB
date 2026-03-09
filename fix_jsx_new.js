const fs = require('fs');

const filesToFix = [
    'app/settings/page.tsx',
    'app/orders/page.tsx',
    'app/customers/page.tsx',
    'app/finance/page.tsx',
    'app/dashboard/page.tsx',
    'components/transaction-table.tsx',
    'components/sidebar.tsx'
];

for (let file of filesToFix) {
    if (!fs.existsSync(file)) continue;
    let lines = fs.readFileSync(file, 'utf-8').split('\n');
    let changed = false;
    let newLines = lines.map(line => {
        if (!line.includes('text-white')) return line;

        // Check if the line has colored backgrounds 
        const isColored = line.includes('bg-brand-primary') ||
            line.includes('bg-red-') ||
            line.includes('bg-emerald-') ||
            line.includes('bg-blue-') ||
            line.includes('bg-rose-') ||
            line.includes('selection:text-white') ||
            line.includes('!bg-[') ||
            line.includes('bg-amber-') ||
            line.includes('bg-slate-900') ||
            line.includes('text-brand-muted hover:text-white') ||
            line.includes('text-slate-500 hover:text-white');

        if (!isColored) {
            changed = true;
            // also replace hover:text-white to hover:text-brand-text if not button
            return line.replace(/\btext-white\b/g, 'text-brand-text');
        }

        // Exception for text-brand-muted hover:text-white
        if (line.includes('text-brand-muted hover:text-white')) {
            changed = true;
            return line.replace(/hover:text-white/g, 'hover:text-brand-text').replace(/\btext-white\b/g, 'text-brand-text');
        }

        return line;
    });

    if (changed) {
        fs.writeFileSync(file, newLines.join('\n'), 'utf-8');
        console.log(`Updated ${file}`);
    }
}
