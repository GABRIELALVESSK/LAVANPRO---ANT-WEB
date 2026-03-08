const fs = require('fs');
let html = fs.readFileSync('landing_page_stitch_new.html', 'utf8');

let headMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
if (headMatches) {
    headMatches.forEach((m, i) => console.log(`Style block ${i} length: ${m.length}`));
    const cssIndex = headMatches.findIndex(m => m.includes('brand-primary'));
    if (cssIndex > -1) {
        const rawCss = headMatches[cssIndex].replace(/<style[^>]*>/, '').replace(/<\/style>/, '');

        const cssContent = `@import "tailwindcss";

@theme {
  --color-primary: #7C3AED;
  --color-background-light: #F8FAFC;
  --color-background-dark: #0F172A;
  --color-navy-800: #1e293b;
  --color-navy-900: #0F172A;
  --color-navy-950: #020617;
  --font-display: "Playfair Display", serif;
  --font-sans: "Inter", sans-serif;
}

/* Base custom styles from Stitch */
${rawCss}
`;
        fs.writeFileSync('app/globals.css', cssContent);
        console.log('Extracted CSS from HTML to globals.css');
    } else {
        console.log('No brand-primary style block found.');
    }
}
