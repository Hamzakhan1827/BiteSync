const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

// The order matters: Replace 800 to 700 first, but wait, 900 -> 800 -> 700 will make everything 700!
// So: replace 800 -> 700, then 900 -> 800
content = content.replace(/fontWeight: '800'/g, "fontWeight: '700'");
content = content.replace(/fontWeight: '900'/g, "fontWeight: '800'");

fs.writeFileSync('App.tsx', content);
console.log('Font weights softened!');
