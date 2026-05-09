import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useLanguage } from './App';

const PurityPortal = ({ onClose }) => {
  const { t } = useLanguage();
  const scrollContainerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeElement, setActiveElement] = useState(null);
  const rafRef = useRef(null);
  const mouseRafRef = useRef(null);
  
  // Throttled mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (mouseRafRef.current) return;
      mouseRafRef.current = requestAnimationFrame(() => {
        setMousePosition({ x: e.clientX, y: e.clientY });
        mouseRafRef.current = null;
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (mouseRafRef.current) cancelAnimationFrame(mouseRafRef.current);
    };
  }, []);

  // Optimized scroll tracking with RAF
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight - container.clientHeight;
        const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
        setScrollProgress(progress);
        rafRef.current = null;
      });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const contaminants = [
    { key: 'heavyMetals', label: t.purityHeavyMetals, value: '0.000%', detail: 'Lead, Mercury, Arsenic, Cadmium' },
    { key: 'microplastics', label: t.purityMicroplastics, value: '0.000%', detail: 'Particles < 5mm eliminated' },
    { key: 'bacteria', label: t.purityBacteria, value: '0.000%', detail: 'E.coli, Coliform, Legionella' },
    { key: 'nitrates', label: t.purityNitrates, value: '0.000%', detail: 'Agricultural runoff removed' },
    { key: 'pesticides', label: t.purityPesticides, value: '0.000%', detail: 'All synthetic compounds' },
    { key: 'pharmaceuticals', label: t.purityPharmaceuticals, value: '0.000%', detail: 'Hormone disruptors, antibiotics' },
  ];

  const chemicalParameters = [
    { label: 'pH Level', value: '7.4', unit: '', optimal: true },
    { label: 'Total Dissolved Solids', value: '<10', unit: 'ppm', optimal: true },
    { label: 'Conductivity', value: '12', unit: 'µS/cm', optimal: true },
    { label: 'Hardness', value: '0.8', unit: '°dH', optimal: true },
    { label: 'Sodium', value: '0.2', unit: 'mg/l', optimal: true },
    { label: 'Calcium', value: '1.1', unit: 'mg/l', optimal: true },
    { label: 'Magnesium', value: '0.4', unit: 'mg/l', optimal: true },
    { label: 'Chloride', value: '0.1', unit: 'mg/l', optimal: true },
    { label: 'Sulfate', value: '0.0', unit: 'mg/l', optimal: true },
    { label: 'Fluoride', value: '0.0', unit: 'mg/l', optimal: true },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-[#020a10]"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
    >
      
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-screen"
          style={{ backgroundImage: 'url(/liquid_waves_bg.png)' }}
        />
      </div>
      {/* Scrollable Container */}
      <div 
        ref={scrollContainerRef}
        className="absolute inset-0 overflow-y-auto overflow-x-hidden"
      >
        {/* Total scrollable content */}
        <div className="min-h-[300vh] relative">
          
          {/* ====== SECTION 1: Analysis (Hero) ====== */}
          <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 relative">
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-[0.02]">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#F5F5F5" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Header */}
            <motion.div 
              className="text-center mb-8 md:mb-12 relative z-10"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <span className="text-[8px] md:text-[10px] font-mono tracking-[0.5em] text-[#F5F5F5]/50 uppercase block mb-3 md:mb-4">
                {t.puritySubtitle}
              </span>
              <h1
                className="font-serif text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-light text-[#F5F5F5] tracking-[0.2em] mb-4 md:mb-6"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {t.purityTitle}
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-neutral-500 font-light max-w-lg mx-auto px-2">
                {t.purityDescription}
              </p>
            </motion.div>

            {/* Central Molecule Visualization */}
            <motion.div 
              className="relative mb-8 md:mb-12"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {/* Outer Ring */}
              <motion.div
                className="w-28 h-28 sm:w-40 sm:h-40 md:w-56 md:h-56 rounded-full border border-[#F5F5F5]/10 flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              >
                {/* Orbital Electrons */}
                {[0, 120, 240].map((angle, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#F5F5F5]"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: `rotate(${angle}deg) translateX(${window.innerWidth < 640 ? 48 : window.innerWidth < 768 ? 70 : 96}px) translateY(-50%)`,
                    }}
                    animate={{
                      boxShadow: [
                        '0 0 10px rgba(245,245,245,0.5)',
                        '0 0 20px rgba(245,245,245,0.8)',
                        '0 0 10px rgba(245,245,245,0.5)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  />
                ))}
              </motion.div>
              
              {/* Inner Core */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="w-12 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-[#F5F5F5]/10 to-transparent border border-[#F5F5F5]/20 flex items-center justify-center"
                  animate={{
                    boxShadow: [
                      '0 0 30px rgba(245,245,245,0.1)',
                      '0 0 50px rgba(245,245,245,0.2)',
                      '0 0 30px rgba(245,245,245,0.1)',
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <span className="text-[6px] sm:text-[9px] font-mono tracking-[0.2em] text-[#F5F5F5]/60 uppercase">
                    {t.purityMoleculeLabel}
                  </span>
                </motion.div>
              </div>
            </motion.div>

            {/* Contaminants Grid */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 max-w-3xl w-full relative z-10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              {contaminants.map((item, index) => (
                <motion.div
                  key={item.key}
                  className="relative p-4 md:p-5 border border-[#F5F5F5]/5 bg-[#F5F5F5]/[0.02] backdrop-blur-sm cursor-pointer group overflow-hidden"
                  onMouseEnter={() => setActiveElement(item.key)}
                  onMouseLeave={() => setActiveElement(null)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ borderColor: 'rgba(245,245,245,0.2)' }}
                >
                  <span className="text-[9px] font-mono tracking-[0.2em] text-neutral-600 uppercase block mb-1">
                    {item.label}
                  </span>
                  <span className="text-2xl md:text-3xl font-mono text-[#F5F5F5] font-light">
                    {item.value}
                  </span>
                  <motion.div 
                    className="mt-2 overflow-hidden"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ 
                      height: activeElement === item.key ? 'auto' : 0,
                      opacity: activeElement === item.key ? 1 : 0
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-[8px] font-mono text-neutral-500 block">
                      {item.detail}
                    </span>
                  </motion.div>
                  <motion.span 
                    className="absolute top-2 right-2 text-[8px] font-mono text-[#D4AF37]/60 uppercase"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: activeElement === item.key ? 1 : 0 }}
                  >
                    {t.purityRemoved}
                  </motion.span>
                  
                  {/* Scan line effect on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F5F5F5]/5 to-transparent pointer-events-none"
                    initial={{ y: '-100%' }}
                    animate={{ y: activeElement === item.key ? '100%' : '-100%' }}
                    transition={{ duration: 0.8 }}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Scroll indicator */}
            <motion.div 
              className="mt-8 md:mt-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              style={{ opacity: Math.max(0, 1 - scrollProgress * 5) }}
            >
              <span className="text-[8px] md:text-[9px] font-mono tracking-[0.3em] text-neutral-600 uppercase block mb-3">
                Scroll for Full Report
              </span>
              <motion.div
                className="w-[1px] h-8 md:h-12 bg-gradient-to-b from-[#F5F5F5]/30 to-transparent mx-auto"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </div>

          {/* ====== SECTION 2: The Report ====== */}
          <div className="min-h-screen px-3 sm:px-4 md:px-4 py-16 md:py-20 relative">
            {/* Section Header */}
            <motion.div 
              className="text-center mb-12 md:mb-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: scrollProgress > 0.15 ? 1 : 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-12 md:w-16 h-[1px] bg-[#F5F5F5]/20 mx-auto mb-6 md:mb-8" />
              <span className="text-[8px] md:text-[10px] font-mono tracking-[0.5em] text-[#F5F5F5]/40 uppercase block mb-3 md:mb-4">
                Laboratory Analysis
              </span>
              <h2
                className="font-serif text-xl sm:text-3xl md:text-4xl font-light text-[#F5F5F5] tracking-wider mb-3 md:mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                The Complete Report
              </h2>
              <p className="text-[8px] sm:text-sm md:text-sm text-neutral-600 font-light max-w-md mx-auto px-2">
                Certified analysis from independent European laboratories
              </p>
            </motion.div>

            {/* Parameters Table */}
            <motion.div 
              className="max-w-2xl mx-auto px-2"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: scrollProgress > 0.2 ? 1 : 0, y: scrollProgress > 0.2 ? 0 : 40 }}
              transition={{ duration: 0.8 }}
            >
              <div className="border border-[#F5F5F5]/10 bg-[#F5F5F5]/[0.01] overflow-x-auto">
                {/* Table Header */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 border-b border-[#F5F5F5]/10 bg-[#F5F5F5]/[0.02]">
                  <span className="text-[7px] sm:text-[9px] font-mono tracking-[0.2em] text-[#F5F5F5]/40 uppercase">Parameter</span>
                  <span className="text-[7px] sm:text-[9px] font-mono tracking-[0.2em] text-[#F5F5F5]/40 uppercase text-center">Value</span>
                  <span className="text-[7px] sm:text-[9px] font-mono tracking-[0.2em] text-[#F5F5F5]/40 uppercase text-right">Status</span>
                </div>
                
                {/* Table Rows */}
                {chemicalParameters.map((param, index) => (
                  <motion.div
                    key={param.label}
                    className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 border-b border-[#F5F5F5]/5 hover:bg-[#F5F5F5]/[0.02] transition-colors duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: scrollProgress > 0.25 + index * 0.03 ? 1 : 0, 
                      x: scrollProgress > 0.25 + index * 0.03 ? 0 : -20 
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="text-[8px] sm:text-sm font-mono text-neutral-400">{param.label}</span>
                    <span className="text-[8px] sm:text-sm font-mono text-[#F5F5F5] text-center">
                      {param.value} <span className="text-neutral-600 text-[7px] sm:text-[8px]">{param.unit}</span>
                    </span>
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <span className="text-[6px] sm:text-[8px] font-mono text-[#D4AF37]/80 uppercase">Optimal</span>
                      <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Certification Badge */}
              <motion.div 
                className="mt-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: scrollProgress > 0.6 ? 1 : 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-3 px-6 py-3 border border-[#D4AF37]/20 bg-[#D4AF37]/[0.02]">
                  <div className="w-3 h-3 rounded-full bg-[#D4AF37]/60" />
                  <span className="text-[10px] font-mono tracking-[0.2em] text-[#D4AF37]/80 uppercase">
                    ISO 17025 Certified Laboratory
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* Final Quote */}
            <motion.div 
              className="max-w-xl mx-auto mt-20 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: scrollProgress > 0.75 ? 1 : 0 }}
              transition={{ duration: 1 }}
            >
              <div className="w-12 h-[1px] bg-[#F5F5F5]/10 mx-auto mb-8" />
              <p className="font-serif text-lg md:text-xl text-neutral-400 font-light italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                "What we don't add is as important as what we preserve."
              </p>
              <span className="text-[9px] font-mono tracking-[0.3em] text-neutral-700 uppercase mt-4 block">
                — Aeterna Laboratory Standards
              </span>
              <div className="w-12 h-[1px] bg-[#F5F5F5]/10 mx-auto mt-8" />
            </motion.div>
          </div>

        </div>
      </div>

      {/* Fixed UI Elements */}
      
      {/* Scanning Light Effect Following Cursor */}
      <motion.div
        className="fixed w-48 h-48 pointer-events-none z-30 rounded-full"
        style={{
          left: mousePosition.x - 96,
          top: mousePosition.y - 96,
          background: 'radial-gradient(circle, rgba(245,245,245,0.02) 0%, transparent 70%)',
        }}
      />

      {/* Close Button */}
      <motion.button
        onClick={onClose}
        className="fixed top-3 sm:top-6 right-3 sm:right-4 md:right-8 z-[60] flex items-center gap-2 group"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span className="text-[8px] sm:text-[10px] font-mono tracking-[0.2em] text-neutral-500 uppercase group-hover:text-[#F5F5F5] transition-colors duration-300 hidden sm:inline">
          {t.purityBack}
        </span>
        <X className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-500 group-hover:text-[#F5F5F5] transition-colors duration-300" />
      </motion.button>

      {/* Progress Indicator - Right side */}
      <motion.div 
        className="fixed right-3 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-[60]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          <div className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full transition-all duration-300 ${scrollProgress < 0.3 ? 'bg-[#F5F5F5] scale-125' : 'bg-[#F5F5F5]/30'}`} />
          <div className="w-[1px] h-6 sm:h-8 bg-[#F5F5F5]/10" />
          <div className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full transition-all duration-300 ${scrollProgress >= 0.3 ? 'bg-[#F5F5F5] scale-125' : 'bg-[#F5F5F5]/30'}`} />
        </div>
        <div className="mt-2 sm:mt-4 text-center">
          <span className="text-[6px] sm:text-[8px] font-mono text-neutral-600 uppercase" style={{ writingMode: 'vertical-rl' }}>
            {scrollProgress < 0.3 ? 'Analysis' : 'Report'}
          </span>
        </div>
      </motion.div>

      {/* Corner Decorations */}
      <div className="fixed top-8 left-8 w-12 h-12 border-l border-t border-[#F5F5F5]/10 pointer-events-none z-[55]" />
      <div className="fixed bottom-8 left-8 w-12 h-12 border-l border-b border-[#F5F5F5]/10 pointer-events-none z-[55]" />
      <div className="fixed bottom-8 right-8 w-12 h-12 border-r border-b border-[#F5F5F5]/10 pointer-events-none z-[55]" />
    </motion.div>
  );
};


export default PurityPortal;