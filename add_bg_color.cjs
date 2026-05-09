const fs = require('fs');

let data = fs.readFileSync('src/Origins.jsx', 'utf-8');

data = data.replace('className="fixed inset-0 z-50"', 'className="fixed inset-0 z-50 bg-[#020a10]"');

fs.writeFileSync('src/Origins.jsx', data);
console.log('Added bg color');
