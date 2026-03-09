const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

function processFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    content = content.replace(/className=(["']|`|{"|{`)(.*?)(["']|`|"}|`})/g, (match) => {
        if (!match.includes('text-white')) return match;

        let shouldKeepWhite = match.includes('bg-brand-primary') ||
            match.includes('bg-red-') ||
            match.includes('bg-emerald-') ||
            match.includes('bg-rose-') ||
            match.includes('bg-slate-900') ||
            match.includes('bg-blue-');

        if (!shouldKeepWhite) {
            return match.replace(/\btext-white\b/g, 'text-brand-text');
        }
        return match;
    });

    // Handle any loose ones not caught by the block above (e.g. inside template literals conditionally)
    // Be careful here, but let's just try the robust regex first.

    // Quick fix for the other components specifically requested by user where text-white might be outside standard quotes format
    content = content.replace(/text-white/g, (match, offset, string) => {
        // check context around it
        let context = string.substring(Math.max(0, offset - 50), Math.min(string.length, offset + 50));
        let shouldKeepWhite = context.includes('bg-brand-primary') ||
            context.includes('bg-red-') ||
            context.includes('bg-emerald-') ||
            context.includes('bg-rose-') ||
            context.includes('bg-blue-');

        if (!shouldKeepWhite) {
            return 'text-brand-text';
        }
        return 'text-white';
    });


    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log("Updated: " + filePath);
    }
}

walk('./app', processFile);
walk('./components', processFile);
