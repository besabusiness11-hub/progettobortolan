const fs = require('fs');

const data = fs.readFileSync('src/App.jsx.backup', 'utf-8');

const originsMatch = data.match(/const OriginsPortal = \(\{ onClose \}\) => \{[\s\S]*?(?=\/\/\s*============================================\s*\n\/\/\s*PURITY PORTAL)/);
if (originsMatch) {
  let content = "import React, { useRef, useState, useEffect } from 'react';\nimport { motion } from 'framer-motion';\nimport { X } from 'lucide-react';\nimport { useLanguage } from './App';\n\n" + originsMatch[0];
  content += "\nexport default OriginsPortal;";
  fs.writeFileSync('src/Origins.jsx', content);
}

const purityMatch = data.match(/const PurityPortal = \(\{ onClose \}\) => \{[\s\S]*?(?=\/\/\s*============================================\s*\n\/\/\s*HOME CONTENT WRAPPER)/);
if (purityMatch) {
  let content = "import React, { useRef, useState, useEffect } from 'react';\nimport { motion } from 'framer-motion';\nimport { X } from 'lucide-react';\nimport { useLanguage } from './App';\n\n" + purityMatch[0];
  content += "\nexport default PurityPortal;";
  fs.writeFileSync('src/Purity.jsx', content);
}

const storyMatch = data.match(/const StoryPortal = \(\{ onClose \}\) => \{[\s\S]*?(?=\/\/\s*============================================\s*\n\/\/\s*ORIGINS PORTAL)/);
if (storyMatch) {
  let content = "import React, { useRef, useState, useEffect } from 'react';\nimport { motion } from 'framer-motion';\nimport { X } from 'lucide-react';\nimport { useLanguage } from './App';\n\n" + storyMatch[0];
  content += "\nexport default StoryPortal;";
  fs.writeFileSync('src/Story.jsx', content);
}

console.log("Extraction complete.");
