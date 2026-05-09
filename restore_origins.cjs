const fs = require('fs');

const appFile = fs.readFileSync('App-082e90d.jsx', 'utf-8');

// Find CloudGeneratorEffect
const cloudGenStart = appFile.indexOf('const CloudGeneratorEffect =');
// Find the end of it (it ends before InteractiveCloud or before App)
const cloudGenEnd = appFile.indexOf('const InteractiveCloud =');

// Find OriginsPortal
const originsStart = appFile.indexOf('const OriginsPortal =');
// Find the end of it
const originsEnd = appFile.indexOf('const PurityPortal =');

const cloudGenCode = appFile.slice(cloudGenStart, cloudGenEnd);
const originsCode = appFile.slice(originsStart, originsEnd);

let newOrigins = `import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from './App';

${cloudGenCode}

${originsCode}

export default OriginsPortal;
`;

fs.writeFileSync('src/Origins.jsx', newOrigins);
console.log('Restored Origins from App-082e90d.jsx');
