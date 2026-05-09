import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useLanguage } from './App';

const StoryPortal = ({ onClose }) => {
  const { t } = useLanguage();
  const scrollContainerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const rafRef = useRef(null);

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

  const chapters = [
    {
      threshold: 0.05,
      title: t.storyChapter1Title,
      text: t.storyChapter1Text,
      detail: t.storyChapter1Detail
    },
    {
      threshold: 0.25,
      title: t.storyChapter2Title,
      text: t.storyChapter2Text,
      detail: t.storyChapter2Detail
    },
    {
      threshold: 0.45,
      title: t.storyChapter3Title,
      text: t.storyChapter3Text,
      detail: t.storyChapter3Detail
    },
    {
      threshold: 0.65,
      title: t.storyChapter4Title,
      text: t.storyChapter4Text,
      detail: t.storyChapter4Detail
    },
    {
      threshold: 0.85,
      title: t.storyChapter5Title,
      text: t.storyChapter5Text,
      detail: t.storyChapter5Detail
    },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-[#020a10]"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
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
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Total scrollable height */}
        <div className="min-h-[400vh] relative">
          
          {/* Hero Section - Sticky */}
          <div className="h-screen sticky top-0 flex flex-col items-center justify-center px-4">
            {/* Header content - fades out immediately on scroll */}
            <motion.div 
              className="relative z-10 text-center transition-all duration-300"
              style={{ 
                opacity: Math.max(0, 1 - scrollProgress * 30),
                transform: `translateY(${scrollProgress * 200}px)`,
                pointerEvents: scrollProgress > 0.02 ? 'none' : 'auto'
              }}
            >
              <motion.span 
                className="text-[10px] font-mono tracking-[0.5em] text-white/70 uppercase block mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {t.storySubtitle}
              </motion.span>
              <motion.h1
                className="font-serif text-4xl md:text-6xl lg:text-7xl font-light text-white tracking-[0.3em] mb-8 drop-shadow-lg"
                style={{ fontFamily: "'Playfair Display', serif" }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
              >
                {t.storyTitle}
              </motion.h1>
              <motion.p
                className="font-serif text-lg md:text-xl text-white/80 font-light italic max-w-xl mx-auto drop-shadow-md"
                style={{ fontFamily: "'Playfair Display', serif" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {t.storyIntro}
              </motion.p>
              
              {/* Scroll indicator */}
              <motion.div 
                className="mt-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <span className="text-[9px] font-mono tracking-[0.3em] text-white/50 uppercase block mb-4">
                  {t.originsScrollToDescend}
                </span>
                <motion.div
                  className="w-[1px] h-16 bg-gradient-to-b from-white/50 to-transparent mx-auto"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            </motion.div>
          </div>

          {/* Chapters - Scroll-triggered content */}
          <div className="relative z-20 -mt-[50vh]">
            {chapters.map((chapter, index) => {
              const isVisible = scrollProgress >= chapter.threshold - 0.1;
              const isActive = scrollProgress >= chapter.threshold && scrollProgress < (chapters[index + 1]?.threshold || 1);
              
              return (
                <div 
                  key={index}
                  className="min-h-[50vh] sm:min-h-[60vh] flex items-center justify-center px-3 sm:px-4 md:px-8"
                >
                  <motion.div
                    className="max-w-2xl w-full ml-auto mr-2 sm:mr-4 md:mr-16 lg:mr-32"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ 
                      opacity: isVisible ? 1 : 0, 
                      x: isVisible ? 0 : 50 
                    }}
                    transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <div className={`
                      relative pl-4 sm:pl-8 border-l-2 transition-all duration-500
                      ${isActive ? 'border-white' : 'border-white/20'}
                    `}>
                      {/* Glowing dot */}
                      <div className={`
                        absolute left-0 top-0 w-3 sm:w-4 h-3 sm:h-4 -translate-x-1/2 rounded-full transition-all duration-500
                        ${isActive 
                          ? 'bg-white shadow-[0_0_30px_rgba(255,255,255,0.8)]' 
                          : 'bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.3)]'
                        }
                      `} />
                      
                      {/* Chapter number */}
                      <span className={`
                        text-lg sm:text-2xl md:text-4xl font-mono font-light mb-1 sm:mb-2 block transition-colors duration-500
                        ${isActive ? 'text-white' : 'text-white/50'}
                      `}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      
                      {/* Title */}
                      <span className={`text-[9px] sm:text-[11px] font-mono tracking-[0.3em] uppercase block mb-2 sm:mb-4 transition-colors duration-500 ${isActive ? 'text-[#D4AF37]' : 'text-[#D4AF37]/60'}`}>
                        {chapter.title}
                      </span>
                      
                      {/* Main text */}
                      <p className="text-sm sm:text-lg md:text-xl text-white/90 font-light leading-relaxed mb-2 sm:mb-4 drop-shadow-md">
                        {chapter.text}
                      </p>
                      
                      {/* Detail text - only show when active */}
                      <motion.p 
                        className="text-xs sm:text-sm text-white/60 font-light leading-relaxed"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ 
                          opacity: isActive ? 1 : 0,
                          height: isActive ? 'auto' : 0
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        {chapter.detail}
                      </motion.p>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>

          {/* Final Section */}
          <div className="min-h-[50vh] flex items-center justify-center px-4">
            <motion.div
              className="text-center max-w-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: scrollProgress > 0.9 ? 1 : 0 }}
              transition={{ duration: 1 }}
            >
              <div className="w-16 h-[1px] bg-[#D4AF37]/60 mx-auto mb-8" />
              <p className="font-serif text-xl md:text-2xl text-[#D4AF37] font-light italic drop-shadow-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
                "{t.storyFinalQuote}"
              </p>
              <div className="w-16 h-[1px] bg-[#D4AF37]/60 mx-auto mt-8" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Fixed UI Elements */}
      
      {/* Close Button */}
      <motion.button
        onClick={onClose}
        className="fixed top-3 sm:top-6 right-3 sm:right-4 md:right-8 z-[60] flex items-center gap-2 group"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span className="text-[8px] sm:text-[10px] font-mono tracking-[0.2em] text-white/50 uppercase group-hover:text-[#D4AF37] transition-colors duration-300 hidden sm:inline">
          {t.storyBack}
        </span>
        <X className="w-4 h-4 sm:w-5 sm:h-5 text-white/50 group-hover:text-[#D4AF37] transition-colors duration-300" />
      </motion.button>

      {/* Progress indicator - Right side */}
      <motion.div 
        className="fixed right-3 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-[60]"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex flex-col items-end">
          <span className="text-[7px] sm:text-[9px] font-mono tracking-[0.2em] sm:tracking-[0.3em] text-white/50 uppercase mb-1 sm:mb-2">
            Progress
          </span>
          <span className="text-2xl sm:text-4xl md:text-6xl font-mono text-white font-light tabular-nums drop-shadow-lg">
            {Math.round(scrollProgress * 100)}%
          </span>
        </div>
        
        {/* Vertical Progress Line */}
        <div className="w-[1px] sm:w-[2px] h-20 sm:h-32 bg-white/10 mt-2 sm:mt-4 relative overflow-hidden rounded-full">
          <motion.div 
            className="absolute top-0 left-0 w-full bg-gradient-to-b from-white/50 to-[#D4AF37] rounded-full"
            style={{ height: `${scrollProgress * 100}%` }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};


export default StoryPortal;