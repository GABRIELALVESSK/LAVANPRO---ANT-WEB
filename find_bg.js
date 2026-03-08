const fs = require('fs');
const html = fs.readFileSync('landing_page_stitch_new.html', 'utf8');

const styleTags = html.match(/style="([^"]*)"/g) || [];
styleTags.forEach(tag => {
    if (tag.includes('url(')) {
        console.log('Background Image Found:', tag);
    }
});
