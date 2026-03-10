const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf-8');
const regex = /src=\"data:image\/[^\"]+\"/g;
let count = 0;
code = code.replace(regex, (match) => {
    count++;
    return 'src="https://media.istockphoto.com/id/1311333796/pt/foto/young-black-business-woman-checking-clothes-while-working-at-the-dry-cleaners.jpg?s=612x612"';
});
fs.writeFileSync('app/page.tsx', code);
console.log('Replaced ' + count + ' massive base64 strings');
