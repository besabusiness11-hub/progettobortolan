const fs = require('fs');

let origins = fs.readFileSync('src/Origins.jsx', 'utf-8');

// Find the second declaration of useLanguage and remove everything between it and OriginsPortal
const secondUseLanguage = origins.lastIndexOf('const useLanguage = () => {');
if (secondUseLanguage > -1) {
  // It shouldn't be here. Let me just rebuild it using regex or precise slicing.
}

let appFile = fs.readFileSync('App-082e90d.jsx', 'utf-8');

const cloudGenStart = appFile.indexOf('const CloudGeneratorEffect =');
const cloudGenEnd = appFile.indexOf('const InteractiveCloud =');
const cloudGenCode = appFile.slice(cloudGenStart, cloudGenEnd);

const originsStart = appFile.indexOf('const OriginsPortal =');
const originsEnd = appFile.indexOf('const PurityPortal =');
const originsCode = appFile.slice(originsStart, originsEnd);

// There was NO useLanguage inside CloudGeneratorEffect.
// Why did Origins.jsx have a duplicate useLanguage?
// Oh! Did OriginsPortal in App-082e90d.jsx contain useLanguage? No, it's defined at the top of App.jsx!
// Let me look at what originsCode and cloudGenCode actually contain.

let newOrigins = `import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useLanguage } from './App';

${cloudGenCode}

${originsCode}

export default OriginsPortal;
`;

fs.writeFileSync('src/Origins.jsx', newOrigins);
console.log('Fixed Origins.jsx compilation');
