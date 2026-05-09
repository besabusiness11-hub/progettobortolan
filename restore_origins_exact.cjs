const fs = require('fs');

const appFile = fs.readFileSync('App-082e90d.jsx', 'utf-8');

const cloudGenStart = appFile.indexOf('const CloudGeneratorEffect =');
const cloudGenEnd = appFile.indexOf('const content = {');
const cloudGenCode = appFile.slice(cloudGenStart, cloudGenEnd);

const originsStart = appFile.indexOf('const OriginsPortal =');
const originsEnd = appFile.indexOf('const PurityPortal =');
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
console.log('Restored correctly');
