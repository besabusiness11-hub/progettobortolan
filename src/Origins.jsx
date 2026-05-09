import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from './App';

const CloudGeneratorEffect = ({ scrollProgress = 0 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isSliderDragging, setIsSliderDragging] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [weatherValue, setWeatherValue] = useState(0);
  const [lightningFlash, setLightningFlash] = useState(false);
  const [lightningGlowStyle, setLightningGlowStyle] = useState({ x: 0, y: 0 });
  const cloudRef = useRef(null);
  const lightningGlowRef = useRef(null);
  const lightningIntervalRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Sincronizza weatherValue con scrollProgress quando non c'├¿ drag dello slider
  useEffect(() => {
    if (!isSliderDragging) {
      const autoWeatherValue = Math.round(Math.min(scrollProgress, 0.85) / 0.85 * 100);
      setWeatherValue(autoWeatherValue);
    }
  }, [scrollProgress, isSliderDragging]);

  // CSS Styles for cloud generator
  const cloudGeneratorStyles = `
    .cg-sky-background {
      position: relative;
      width: 100%;
      height: 500px;
      background: transparent !important;
      overflow: visible;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      border-radius: 0;
      transition: filter 0.3s ease;
    }

    .cg-svg-container {
      width: 0;
      height: 0;
      position: absolute;
    }

    .cg-cloud-container {
      width: 100%;
      height: 100%;
      position: relative;
      filter: url(#cgfilter);
      background: transparent !important;
      border: none !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    .cg-cloud {
      width: 300px;
      height: 140px;
      background: #fff;
      border-radius: 50%;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      cursor: grab;
      will-change: transform;
      touch-action: none;
      border: none !important;
      outline: none !important;
      resize: none;
      box-sizing: border-box;
      padding: 0;
      overflow: hidden;
      box-shadow: none;
    }

    .cg-cloud:active {
      cursor: grabbing;
    }

    .cg-cloud::-webkit-outer-spin-button,
    .cg-cloud::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    .cg-cloud[type=number] {
      -moz-appearance: textfield;
    }

    .cg-cloud::-webkit-resizer {
      display: none;
    }

    .cg-cloud::-moz-resizer {
      display: none;
    }

    .cg-weather-slider-container {
      position: relative;
      bottom: auto;
      left: auto;
      transform: none;
      z-index: 1000;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 20px;
      margin-top: 40px;
      @media (max-width: 640px) {
        margin-top: 32px;
      }
    }

    .cg-sun {
      position: relative;
      top: auto;
      transform: none;
      left: auto;
      width: 16px;
      height: 16px;
      color: white;
      pointer-events: none;
      mix-blend-mode: normal;
      flex-shrink: 0;
    }

    .cg-storm {
      position: relative;
      top: auto;
      transform: none;
      right: auto;
      width: 16px;
      height: 16px;
      color: white;
      pointer-events: none;
      mix-blend-mode: normal;
      flex-shrink: 0;
    }

    .cg-weather-slider {
      width: 250px;
      padding: 2px;
      -webkit-appearance: none;
      appearance: none;
      background: linear-gradient(
        to right,
        rgba(255, 255, 255, 0),
        rgba(0, 0, 0, 0.3)
      );
      border-radius: 20px;
      outline: 1px solid rgba(255, 255, 255, 0.1);
      cursor: pointer;
      border: none;
    }

    .cg-weather-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: white;
      border: 1px solid white;
      cursor: pointer;
      transition: background 0.1s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }

    .cg-weather-slider::-webkit-slider-thumb:hover {
      background: #f0f0f0;
      transition: none;
    }

    .cg-weather-slider::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: white;
      border: 1px solid white;
      cursor: pointer;
      transition: background 0.1s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }

    .cg-weather-slider::-moz-range-thumb:hover {
      background: #f0f0f0;
      transition: none;
    }

    @keyframes cg-lightning-glow {
      0% { opacity: 0.8; }
      15%, 100% { opacity: 0; }
    }

    .cg-lightning-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: radial-gradient(closest-side, white, rgba(255, 255, 255, 0));
      pointer-events: none;
      opacity: 0;
      mix-blend-mode: overlay;
      filter: blur(50px);
    }

    .cg-lightning-glow.flash {
      animation: cg-lightning-glow 0.8s ease-out;
    }
  `;

  // Handle drag start
  const handleMouseDown = (e) => {
    const rect = cloudRef.current.getBoundingClientRect();
    const scrollbarWidth = cloudRef.current.offsetWidth - cloudRef.current.clientWidth;
    const resizeHandleSize = 50;

    if (e.clientX > rect.right - scrollbarWidth - resizeHandleSize) return;
    if (e.clientY > rect.bottom - resizeHandleSize) return;

    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - offsetX,
      y: e.clientY - offsetY
    };
  };

  // Handle mouse move - Cloud follows cursor
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Sempre aggiorna la posizione della nuvola per seguire il mouse
      const skyBg = document.querySelector('.cg-sky-background');
      if (skyBg) {
        const rect = skyBg.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calcola la distanza dal centro
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Offset dal centro (max 150px in ogni direzione)
        const offsetFromCenterX = Math.max(-150, Math.min(150, mouseX - centerX));
        const offsetFromCenterY = Math.max(-150, Math.min(150, mouseY - centerY));
        
        setOffsetX(offsetFromCenterX);
        setOffsetY(offsetFromCenterY);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Linear interpolation helper
  const lerp = (start, end, t) => start + (end - start) * t;

  // Update weather effects
  const updateWeather = (value) => {
    const t = value / 100;
    setWeatherValue(value);

    if (value === 100) {
      if (!lightningIntervalRef.current) {
        scheduleLightning();
      }
    } else {
      if (lightningIntervalRef.current) {
        clearTimeout(lightningIntervalRef.current);
        lightningIntervalRef.current = null;
      }
    }
  };

  // Trigger lightning flash
  const triggerLightning = () => {
    if (!cloudRef.current) return;

    const cloudRect = cloudRef.current.getBoundingClientRect();
    const randomX = (Math.random() - 0.5) * (cloudRect.width * 0.6);
    const randomY = Math.random() * (cloudRect.height * 0.3);

    setLightningGlowStyle({ x: randomX, y: randomY });
    setLightningFlash(true);

    setTimeout(() => {
      setLightningFlash(false);
    }, 800);
  };

  // Schedule lightning
  const scheduleLightning = () => {
    const randomDelay = 300 + Math.random() * 1200;

    lightningIntervalRef.current = setTimeout(() => {
      triggerLightning();
      scheduleLightning();
    }, randomDelay);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (lightningIntervalRef.current) {
        clearTimeout(lightningIntervalRef.current);
      }
    };
  }, []);

  // Calculate background saturation/brightness
  const saturation = lerp(100, 30, weatherValue / 100);
  const brightness = lerp(100, 50, weatherValue / 100);

  return (
    <div className="w-full">
      <style>{cloudGeneratorStyles}</style>

      {/* Sky Background */}
      <div
        className="cg-sky-background"
        style={{
          filter: `saturate(${saturation}%) brightness(${brightness}%)`
        }}
      >
        {/* SVG Filters */}
        <svg className="cg-svg-container" xmlns="http://www.w3.org/2000/svg">
          <filter
            id="cgfilter"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
            style={{ colorInterpolationFilters: 'sRGB' }}
          >
            <feTurbulence
              type="fractalNoise"
              seed="462"
              baseFrequency="0.011"
              numOctaves="5"
              result="noise1"
            />
            <feTurbulence
              type="fractalNoise"
              seed="462"
              baseFrequency="0.011"
              numOctaves="2"
              result="noise2"
            />
            <feGaussianBlur in="SourceGraphic" stdDeviation="20" result="blur1" />
            <feDisplacementMap in="blur1" scale="100" in2="noise1" result="cloud1" />
            <feFlood id="cgshadow2" floodColor="rgb(215,215,215)" floodOpacity={lerp(0, 0.4, weatherValue / 100)} />
            <feComposite operator="in" in2="SourceGraphic" />
            <feOffset dx="-10" dy="-3" />
            <feMorphology radius="20" />
            <feGaussianBlur stdDeviation="20" />
            <feDisplacementMap scale="100" in2="noise1" result="cloud2" />
            <feFlood id="cgshadow3" floodColor="rgb(66,105,146)" floodOpacity={lerp(0.1, 0.4, weatherValue / 100)} />
            <feComposite operator="in" in2="SourceGraphic" />
            <feOffset dx="-10" dy="40" />
            <feMorphology radius="0 40" />
            <feGaussianBlur stdDeviation="20" />
            <feDisplacementMap scale="80" in2="noise2" result="cloud3" />
            <feFlood id="cgshadow4" floodColor="rgb(0,0,0)" floodOpacity={lerp(0.2, 0.6, weatherValue / 100)} />
            <feComposite operator="in" in2="SourceGraphic" />
            <feOffset dx="20" dy="60" />
            <feMorphology radius="0 65" />
            <feGaussianBlur stdDeviation="30" />
            <feDisplacementMap scale="100" in2="noise2" result="cloud4" />
            <feFlood id="cgshadow5" floodColor="rgb(0,0,0)" floodOpacity={lerp(0.2, 0.7, weatherValue / 100)} />
            <feComposite operator="in" in2="SourceGraphic" />
            <feOffset dx="20" dy="70" />
            <feMorphology radius="0 200" />
            <feGaussianBlur stdDeviation="30" />
            <feDisplacementMap scale="100" in2="noise2" result="cloud5" />
            <feMerge>
              <feMergeNode in="cloud1" id="cg-feMergeNode954" />
              <feMergeNode in="cloud2" id="cg-feMergeNode956" />
              <feMergeNode in="cloud3" id="cg-feMergeNode958" />
              <feMergeNode in="cloud4" id="cg-feMergeNode960" />
              <feMergeNode in="cloud5" id="cg-feMergeNode962" />
            </feMerge>
          </filter>
        </svg>

        {/* Cloud Container */}
        <div className="cg-cloud-container">
          <textarea
            ref={cloudRef}
            className="cg-cloud"
            readOnly
            style={{
              transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`,
              filter: `brightness(${Math.max(45, 100 - weatherValue * 0.55)}) contrast(${100 + weatherValue * 0.3})`
            }}
          />
        </div>

        {/* Lightning Glow */}
        <div
          ref={lightningGlowRef}
          className={`cg-lightning-glow ${lightningFlash ? 'flash' : ''}`}
          style={{
            transform: `translate(calc(-50% + ${lightningGlowStyle.x}px), calc(-50% + ${lightningGlowStyle.y}px))`
          }}
        />

        {/* Weather Slider Container */}
        <div 
          className="cg-weather-slider-container"
          style={{ 
            opacity: Math.max(0, 1 - scrollProgress * 5),
            transition: 'opacity 0.3s ease',
            pointerEvents: scrollProgress > 0.15 ? 'none' : 'auto'
          }}
        >
          <svg
            className="cg-sun"
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="16px"
            height="16px"
            viewBox="0 0 20 20"
          >
            <circle cx="10" cy="10" r="4" strokeWidth="0" fill="currentColor" />
            <line
              x1="10"
              y1="2"
              x2="10"
              y2="3.5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <line
              x1="15.657"
              y1="4.343"
              x2="14.596"
              y2="5.404"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <line
              x1="18"
              y1="10"
              x2="16.5"
              y2="10"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <line
              x1="15.657"
              y1="15.657"
              x2="14.596"
              y2="14.596"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <line
              x1="10"
              y1="18"
              x2="10"
              y2="16.5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <line
              x1="4.343"
              y1="15.657"
              x2="5.404"
              y2="14.596"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <line
              x1="2"
              y1="10"
              x2="3.5"
              y2="10"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <line
              x1="4.343"
              y1="4.343"
              x2="5.404"
              y2="5.404"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>

          <input
            type="range"
            min="0"
            max="100"
            value={weatherValue}
            onChange={(e) => updateWeather(Number(e.target.value))}
            onMouseDown={() => setIsSliderDragging(true)}
            onMouseUp={() => setIsSliderDragging(false)}
            onTouchStart={() => setIsSliderDragging(true)}
            onTouchEnd={() => setIsSliderDragging(false)}
            className="cg-weather-slider"
          />

          <svg
            className="cg-storm"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            fill="currentColor"
          >
            <path d="M96 416a16 16 0 01-14.3-23.16l24-48a16 16 0 0128.62 14.32l-24 48A16 16 0 0196 416zM120 480a16 16 0 01-14.3-23.16l16-32a16 16 0 0128.62 14.32l-16 32A16 16 0 01120 480zM376 416a16 16 0 01-14.3-23.16l24-48a16 16 0 0128.62 14.32l-24 48A16 16 0 01376 416zM400 480a16 16 0 01-14.3-23.16l16-32a16 16 0 0128.62 14.32l-16 32A16 16 0 01400 480z" />
            <path d="M405.84 136.9a151.25 151.25 0 00-47.6-81.9 153 153 0 00-241.81 51.86C60.5 110.16 16 156.65 16 213.33 16 272.15 63.91 320 122.8 320h66.31l-12.89 77.37A16 16 0 00192 416h32v64a16 16 0 0029 9.3l80-112a16 16 0 00-13-25.3h-27.51l8-32h103.84a91.56 91.56 0 001.51-183.1z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// ============================================
// AETERNA - Ultra Luxury Water Landing Page
// "The Luxury of Subtraction"
// ============================================

// ============================================
// MULTI-LANGUAGE CONTENT DICTIONARY
// ============================================


const OriginsPortal = ({ onClose }) => {
  const { t } = useLanguage();
  const scrollContainerRef = useRef(null);
  const [currentAltitude, setCurrentAltitude] = useState(300);
  const [scrollProgress, setScrollProgress] = useState(0);
  const rafRef = useRef(null);

  // Pre-calculate random positions for particles (memoized)
  const particlePositions = useRef(
    [...Array(12)].map(() => ({
      left: 10 + Math.random() * 80,
      top: 20 + Math.random() * 60,
      yOffset: -80 - Math.random() * 40,
      duration: 5 + Math.random() * 4,
      delay: Math.random() * 4,
      opacity: 0.2 + Math.random() * 0.3,
    }))
  ).current;

  // Pre-calculate cloud positions (memoized)
  const cloudPositions = useRef(
    [...Array(3)].map((_, i) => ({
      left: -20 + i * 35,
      top: 10 + i * 15,
      width: 150 + Math.random() * 100,
      height: 40 + Math.random() * 30,
    }))
  ).current;

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
        
        const adjustedProgress = Math.min(progress / 0.85, 1);
        const altitude = 300 - (adjustedProgress * 300);
        setCurrentAltitude(Math.max(0, Math.round(altitude)));
        
        rafRef.current = null;
      });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Milestones updated for aerial humidity extraction process
  const milestones = [
    { 
      threshold: 0.05, 
      altitude: '300m',
      title: t.originsTimeline1Title, 
      text: t.originsTimeline1Text,
      detail: t.originsTimeline1Detail
    },
    { 
      threshold: 0.25, 
      altitude: '200m',
      title: t.originsTimeline2Title, 
      text: t.originsTimeline2Text,
      detail: t.originsTimeline2Detail
    },
    { 
      threshold: 0.45, 
      altitude: '100m',
      title: t.originsTimeline3Title, 
      text: t.originsTimeline3Text,
      detail: t.originsTimeline3Detail
    },
    { 
      threshold: 0.65, 
      altitude: '50m',
      title: t.originsTimeline4Title, 
      text: t.originsTimeline4Text,
      detail: t.originsTimeline4Detail
    },
    { 
      threshold: 0.85, 
      altitude: '0m',
      title: t.originsTimeline5Title, 
      text: t.originsTimeline5Text,
      detail: t.originsTimeline5Detail
    },
  ];

  // Interpolate background: sky-blue at top → #020a10 at bottom
  const bgR = Math.round(50  + (2  - 50)  * Math.min(scrollProgress * 1.4, 1));
  const bgG = Math.round(80  + (10 - 80)  * Math.min(scrollProgress * 1.4, 1));
  const bgB = Math.round(120 + (16 - 120) * Math.min(scrollProgress * 1.4, 1));

  return (
    <motion.div
      className="fixed inset-0 z-50"
      style={{ backgroundColor: `rgb(${bgR},${bgG},${bgB})` }}
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Liquid waves background base */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-screen"
          style={{ backgroundImage: 'url(/liquid_waves_bg.png)' }}
        />
      </div>

      {/* Scrollable Container */}
      <div 
        ref={scrollContainerRef}
        className="absolute inset-0 overflow-y-auto overflow-x-hidden z-10"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Total scrollable height */}
        <div className="min-h-[400vh] relative">
          
          {/* Hero Section - Sticky */}
          <div className="h-screen sticky top-0 flex flex-col items-center justify-center px-4">
            {/* Header content - positioned above cloud, fades out immediately on scroll */}
            <motion.div 
              className="relative z-20 text-center transition-all duration-300 order-first mb-4 md:mb-8"
              style={{ 
                opacity: Math.max(0, 1 - scrollProgress * 30),
                transform: `translateY(${scrollProgress * 200}px)`,
                pointerEvents: scrollProgress > 0.02 ? 'none' : 'auto'
              }}
            >
              <motion.span 
                className="text-[10px] font-mono tracking-[0.5em] text-white/70 uppercase block mb-3 md:mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {t.originsSubtitle}
              </motion.span>
              <motion.p
                className="font-serif text-base sm:text-lg md:text-xl text-white/80 font-light italic max-w-xl mx-auto drop-shadow-md mt-2 md:mt-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {t.originsStory}
              </motion.p>
            </motion.div>
            
            {/* Cloud Generator - Always Visible */}
            <div style={{ opacity: Math.max(0.3, 1 - scrollProgress * 2) }}>
              <CloudGeneratorEffect scrollProgress={scrollProgress} />
            </div>
          </div>

          {/* Milestones - Scroll-triggered content */}
          <div className="relative z-20 -mt-[50vh]">
            {milestones.map((milestone, index) => {
              const isVisible = scrollProgress >= milestone.threshold - 0.1;
              const isActive = scrollProgress >= milestone.threshold && scrollProgress < (milestones[index + 1]?.threshold || 1);
              
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
                      
                      {/* Altitude marker */}
                      <span className={`
                        text-lg sm:text-2xl md:text-4xl font-mono font-light mb-1 sm:mb-2 block transition-colors duration-500
                        ${isActive ? 'text-white' : 'text-white/50'}
                      `}>
                        {milestone.altitude}
                      </span>
                      
                      {/* Title */}
                      <span className={`text-[9px] sm:text-[11px] font-mono tracking-[0.3em] uppercase block mb-2 sm:mb-4 transition-colors duration-500 ${isActive ? 'text-[#D4AF37]' : 'text-[#D4AF37]/60'}`}>
                        {milestone.title}
                      </span>
                      
                      {/* Main text */}
                      <p className="text-sm sm:text-lg md:text-xl text-white/90 font-light leading-relaxed mb-2 sm:mb-4 drop-shadow-md">
                        {milestone.text}
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
                        {milestone.detail}
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
                "{t.originsFinalQuote}"
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
          {t.originsBack}
        </span>
        <X className="w-4 h-4 sm:w-5 sm:h-5 text-white/50 group-hover:text-[#D4AF37] transition-colors duration-300" />
      </motion.button>

      {/* Altitude Counter - Right side on mobile, left on desktop */}
      <motion.div 
        className="fixed left-3 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-[60] md:right-auto"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex flex-col items-start">
          <span className="text-[7px] sm:text-[9px] font-mono tracking-[0.2em] sm:tracking-[0.3em] text-white/50 uppercase mb-1 sm:mb-2">
            {t.originsAltitudeLabel}
          </span>
          <span className="text-2xl sm:text-4xl md:text-6xl font-mono text-white font-light tabular-nums drop-shadow-lg">
            {currentAltitude}
            <span className="text-xs sm:text-lg md:text-2xl text-white/50 ml-0.5 sm:ml-1">m</span>
          </span>
        </div>
        
        {/* Vertical Progress Line - fills from top as we descend */}
        <div className="w-[1px] sm:w-[2px] h-20 sm:h-32 bg-white/10 mt-2 sm:mt-4 relative overflow-hidden rounded-full">
          <motion.div 
            className="absolute top-0 left-0 w-full bg-gradient-to-b from-white/50 to-[#D4AF37] rounded-full"
            style={{ height: `${scrollProgress * 100}%` }}
          />
        </div>
        
        {/* Altitude markers - reversed order (300 at top, 0 at bottom) */}
        <div className="mt-1 sm:mt-2 space-y-0.5 sm:space-y-1">
          {[300, 200, 100, 0].map((alt) => (
            <div 
              key={alt} 
              className={`text-[6px] sm:text-[8px] font-mono transition-colors duration-300 ${currentAltitude <= alt ? 'text-[#D4AF37]/80' : 'text-white/30'}`}
            >
              {alt}m
            </div>
          ))}
        </div>
      </motion.div>

      {/* Ambient particles - floating upward like humidity */}
      <div className="fixed inset-0 pointer-events-none z-[55]">
        {particlePositions.map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              backgroundColor: scrollProgress < 0.5 
                ? `rgba(255, 255, 255, ${p.opacity})` 
                : `rgba(212, 175, 55, ${p.opacity * 0.6})`,
            }}
            animate={{
              y: [0, p.yOffset, 0],
              opacity: [0.1, 0.5, 0.1],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
            }}
          />
        ))}
      </div>
      
      {/* Cloud wisps - appear in upper altitudes */}
      {scrollProgress < 0.6 && (
        <div className="fixed inset-0 pointer-events-none z-[54]">
          {cloudPositions.map((c, i) => (
            <motion.div
              key={`cloud-${i}`}
              className="absolute rounded-full blur-2xl"
              style={{
                left: `${c.left}%`,
                top: `${c.top}%`,
                width: `${c.width}px`,
                height: `${c.height}px`,
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                opacity: Math.max(0, 1 - scrollProgress * 2),
              }}
              animate={{
                x: [0, 30, 0],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                delay: i * 3,
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

// ============================================
// PURITY PORTAL - The Zero-Point (Scrollable)
// ============================================


export default OriginsPortal;
