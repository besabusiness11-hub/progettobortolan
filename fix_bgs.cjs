const fs = require('fs');

const bgSnippet = `
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-screen"
          style={{ backgroundImage: 'url(/liquid_waves_bg.png)' }}
        />
      </div>
`;

function fixFile(file) {
  let data = fs.readFileSync(file, 'utf-8');
  data = data.replace('className="fixed inset-0 z-50 bg-[#020405]"', 'className="fixed inset-0 z-50 bg-[#020a10]"');
  data = data.replace('{/* Scrollable Container */}', bgSnippet + '      {/* Scrollable Container */}');
  fs.writeFileSync(file, data);
}

fixFile('src/Purity.jsx');
fixFile('src/Story.jsx');
console.log('Fixed Purity and Story');
