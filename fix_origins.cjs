const fs = require('fs');

const bgSnippet = `
      {/* Liquid waves background base */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-screen"
          style={{ backgroundImage: 'url(/liquid_waves_bg.png)' }}
        />
      </div>
`;

function fixOrigins(file) {
  let data = fs.readFileSync(file, 'utf-8');
  // Inject before the "Fixed Background - Sky to Ground Transition"
  data = data.replace('{/* Fixed Background - Sky to Ground Transition */}', bgSnippet + '\n      {/* Fixed Background - Sky to Ground Transition */}');
  
  // Make the sky gradients partially transparent so we can see the waves
  data = data.replace('background: scrollProgress < 0.7', 'opacity: 0.6,\n            background: scrollProgress < 0.7');
  
  fs.writeFileSync(file, data);
}

fixOrigins('src/Origins.jsx');
console.log('Fixed Origins');
