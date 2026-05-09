const fs = require('fs');

let data = fs.readFileSync('src/Origins.jsx', 'utf-8');

const startTag = '{/* Fixed Background - Sky to Ground Transition */}';
const endTag = '      {/* Scrollable Container */}';

const startIdx = data.indexOf(startTag);
const endIdx = data.indexOf(endTag);

if (startIdx !== -1 && endIdx !== -1) {
  const before = data.substring(0, startIdx);
  const after = data.substring(endIdx);
  
  const liquidBg = `      {/* Liquid waves background base */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-screen"
          style={{ backgroundImage: 'url(/liquid_waves_bg.png)' }}
        />
      </div>\n\n`;
      
  data = before + liquidBg + after;
  
  fs.writeFileSync('src/Origins.jsx', data);
  console.log('Fixed background in Origins');
} else {
  console.log('Could not find boundaries');
}
