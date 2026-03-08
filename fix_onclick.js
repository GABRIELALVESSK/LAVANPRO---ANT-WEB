const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');
code = code.replace(/onClick="toggleAccordion\((.*?)\)"/g, 'onClick={() => toggleAccordion(\'$1\')}');
fs.writeFileSync('app/page.tsx', code, 'utf8');
console.log('Fixed onClick in page.tsx');
