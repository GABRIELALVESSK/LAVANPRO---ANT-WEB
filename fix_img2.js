const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf-8');
const startMatch = 'src="data:image/png;base64';
let start = code.indexOf(startMatch);
if (start !== -1) {
    let end = code.indexOf('"', start + startMatch.length + 1);
    if (end !== -1) {
        let newCode = code.substring(0, start) + 'src="https://media.istockphoto.com/id/1311333796/pt/foto/young-black-business-woman-checking-clothes-while-working-at-the-dry-cleaners.jpg?s=612x612"' + code.substring(end + 1);
        fs.writeFileSync('app/page.tsx', newCode);
        console.log("Replaced remaining massive base64 string");
    } else {
        console.log("Could not find end of string");
    }
} else {
    console.log("No massive base64 string found");
}
