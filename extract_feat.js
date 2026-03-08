const fs = require('fs');
const html = fs.readFileSync('landing_page_stitch_new.html', 'utf8');

const match = html.match(/<div class="[^"]*feature-card[\s\S]*?<\/div>/i);
if (match) {
    console.log(match[0]);
} else {
    console.log('No feature-card found');
}
