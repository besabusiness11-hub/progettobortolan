import { useRef, useEffect, useState, createContext, useContext } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import DropdownMenu from './DropdownMenu';

// ============================================
// CLOUD GENERATOR EFFECT COMPONENT
// ============================================
const CloudGeneratorEffect = ({ scrollProgress = 0 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isSliderDragging, setIsSliderDragging] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [weatherValue, setWeatherValue] = useState(0);
  const [lightningFlash, setLightningFlash] = useState(false);
  const [lightningGlowStyle, setLightningGlowStyle] = useState({ x: 0, y: 0 });
  const [isSafariUser, setIsSafariUser] = useState(false);
  const cloudRef = useRef(null);
  const lightningGlowRef = useRef(null);
  const lightningIntervalRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Detect Safari browser on mount
  useEffect(() => {
    setIsSafariUser(/^((?!chrome|android).)*safari/i.test(navigator.userAgent));
  }, []);

  // Sincronizza weatherValue con scrollProgress quando non c'è drag dello slider
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
          {/* Safari-optimized filter - uses only basic SVG filters for compatibility */}
          {isSafariUser && (
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
                baseFrequency="0.01"
                numOctaves="3"
                result="noise"
              />
              <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
              <feDisplacementMap
                in="blur"
                in2="noise"
                scale={50}
                result="displaced"
              />
              <feMerge>
                <feMergeNode in="displaced" />
              </feMerge>
            </filter>
          )}

          {/* Chrome/Firefox optimized filter - full effect with all morphology and composite operations */}
          {!isSafariUser && (
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
              <feFlood id="cgshadow2" floodColor="rgb(215,215,215)" floodOpacity={0 + (weatherValue / 100) * 0.4} />
              <feComposite operator="in" in2="SourceGraphic" />
              <feOffset dx="-10" dy="-3" />
              <feMorphology radius="20" />
              <feGaussianBlur stdDeviation="20" />
              <feDisplacementMap scale="100" in2="noise1" result="cloud2" />
              <feFlood id="cgshadow3" floodColor="rgb(66,105,146)" floodOpacity={0.1 + (weatherValue / 100) * 0.3} />
              <feComposite operator="in" in2="SourceGraphic" />
              <feOffset dx="-10" dy="40" />
              <feMorphology radius="0 40" />
              <feGaussianBlur stdDeviation="20" />
              <feDisplacementMap scale="80" in2="noise2" result="cloud3" />
              <feFlood id="cgshadow4" floodColor="rgb(0,0,0)" floodOpacity={0.2 + (weatherValue / 100) * 0.4} />
              <feComposite operator="in" in2="SourceGraphic" />
              <feOffset dx="20" dy="60" />
              <feMorphology radius="0 65" />
              <feGaussianBlur stdDeviation="30" />
              <feDisplacementMap scale="100" in2="noise2" result="cloud4" />
              <feFlood id="cgshadow5" floodColor="rgb(0,0,0)" floodOpacity={0.2 + (weatherValue / 100) * 0.5} />
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
          )}
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
const content = {
  en: {
    heroTitle: "AETERNA",
    heroSubtitle: "The Soul of Venice. Distilled.",
    heroPreTitle: "Distilled Excellence",
    scrollIndicator: "Descend",
    artifactLabel: "The Artifact",
    artifactTitle: "Absolute Purity",
    productNitrates: "Nitrates: 0.00 mg/l",
    productNitratesLabel: "Nitrates",
    productNitratesValue: "0.00 mg/l",
    productOrigin: "Origin: Venetian Aquifer",
    productOriginLabel: "Origin",
    productOriginValue: "Venetian Aquifer",
    productPHLabel: "pH Balance",
    productPHValue: "7.4 Optimal",
    productTDSLabel: "TDS",
    productTDSValue: "< 10 ppm",
    productDepthLabel: "Depth",
    productDepthValue: "300m Subterranean",
    productVesselLabel: "Vessel",
    productVesselValue: "Murano Crystal",
    bottlePlaceholder: "Bottle Image",
    bottleCapacity: "750ml Murano Glass",
    heritageLabel: "The Heritage",
    heritageTitle: "Silence in the Noise",
    heritageText: "History is heavy. Purity is weightless. We removed the noise to reveal the essence.",
    heritageBody: "For fifteen centuries, the Venetian Republic guarded its secrets beneath the lagoon. AETERNA emerges from these ancient aquifers—water untouched by modern contamination, filtered through layers of Alpine stone since the age of the Doges.",
    acquisitionLabel: "The Acquisition",
    acquisitionPrice: "Limited Allocation · €80 per 750ml Vessel",
    cta: "REQUEST PURCHASE",
    contactLabel: "Private Inquiries",
    contactEmail: "concierge@aeterna.com",
    footer: "Venice, Italy · Est. 2026",
    footerLegal: "© MMXXVI Aeterna S.r.l.",
    navOrigins: "Origins",
    navPurity: "Purity",
    navAcquire: "Acquire",
    navStory: "Story",
    // Story Portal
    storyTitle: "THE AETERNA STORY",
    storySubtitle: "A Quest for Essence",
    storyIntro: "In a world drowning in complexity, we searched for simplicity.",
    storyChapter1Title: "The Beginning",
    storyChapter1Text: "Every great journey begins with a question. Ours was simple: What if water could tell the story of its origin?",
    storyChapter1Detail: "In 2024, a small team of researchers and craftspeople gathered in Venice. We weren't looking to create another luxury product. We were seeking to preserve something disappearing—true purity.",
    storyChapter2Title: "The Discovery",
    storyChapter2Text: "Beneath Venice's lagoon lies an untouched aquifer, sealed for millennia.",
    storyChapter2Detail: "Ancient geological surveys revealed aquifers untouched since the age of the Doges. These waters had escaped modern contamination, hidden beneath 300 meters of stone and history. We knew we had found something extraordinary.",
    storyChapter3Title: "The Craft",
    storyChapter3Text: "Perfection demands patience. Excellence demands precision.",
    storyChapter3Detail: "Every bottle is extracted, filtered, and encased in Murano crystal by hand. This is not manufacturing—it is archaeology. We extract legacy, not commodity.",
    storyChapter4Title: "The Philosophy",
    storyChapter4Text: "AETERNA embodies a single principle: The Luxury of Subtraction.",
    storyChapter4Detail: "In removing everything unnecessary, we reveal what truly matters. No marketing claims. No exaggeration. Just water—pure, honest, and silent. It speaks only through its absence of everything else.",
    storyChapter5Title: "The Future",
    storyChapter5Text: "We are only at the beginning of a longer journey.",
    storyChapter5Detail: "Our dream is not to become ubiquitous. It is to remain rare. To remain true. To remain eternal.",
    storyFinalQuote: "What we do is simple. What we believe is not.",
    storyBack: "Return Home",
    // Origins Portal - Aerial Humidity Extraction
    originsTitle: "THE VENETIAN SKY",
    originsSubtitle: "A Descent from the Heavens",
    originsStory: "From the pure air above Venice, we capture the essence of humidity.",
    originsAltitudeLabel: "Altitude",
    originsScrollToDescend: "Scroll to Descend",
    originsFinalQuote: "From sky to glass—the essence of Venice in every drop.",
    originsTimeline1Title: "The Atmosphere",
    originsTimeline1Text: "Pure humidity suspended above the lagoon, invisible and pristine.",
    originsTimeline1Detail: "At this altitude, water particles are still dispersed in the ether—pure, untouched, waiting to condense.",
    originsTimeline2Title: "The Condensation",
    originsTimeline2Text: "Droplets begin to form, capturing the essence of Venetian air.",
    originsTimeline2Detail: "Humidity meets the cool currents of Adriatic winds. Each molecule carries centuries of atmospheric purity.",
    originsTimeline3Title: "The Descent",
    originsTimeline3Text: "Through increasingly dense layers of air, water takes shape.",
    originsTimeline3Detail: "Passing above terracotta rooftops and altanas, vapor transforms. The city below awaits in silence.",
    originsTimeline4Title: "The Approach",
    originsTimeline4Text: "Venice's bell towers emerge from the morning mist.",
    originsTimeline4Detail: "The lagoon fog welcomes each drop. Here the air tastes ancient, of salt and history.",
    originsTimeline5Title: "The Capture",
    originsTimeline5Text: "At sea level, the purest water is collected.",
    originsTimeline5Detail: "Where sky and lagoon meet, AETERNA is born. Every bottle contains a fragment of Venetian sky.",
    originsBack: "Return to Surface",
    // Purity Portal
    purityTitle: "ZERO POINT IMPURITY",
    puritySubtitle: "Molecular Perfection",
    purityDescription: "Every contaminant eliminated. Every trace removed. What remains is essence.",
    purityHeavyMetals: "Heavy Metals",
    purityMicroplastics: "Microplastics",
    purityBacteria: "Bacteria",
    purityNitrates: "Nitrates",
    purityPesticides: "Pesticides",
    purityPharmaceuticals: "Pharmaceuticals",
    purityRemoved: "Removed",
    purityMoleculeLabel: "H₂O Molecule",
    purityBack: "Exit Analysis"
  },
  fr: {
    heroTitle: "AETERNA",
    heroSubtitle: "L'Âme de Venise. Distillée.",
    heroPreTitle: "Excellence Distillée",
    scrollIndicator: "Descendre",
    artifactLabel: "L'Artéfact",
    artifactTitle: "Pureté Absolue",
    productNitrates: "Nitrates: 0.00 mg/l",
    productNitratesLabel: "Nitrates",
    productNitratesValue: "0.00 mg/l",
    productOrigin: "Origine: Aquifère Vénitien",
    productOriginLabel: "Origine",
    productOriginValue: "Aquifère Vénitien",
    productPHLabel: "Équilibre pH",
    productPHValue: "7.4 Optimal",
    productTDSLabel: "TDS",
    productTDSValue: "< 10 ppm",
    productDepthLabel: "Profondeur",
    productDepthValue: "300m Souterrain",
    productVesselLabel: "Récipient",
    productVesselValue: "Cristal de Murano",
    bottlePlaceholder: "Image Bouteille",
    bottleCapacity: "750ml Verre de Murano",
    heritageLabel: "L'Héritage",
    heritageTitle: "Le Silence dans le Bruit",
    heritageText: "L'histoire est lourde. La pureté est légère. Nous avons ôté le bruit pour révéler l'essence.",
    heritageBody: "Pendant quinze siècles, la République de Venise a gardé ses secrets sous la lagune. AETERNA émerge de ces aquifères ancestraux—une eau intacte par la contamination moderne, filtrée à travers des couches de pierre alpine depuis l'époque des Doges.",
    acquisitionLabel: "L'Acquisition",
    acquisitionPrice: "Allocation Limitée · 80€ par Flacon de 750ml",
    cta: "DEMANDER UNE ALLOCATION",
    contactLabel: "Demandes Privées",
    contactEmail: "concierge@aeterna.com",
    footer: "Venise, Italie · Fondée en 2026",
    footerLegal: "© MMXXVI Aeterna S.r.l.",
    navOrigins: "Origines",
    navPurity: "Pureté",
    navAcquire: "Acquérir",
    navStory: "Histoire",
    // Story Portal
    storyTitle: "L'HISTOIRE D'AETERNA",
    storySubtitle: "Une Quête d'Essence",
    storyIntro: "Dans un monde noyé dans la complexité, nous avons cherché la simplicité.",
    storyChapter1Title: "Le Commencement",
    storyChapter1Text: "Tout grand voyage commence par une question. La nôtre était simple : Et si l'eau pouvait raconter l'histoire de ses origines?",
    storyChapter1Detail: "En 2024, une petite équipe de chercheurs et d'artisans s'est réunie à Venise. Nous ne cherchions pas à créer un autre produit de luxe. Nous cherchions à préserver quelque chose qui disparaît—la vraie pureté.",
    storyChapter2Title: "La Découverte",
    storyChapter2Text: "Sous la lagune de Venise repose un aquifère intouché, scellé depuis des millénaires.",
    storyChapter2Detail: "Les anciens relevés géologiques ont révélé des aquifères intouchés depuis l'époque des Doges. Ces eaux avaient échappé à la contamination moderne, cachées sous 300 mètres de pierre et d'histoire. Nous savions avoir trouvé quelque chose d'extraordinaire.",
    storyChapter3Title: "L'Art",
    storyChapter3Text: "La perfection exige de la patience. L'excellence exige de la précision.",
    storyChapter3Detail: "Chaque bouteille est extraite, filtrée et enchâssée dans du cristal de Murano à la main. Ce n'est pas de la fabrication—c'est de l'archéologie. Nous extrayons l'héritage, non la marchandise.",
    storyChapter4Title: "La Philosophie",
    storyChapter4Text: "AETERNA incarne un seul principe : Le Luxe de la Soustraction.",
    storyChapter4Detail: "En supprimant tout ce qui est inutile, nous révélons ce qui compte vraiment. Aucune affirmation de marketing. Aucune exagération. Juste de l'eau—pure, honnête, et silencieuse. Elle ne parle que par son absence de tout le reste.",
    storyChapter5Title: "L'Avenir",
    storyChapter5Text: "Nous ne sommes qu'au début d'un plus long voyage.",
    storyChapter5Detail: "Notre rêve n'est pas de devenir omniprésent. C'est de rester rare. De rester véridique. De rester éternel.",
    storyFinalQuote: "Ce que nous faisons est simple. Ce que nous croyons ne l'est pas.",
    storyBack: "Retour à l'Accueil",
    // Origins Portal - Aerial Humidity Extraction
    originsTitle: "LE CIEL VÉNITIEN",
    originsSubtitle: "Une Descente des Cieux",
    originsStory: "De l'air pur au-dessus de Venise, nous capturons l'essence de l'humidité.",
    originsAltitudeLabel: "Altitude",
    originsScrollToDescend: "Défiler pour Descendre",
    originsFinalQuote: "Du ciel au verre—l'essence de Venise dans chaque goutte.",
    originsTimeline1Title: "L'Atmosphère",
    originsTimeline1Text: "Humidité pure suspendue au-dessus de la lagune, invisible et immaculée.",
    originsTimeline1Detail: "À cette altitude, les particules d'eau sont encore dispersées dans l'éther—pures, intactes, attendant de se condenser.",
    originsTimeline2Title: "La Condensation",
    originsTimeline2Text: "Les gouttelettes commencent à se former, capturant l'essence de l'air vénitien.",
    originsTimeline2Detail: "L'humidité rencontre les courants frais des vents adriatiques. Chaque molécule porte des siècles de pureté atmosphérique.",
    originsTimeline3Title: "La Descente",
    originsTimeline3Text: "À travers des couches d'air de plus en plus denses, l'eau prend forme.",
    originsTimeline3Detail: "Passant au-dessus des toits de terre cuite et des altanas, la vapeur se transforme. La ville en dessous attend en silence.",
    originsTimeline4Title: "L'Approche",
    originsTimeline4Text: "Les clochers de Venise émergent de la brume matinale.",
    originsTimeline4Detail: "Le brouillard de la lagune accueille chaque goutte. Ici l'air a un goût ancien, de sel et d'histoire.",
    originsTimeline5Title: "La Capture",
    originsTimeline5Text: "Au niveau de la mer, l'eau la plus pure est recueillie.",
    originsTimeline5Detail: "Là où le ciel et la lagune se rencontrent, AETERNA naît. Chaque bouteille contient un fragment de ciel vénitien.",
    originsBack: "Retour à la Surface",
    // Purity Portal
    purityTitle: "IMPURETÉ ZÉRO",
    puritySubtitle: "Perfection Moléculaire",
    purityDescription: "Chaque contaminant éliminé. Chaque trace supprimée. Ce qui reste est l'essence.",
    purityHeavyMetals: "Métaux Lourds",
    purityMicroplastics: "Microplastiques",
    purityBacteria: "Bactéries",
    purityNitrates: "Nitrates",
    purityPesticides: "Pesticides",
    purityPharmaceuticals: "Pharmaceutiques",
    purityRemoved: "Éliminé",
    purityMoleculeLabel: "Molécule H₂O",
    purityBack: "Quitter l'Analyse"
  },
  cn: {
    heroTitle: "AETERNA",
    heroSubtitle: "威尼斯之魂。萃取。",
    heroPreTitle: "卓越萃取",
    scrollIndicator: "探索",
    artifactLabel: "臻品",
    artifactTitle: "绝对纯净",
    productNitrates: "硝酸盐: 0.00 mg/l",
    productNitratesLabel: "硝酸盐",
    productNitratesValue: "0.00 mg/l",
    productOrigin: "产地: 威尼斯深层含水层",
    productOriginLabel: "产地",
    productOriginValue: "威尼斯深层含水层",
    productPHLabel: "酸碱平衡",
    productPHValue: "7.4 最佳",
    productTDSLabel: "溶解固体",
    productTDSValue: "< 10 ppm",
    productDepthLabel: "深度",
    productDepthValue: "地下300米",
    productVesselLabel: "容器",
    productVesselValue: "穆拉诺水晶",
    bottlePlaceholder: "瓶身图片",
    bottleCapacity: "750毫升 穆拉诺玻璃",
    heritageLabel: "传承",
    heritageTitle: "喧嚣中的静谧",
    heritageText: "历史厚重，纯净无瑕。褪去繁杂，方显本质。",
    heritageBody: "十五个世纪以来，威尼斯共和国将其秘密珍藏于泻湖之下。AETERNA源自这些古老的含水层——未受现代污染的纯净之水，自总督时代起便经由阿尔卑斯岩层层层过滤。",
    acquisitionLabel: "尊享获取",
    acquisitionPrice: "限量配额 · 每瓶750毫升 €80",
    cta: "尊享预订申请",
    contactLabel: "私人咨询",
    contactEmail: "concierge@aeterna.com",
    footer: "意大利威尼斯 · 始于2026",
    footerLegal: "© MMXXVI Aeterna S.r.l.",
    navOrigins: "起源",
    navPurity: "纯净",
    navAcquire: "获取",
    navStory: "故事",
    // Story Portal
    storyTitle: "AETERNA的故事",
    storySubtitle: "追寻本质之旅",
    storyIntro: "在一个充满复杂性的世界里，我们寻找简单。",
    storyChapter1Title: "开始",
    storyChapter1Text: "每一段伟大的旅程都始于一个问题。我们的问题很简单：如果水能讲述其起源的故事呢？",
    storyChapter1Detail: "2024年，一支由研究人员和工匠组成的小团队聚集在威尼斯。我们并不是想创造另一种奢侈品。我们真正想要的是保护一些正在消失的东西——真正的纯净。",
    storyChapter2Title: "发现",
    storyChapter2Text: "威尼斯泻湖下方躺着一个未触及的含水层，已密封数千年。",
    storyChapter2Detail: "古代地质调查揭示了自总督时代以来未曾触及的含水层。这些水躲过了现代污染，隐藏在300米深的岩石和历史之下。我们知道我们找到了非同寻常的东西。",
    storyChapter3Title: "工艺",
    storyChapter3Text: "完美需要耐心。卓越需要精准。",
    storyChapter3Detail: "每一瓶都由手工提取、过滤并装入穆拉诺水晶。这不是制造——这是考古学。我们提取的是遗产，而不是商品。",
    storyChapter4Title: "哲学",
    storyChapter4Text: "AETERNA体现了一个单一的原则：减法的奢侈。",
    storyChapter4Detail: "在去除所有不必要的东西时，我们揭示了真正重要的东西。没有营销宣传。没有夸大其词。只是水——纯净、诚实、沉默。它只通过没有其他一切来说话。",
    storyChapter5Title: "未来",
    storyChapter5Text: "我们只是立长远之旅的初始阶段。",
    storyChapter5Detail: "我们的梦想不是成为无处不在。而是保持稀有。保持真诚。保持永恒。",
    storyFinalQuote: "我们所做的很简单。我们所相信的并不简单。",
    storyBack: "返回主页",
    // Origins Portal - Aerial Humidity Extraction
    originsTitle: "威尼斯天空",
    originsSubtitle: "从天而降",
    originsStory: "从威尼斯上空的纯净空气中，我们捕获湿气的精华。",
    originsAltitudeLabel: "海拔高度",
    originsScrollToDescend: "滚动下降",
    originsFinalQuote: "从天空到杯中——每一滴都蕴含威尼斯的精髓。",
    originsTimeline1Title: "大气层",
    originsTimeline1Text: "悬浮于泻湖上空的纯净湿气，无形而纯净。",
    originsTimeline1Detail: "在此高度，水分子仍然分散于以太中——纯净、未受触及、等待凝结。",
    originsTimeline2Title: "凝结",
    originsTimeline2Text: "水滴开始形成，捕获威尼斯空气的精华。",
    originsTimeline2Detail: "湿气遇上亚得里亚海风的清凉气流。每个分子都承载着数百年的大气纯净。",
    originsTimeline3Title: "下降",
    originsTimeline3Text: "穿越日益稠密的空气层，水开始成形。",
    originsTimeline3Detail: "掠过赤陶屋顶和露台，蒸气转化。城市在下方静静等待。",
    originsTimeline4Title: "接近",
    originsTimeline4Text: "威尼斯的钟楼从晨雾中浮现。",
    originsTimeline4Detail: "泻湖的雾气迎接每一滴水。这里的空气带着古老的气息，混着盐分与历史。",
    originsTimeline5Title: "捕获",
    originsTimeline5Text: "在海平面，最纯净的水被收集。",
    originsTimeline5Detail: "天空与泻湖交汇之处，AETERNA诞生。每一瓶都蕴含威尼斯天空的片段。",
    originsBack: "返回地表",
    // Purity Portal
    purityTitle: "零杂质",
    puritySubtitle: "分子级完美",
    purityDescription: "每一种污染物被消除。每一丝痕迹被移除。留下的唯有本质。",
    purityHeavyMetals: "重金属",
    purityMicroplastics: "微塑料",
    purityBacteria: "细菌",
    purityNitrates: "硝酸盐",
    purityPesticides: "农药",
    purityPharmaceuticals: "药物残留",
    purityRemoved: "已清除",
    purityMoleculeLabel: "H₂O 分子",
    purityBack: "退出分析"
  }
};

// Language Context
const LanguageContext = createContext();

const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export { useLanguage, LanguageContext };

// ============================================
// LANGUAGE SWITCHER COMPONENT
// ============================================
const LanguageSwitcher = () => {
  const { lang, setLang } = useLanguage();
  const languages = ['en', 'fr', 'cn'];
  
  return (
    <motion.div 
      className="fixed top-6 right-4 md:right-8 z-50 flex items-center gap-1"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.5 }}
    >
      {languages.map((code, index) => (
        <span key={code} className="flex items-center">
          <button
            onClick={() => setLang(code)}
            className={`
              text-[10px] font-mono tracking-[0.15em] uppercase
              transition-all duration-300 px-1
              ${lang === code 
                ? 'text-[#F5F5F5] opacity-100' 
                : 'text-[#F5F5F5] opacity-40 hover:opacity-70'
              }
            `}
          >
            {code}
          </button>
          {index < languages.length - 1 && (
            <span className="text-[10px] text-[#D4AF37]/30 mx-0.5">/</span>
          )}
        </span>
      ))}
    </motion.div>
  );
};

// Animated Section Wrapper
const AnimatedSection = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ 
        duration: 1.2, 
        delay,
        ease: [0.25, 0.1, 0.25, 1] 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Water Droplet Scroll Indicator
const ScrollIndicator = () => {
  const { t } = useLanguage();
  
  return (
    <motion.div 
      className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2, duration: 1 }}
    >
      <span className="text-[10px] tracking-[0.3em] text-neutral-500 font-mono uppercase">
        {t.scrollIndicator}
      </span>
      <motion.div
        className="relative w-[1px] h-16 bg-gradient-to-b from-[#D4AF37]/50 to-transparent overflow-hidden"
      >
        <motion.div
          className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-[#D4AF37] to-[#D4AF37]/0 rounded-full"
          animate={{ y: [0, 64, 0] }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            ease: [0.4, 0, 0.6, 1],
            repeatDelay: 0.5
          }}
        />
      </motion.div>
    </motion.div>
  );
};

// Glass Panel Component
const GlassPanel = ({ children, className = '' }) => (
  <div className={`
    relative backdrop-blur-md 
    bg-gradient-to-br from-white/[0.03] to-white/[0.01]
    border border-white/[0.05]
    ${className}
  `}>
    {children}
  </div>
);

// Data Point with Line
const DataPoint = ({ label, value, align = 'left', delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  
  return (
    <motion.div
      ref={ref}
      className={`flex flex-col ${align === 'right' ? 'items-end text-right' : 'items-start text-left'}`}
      initial={{ opacity: 0, x: align === 'left' ? -30 : 30 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: align === 'left' ? -30 : 30 }}
      transition={{ duration: 1, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <span className="text-[10px] tracking-[0.25em] text-neutral-600 font-mono uppercase mb-2">
        {label}
      </span>
      <span className="text-sm font-mono text-[#D4AF37] tracking-wider">
        {value}
      </span>
    </motion.div>
  );
};

// Connecting Line Component
const ConnectingLine = ({ direction = 'left', delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  
  return (
    <motion.div
      ref={ref}
      className={`hidden md:block absolute top-1/2 ${direction === 'left' ? 'right-full mr-4' : 'left-full ml-4'} w-24 h-[1px]`}
      initial={{ scaleX: 0 }}
      animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
      transition={{ duration: 1.2, delay, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ originX: direction === 'left' ? 1 : 0 }}
    >
      <div className={`
        w-full h-full 
        ${direction === 'left' 
          ? 'bg-gradient-to-l from-[#D4AF37]/60 to-transparent' 
          : 'bg-gradient-to-r from-[#D4AF37]/60 to-transparent'
        }
      `} />
      <div className={`
        absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#D4AF37]/80
        ${direction === 'left' ? 'right-0' : 'left-0'}
      `} />
    </motion.div>
  );
};

// Abstract Venetian SVG Elements
const VenetianArches = () => (
  <svg 
    className="absolute inset-0 w-full h-full opacity-[0.03]" 
    viewBox="0 0 1200 800" 
    preserveAspectRatio="xMidYMid slice"
  >
    {/* Doge's Palace inspired arches */}
    {[...Array(12)].map((_, i) => (
      <path
        key={i}
        d={`M ${100 * i} 800 L ${100 * i} 400 Q ${100 * i + 50} 350 ${100 * i + 100} 400 L ${100 * i + 100} 800`}
        fill="none"
        stroke="#D4AF37"
        strokeWidth="0.5"
      />
    ))}
    {/* Upper gothic arches */}
    {[...Array(24)].map((_, i) => (
      <path
        key={`upper-${i}`}
        d={`M ${50 * i} 350 Q ${50 * i + 25} 280 ${50 * i + 50} 350`}
        fill="none"
        stroke="#D4AF37"
        strokeWidth="0.3"
      />
    ))}
  </svg>
);

// Ferro di Prua (Gondola Iron) Abstract
const FerroDiPrua = ({ className = '' }) => (
  <svg 
    className={className}
    viewBox="0 0 100 400" 
    fill="none"
  >
    <path
      d="M 50 0 
         L 50 50 
         Q 20 80 50 100
         Q 80 120 50 140
         Q 20 160 50 180
         Q 80 200 50 220
         Q 20 240 50 260
         Q 80 280 50 300
         L 50 350
         Q 30 370 50 400"
      stroke="url(#ferroGradient)"
      strokeWidth="1"
      fill="none"
    />
    {/* The 6 prongs representing Venice's 6 sestieri */}
    {[100, 140, 180, 220, 260, 300].map((y, i) => (
      <path
        key={i}
        d={`M 50 ${y} L ${i % 2 === 0 ? 15 : 85} ${y + 10}`}
        stroke="url(#ferroGradient)"
        strokeWidth="0.5"
      />
    ))}
    <defs>
      <linearGradient id="ferroGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.8" />
        <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.1" />
      </linearGradient>
    </defs>
  </svg>
);

// ============================================
// MAIN SECTIONS
// ============================================

// HERO SECTION
const HeroSection = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start']
  });
  
  const yPercent = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  
  return (
    <section 
      ref={ref}
      className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-[#020405]"
    >
      {/* Background glow - subtle effect like Artifact section */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,_#D4AF37_0%,_transparent_70%)] opacity-10 blur-3xl" />
      </motion.div>
      
      {/* Parallax content */}
      <motion.div 
        className="absolute inset-0 w-full h-full"
        style={{ y: yPercent, opacity }}
      >
        {/* Bottle Image - Full screen background with smooth parallax */}
        <img
          src="/aeterna-bottle-hero.jpg.PNG"
          alt="AETERNA Luxury Water Bottle"
          className="w-full h-full object-cover"
        />
      </motion.div>
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#020405] to-transparent pointer-events-none" />
    </section>
  );
};

// THE ARTIFACT SECTION
const ArtifactSection = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });
  
  const bottleY = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const glowOpacity = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0.3, 0.8, 0.3]);
  
  return (
    <section 
      ref={ref}
      className="relative min-h-screen w-full py-32 overflow-hidden"
    >
      {/* Background glow */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: glowOpacity }}
      >
        <div className="w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,_#D4AF37_0%,_transparent_70%)] opacity-10 blur-3xl" />
      </motion.div>
      
      <div className="container mx-auto px-3 md:px-8">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-16 md:mb-24">
          <span className="text-[9px] md:text-[10px] font-mono tracking-[0.4em] text-[#D4AF37]/60 uppercase block mb-3 md:mb-4">
            {t.artifactLabel}
          </span>
          <h2 
            className="font-serif text-2xl md:text-4xl lg:text-5xl text-[#F5F5F5] font-light tracking-wider"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t.artifactTitle}
          </h2>
        </AnimatedSection>
        
        {/* Product Showcase */}
        <div className="relative flex items-center justify-center min-h-[400px] md:min-h-[600px]">
          {/* Left Data Points - Hidden on mobile, visible on md+ */}
          <div className="hidden md:flex flex-col gap-16 absolute left-0 md:left-8 lg:left-16 xl:left-32">
            <div className="relative">
              <DataPoint 
                label={t.productNitratesLabel}
                value={t.productNitratesValue}
                align="left"
                delay={0.3}
              />
              <ConnectingLine direction="left" delay={0.5} />
            </div>
            <div className="relative">
              <DataPoint 
                label={t.productPHLabel}
                value={t.productPHValue}
                align="left"
                delay={0.4}
              />
              <ConnectingLine direction="left" delay={0.6} />
            </div>
            <div className="relative">
              <DataPoint 
                label={t.productTDSLabel}
                value={t.productTDSValue}
                align="left"
                delay={0.5}
              />
              <ConnectingLine direction="left" delay={0.7} />
            </div>
          </div>
          
          {/* Bottle Container */}
          <motion.div 
            className="relative z-10"
            style={{ y: bottleY }}
          >
            {/* Holy relic glow effect */}
            <div className="absolute inset-0 -m-8 md:-m-16">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#D4AF37_0%,_transparent_60%)] opacity-20" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#F5F5F5_0%,_transparent_40%)] opacity-5" />
            </div>
            
            {/* Bottle Placeholder */}
            <GlassPanel className="w-48 h-[350px] sm:w-56 sm:h-[450px] md:w-80 md:h-[600px] rounded-t-full flex items-center justify-center">
              <div className="text-center px-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 rounded-full border border-[#D4AF37]/30 flex items-center justify-center">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-b from-[#D4AF37]/20 to-transparent" />
                </div>
                <span className="text-[8px] md:text-[10px] font-mono tracking-[0.3em] text-neutral-500 uppercase">
                  {t.bottlePlaceholder}
                </span>
                <p className="text-[7px] md:text-[9px] text-neutral-600 mt-1 md:mt-2 font-mono">
                  {t.bottleCapacity}
                </p>
              </div>
            </GlassPanel>
            
            {/* Base reflection */}
            <div className="w-full h-16 md:h-32 bg-gradient-to-b from-[#D4AF37]/5 to-transparent rounded-b-full blur-sm" />
          </motion.div>
          
          {/* Right Data Points - Hidden on mobile */}
          <div className="hidden md:flex flex-col gap-16 absolute right-0 md:right-8 lg:right-16 xl:right-32">
            <div className="relative">
              <DataPoint 
                label={t.productOriginLabel}
                value={t.productOriginValue}
                align="right"
                delay={0.3}
              />
              <ConnectingLine direction="right" delay={0.5} />
            </div>
            <div className="relative">
              <DataPoint 
                label={t.productDepthLabel}
                value={t.productDepthValue}
                align="right"
                delay={0.4}
              />
              <ConnectingLine direction="right" delay={0.6} />
            </div>
            <div className="relative">
              <DataPoint 
                label={t.productVesselLabel}
                value={t.productVesselValue}
                align="right"
                delay={0.5}
              />
              <ConnectingLine direction="right" delay={0.7} />
            </div>
          </div>
        </div>
        
        {/* Mobile Data Points - Visible only on mobile/sm */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 mt-10 md:hidden">
          <DataPoint label={t.productNitratesLabel} value={t.productNitratesValue} align="left" delay={0.2} />
          <DataPoint label={t.productOriginLabel} value={t.productOriginValue} align="right" delay={0.3} />
          <DataPoint label={t.productPHLabel} value={t.productPHValue} align="left" delay={0.4} />
          <DataPoint label={t.productDepthLabel} value={t.productDepthValue} align="right" delay={0.5} />
          <DataPoint label={t.productTDSLabel} value={t.productTDSValue} align="left" delay={0.6} />
          <DataPoint label={t.productVesselLabel} value={t.productVesselValue} align="right" delay={0.7} />
        </div>
      </div>
    </section>
  );
};

// THE HERITAGE SECTION
const HeritageSection = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });
  
  const ferroY = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const archesOpacity = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0, 0.03, 0]);
  
  return (
    <section 
      ref={ref}
      className="relative min-h-screen w-full py-32 overflow-hidden flex items-center"
    >
      {/* Venetian Arches Background */}
      <motion.div 
        className="absolute inset-0"
        style={{ opacity: archesOpacity }}
      >
        <VenetianArches />
      </motion.div>
      
      {/* Floating Ferro di Prua */}
      <motion.div 
        className="absolute left-2 md:left-16 lg:left-32 top-1/2 -translate-y-1/2 opacity-5 md:opacity-10"
        style={{ y: ferroY }}
      >
        <FerroDiPrua className="w-8 md:w-12 lg:w-16 h-auto" />
      </motion.div>
      
      <motion.div 
        className="absolute right-2 md:right-16 lg:right-32 top-1/2 -translate-y-1/2 opacity-5 md:opacity-10 scale-x-[-1]"
        style={{ y: ferroY }}
      >
        <FerroDiPrua className="w-8 md:w-12 lg:w-16 h-auto" />
      </motion.div>
      
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Section Label */}
          <AnimatedSection>
            <span className="text-[9px] md:text-[10px] font-mono tracking-[0.4em] text-[#D4AF37]/60 uppercase block mb-8 md:mb-12">
              {t.heritageLabel}
            </span>
          </AnimatedSection>
          
          {/* Main Quote */}
          <AnimatedSection delay={0.2}>
            <blockquote className="mb-8 md:mb-12">
              <p 
                className="font-serif text-lg sm:text-2xl md:text-4xl lg:text-5xl text-[#F5F5F5] font-light leading-relaxed tracking-wide"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                <span className="text-[#D4AF37]">"</span>
                {t.heritageText}
                <span className="text-[#D4AF37]">"</span>
              </p>
            </blockquote>
          </AnimatedSection>
          
          {/* Decorative divider */}
          <AnimatedSection delay={0.4}>
            <div className="flex items-center justify-center gap-3 md:gap-4 mb-8 md:mb-12">
              <div className="w-8 md:w-16 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]/40" />
              <div className="w-2 h-2 rotate-45 border border-[#D4AF37]/40" />
              <div className="w-8 md:w-16 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]/40" />
            </div>
          </AnimatedSection>
          
          {/* Supporting copy */}
          <AnimatedSection delay={0.5}>
            <p className="text-xs sm:text-sm md:text-base text-neutral-500 font-light leading-relaxed max-w-2xl mx-auto px-2">
              {t.heritageBody}
            </p>
          </AnimatedSection>
          
          {/* Abstract water line pattern */}
          <AnimatedSection delay={0.6} className="mt-12 md:mt-16">
            <svg className="w-full max-w-md mx-auto h-8 md:h-12 opacity-30" viewBox="0 0 400 50">
              <path
                d="M 0 25 Q 50 10 100 25 T 200 25 T 300 25 T 400 25"
                fill="none"
                stroke="#D4AF37"
                strokeWidth="0.5"
              />
              <path
                d="M 0 25 Q 50 40 100 25 T 200 25 T 300 25 T 400 25"
                fill="none"
                stroke="#D4AF37"
                strokeWidth="0.3"
                opacity="0.5"
              />
            </svg>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

// THE ACQUISITION SECTION (Footer/CTA)
const AcquisitionSection = () => {
  const { t } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <section className="relative w-full py-24 md:py-32 overflow-hidden px-4">
      {/* Top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent" />
      
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          {/* Section Label */}
          <AnimatedSection>
            <span className="text-[9px] md:text-[10px] font-mono tracking-[0.4em] text-[#D4AF37]/60 uppercase block mb-6 md:mb-8">
              {t.acquisitionLabel}
            </span>
          </AnimatedSection>
          
          {/* Price Indication */}
          <AnimatedSection delay={0.1}>
            <p className="font-mono text-[8px] md:text-xs text-neutral-600 tracking-wider mb-6 md:mb-8">
              {t.acquisitionPrice}
            </p>
          </AnimatedSection>
          
          {/* CTA Button */}
          <AnimatedSection delay={0.2}>
            <motion.button
              className="group relative px-8 sm:px-12 py-4 md:py-5 overflow-hidden"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Border */}
              <span className="absolute inset-0 border border-[#D4AF37]/40 transition-colors duration-500 group-hover:border-[#D4AF37]/80" />
              
              {/* Hover fill effect */}
              <motion.span 
                className="absolute inset-0 bg-[#D4AF37]"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isHovered ? 1 : 0 }}
                transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                style={{ originX: 0 }}
              />
              
              {/* Text */}
              <span 
                className={`
                  relative z-10 font-mono text-[9px] md:text-xs tracking-[0.3em] uppercase
                  transition-colors duration-500
                  ${isHovered ? 'text-[#020405]' : 'text-[#D4AF37]'}
                `}
              >
                {t.cta}
              </span>
            </motion.button>
          </AnimatedSection>
          
          {/* Contact info */}
          <AnimatedSection delay={0.3} className="mt-12 md:mt-16">
            <p className="text-[8px] md:text-[10px] font-mono tracking-[0.2em] text-neutral-600 mb-2">
              {t.contactLabel}
            </p>
            <p className="text-[8px] md:text-xs font-mono text-neutral-500 tracking-wider">
              {t.contactEmail}
            </p>
          </AnimatedSection>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-20 md:mt-32 pt-6 md:pt-8 border-t border-white/[0.03]">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 text-center md:text-left">
            {/* Logo */}
            <motion.span 
              className="font-serif text-sm md:text-lg tracking-[0.3em] text-neutral-600"
              style={{ fontFamily: "'Playfair Display', serif" }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              AETERNA
            </motion.span>
            
            {/* Establishment */}
            <motion.span 
              className="text-[8px] md:text-[10px] font-mono tracking-[0.3em] text-neutral-700 uppercase"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.1 }}
            >
              {t.footer}
            </motion.span>
            
            {/* Legal */}
            <motion.span 
              className="text-[7px] md:text-[9px] font-mono text-neutral-700"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              {t.footerLegal}
            </motion.span>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================
// STORY PORTAL - The Aeterna Journey (Scrollable)
// ============================================
const StoryPortal = ({ onClose }) => {
  const { t } = useLanguage();
  const scrollContainerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const raffRef = useRef(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (raffRef.current) return;
      
      raffRef.current = requestAnimationFrame(() => {
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight - container.clientHeight;
        const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
        setScrollProgress(progress);
        raffRef.current = null;
      });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (raffRef.current) cancelAnimationFrame(raffRef.current);
    };
  }, []);

  const artisanStages = [
    {
      threshold: 0.05,
      number: '01',
      title: 'The Source',
      subtitle: 'Extraction',
      text: 'Deep beneath the Venetian lagoon, master artisans locate and carefully extract water from ancient aquifers.',
      detail: 'Using centuries-old techniques combined with modern precision, each extraction is a delicate operation. The artisans work in harmony with nature, respecting the geological formations that have protected this water for millennia.',
      image: '/artisan-extraction.jpg'
    },
    {
      threshold: 0.25,
      number: '02',
      title: 'The Craft',
      subtitle: 'Purification',
      text: 'Multi-stage filtration processes remove impurities while preserving the water\'s mineral balance.',
      detail: 'Artisans oversee each filtration stage with meticulous attention. Alpine stone layers, sand beds, and crystalline filters work together in a symphony of purification. Every step is monitored, every result tested.',
      image: '/artisan-purification.jpg'
    },
    {
      threshold: 0.45,
      number: '03',
      title: 'The Artistry',
      subtitle: 'Crystallization',
      text: 'The water is prepared through a proprietary crystallization process that enhances its natural properties.',
      detail: 'Master chemists and water specialists work alongside traditional artisans. This is where science meets art—precise measurements meet intuitive knowledge passed down through generations.',
      image: '/artisan-crystallization.jpg'
    },
    {
      threshold: 0.65,
      number: '04',
      title: 'The Vessel',
      subtitle: 'Murano Glass',
      text: 'Each bottle is hand-crafted by Murano glass artisans using techniques perfected over centuries.',
      detail: 'In the furnaces of Murano, artisans heat glass to 1300°C. Every vessel is blown, shaped, and cooled by human hands. No two bottles are ever identical—each carries the fingerprint of its creator.',
      image: '/artisan-murano.jpg'
    },
    {
      threshold: 0.85,
      number: '05',
      title: 'The Encasement',
      subtitle: 'Filling & Sealing',
      text: 'The purified water meets its crystal home in a ritual of precision and reverence.',
      detail: 'Artisans fill each bottle with calculated care, ensuring no air enters the seal. Every closure is wax-sealed by hand, every label applied with exactitude. This is the moment where purity becomes permanence.',
      image: '/artisan-filling.jpg'
    }
  ];

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-[#020405]"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div 
        ref={scrollContainerRef}
        className="absolute inset-0 overflow-y-auto overflow-x-hidden"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="min-h-[500vh] relative">
          {/* HERO SECTION */}
          <div className="h-screen sticky top-0 flex flex-col items-center justify-center px-4">
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
                Master Craftsmanship
              </motion.span>
              <motion.h1
                className="font-serif text-4xl md:text-6xl lg:text-7xl font-light text-white tracking-[0.3em] mb-8 drop-shadow-lg"
                style={{ fontFamily: "'Playfair Display', serif" }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
              >
                THE ARTISANS
              </motion.h1>
              <motion.p
                className="font-serif text-lg md:text-xl text-white/80 font-light italic max-w-xl mx-auto drop-shadow-md"
                style={{ fontFamily: "'Playfair Display', serif" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                Hands that preserve the essence of water through knowledge, tradition, and precision
              </motion.p>
              
              <motion.div 
                className="mt-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <span className="text-[9px] font-mono tracking-[0.3em] text-white/50 uppercase block mb-4">
                  Scroll to Discover
                </span>
                <motion.div
                  className="w-[1px] h-16 bg-gradient-to-b from-white/50 to-transparent mx-auto"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            </motion.div>
          </div>

          {/* ARTISAN STAGES */}
          <div className="relative z-20 -mt-[50vh]">
            {artisanStages.map((stage, index) => {
              const isVisible = scrollProgress >= stage.threshold - 0.1;
              const isActive = scrollProgress >= stage.threshold && scrollProgress < (artisanStages[index + 1]?.threshold || 1);
              
              return (
                <div 
                  key={index}
                  className="min-h-[60vh] sm:min-h-[70vh] flex items-center justify-center px-3 sm:px-4 md:px-8 py-16"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-5xl w-full items-center">
                    {/* Image Section */}
                    <motion.div
                      className={`relative overflow-hidden rounded-lg ${index % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                      animate={{ 
                        opacity: isVisible ? 1 : 0, 
                        x: isVisible ? 0 : (index % 2 === 0 ? -50 : 50)
                      }}
                      transition={{ duration: 0.8 }}
                    >
                      <div className="aspect-square bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-lg overflow-hidden">
                        <img
                          src={stage.image}
                          alt={stage.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><div class="text-center"><div class="text-[#D4AF37]/40 text-sm font-mono mb-2">Image Placeholder</div><div class="text-white/30 text-xs font-mono">' + stage.image + '</div></div></div>';
                          }}
                        />
                        {/* Fallback content in case image fails */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/20 via-transparent to-[#D4AF37]/10 flex items-center justify-center opacity-0" />
                      </div>
                      
                      {/* Stage number badge */}
                      <motion.div
                        className="absolute top-4 right-4 w-16 h-16 border-2 border-[#D4AF37]/40 rounded-full flex items-center justify-center"
                        animate={{
                          borderColor: isActive ? '#D4AF37' : 'rgba(212, 175, 55, 0.4)',
                          boxShadow: isActive ? '0 0 20px rgba(212, 175, 55, 0.8)' : '0 0 10px rgba(212, 175, 55, 0.2)'
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        <span className={`text-lg font-mono font-light transition-colors duration-500 ${isActive ? 'text-[#D4AF37]' : 'text-[#D4AF37]/40'}`}>
                          {stage.number}
                        </span>
                      </motion.div>
                    </motion.div>

                    {/* Text Section */}
                    <motion.div
                      className={`${index % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}
                      initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                      animate={{ 
                        opacity: isVisible ? 1 : 0, 
                        x: isVisible ? 0 : (index % 2 === 0 ? 50 : -50)
                      }}
                      transition={{ duration: 0.8 }}
                    >
                      <div className={`
                        relative pl-6 border-l-2 transition-all duration-500
                        ${isActive ? 'border-[#D4AF37]' : 'border-white/20'}
                      `}>
                        {/* Active indicator dot */}
                        <div className={`
                          absolute left-0 top-0 w-4 h-4 -translate-x-2.5 rounded-full transition-all duration-500
                          ${isActive 
                            ? 'bg-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.8)]' 
                            : 'bg-white/30'
                          }
                        `} />
                        
                        {/* Subtitle */}
                        <span className={`text-[10px] font-mono tracking-[0.3em] uppercase block mb-2 transition-colors duration-500 ${isActive ? 'text-[#D4AF37]' : 'text-[#D4AF37]/50'}`}>
                          {stage.subtitle}
                        </span>
                        
                        {/* Title */}
                        <h3 className="font-serif text-2xl md:text-3xl text-white font-light mb-4 tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
                          {stage.title}
                        </h3>
                        
                        {/* Main text */}
                        <p className="text-sm md:text-base text-white/80 font-light leading-relaxed mb-4">
                          {stage.text}
                        </p>
                        
                        {/* Detail text - only show when active */}
                        <motion.p 
                          className="text-xs md:text-sm text-white/60 font-light leading-relaxed italic"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ 
                            opacity: isActive ? 1 : 0,
                            height: isActive ? 'auto' : 0
                          }}
                          transition={{ duration: 0.5 }}
                        >
                          {stage.detail}
                        </motion.p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FINAL SECTION */}
          <div className="min-h-[60vh] flex items-center justify-center px-4 py-20">
            <motion.div
              className="text-center max-w-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: scrollProgress > 0.9 ? 1 : 0 }}
              transition={{ duration: 1 }}
            >
              <div className="w-16 h-[1px] bg-[#D4AF37]/60 mx-auto mb-8" />
              <p className="font-serif text-2xl md:text-3xl text-white font-light mb-6 leading-relaxed" style={{ fontFamily: "'Playfair Display', serif" }}>
                Every bottle is a testament to the dedication of artisans who believe that true luxury lies in the invisible labor of perfection.
              </p>
              <p className="text-sm md:text-base text-[#D4AF37]/80 font-mono tracking-wider uppercase">
                Crafted by hands. Perfected by hearts.
              </p>
              <div className="w-16 h-[1px] bg-[#D4AF37]/60 mx-auto mt-8" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Close Button */}
      <motion.button
        onClick={onClose}
        className="fixed top-3 sm:top-6 right-3 sm:right-4 md:right-8 z-[60] flex items-center gap-2 group"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span className="text-[8px] sm:text-[10px] font-mono tracking-[0.2em] text-white/50 uppercase group-hover:text-[#D4AF37] transition-colors duration-300 hidden sm:inline">
          Return Home
        </span>
        <X className="w-4 h-4 sm:w-5 sm:h-5 text-white/50 group-hover:text-[#D4AF37] transition-colors duration-300" />
      </motion.button>

      {/* Progress Counter */}
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

// ============================================
// INTERACTIVE CLOUD COMPONENT
// ============================================
const InteractiveCloud = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [weatherValue, setWeatherValue] = useState(0);
  const [showLightning, setShowLightning] = useState(false);
  const cloudRef = useRef(null);
  const skyBackgroundRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Handle drag start
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - offsetX,
      y: e.clientY - offsetY
    };
  };

  // Handle drag move
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setOffsetX(e.clientX - dragStartRef.current.x);
      setOffsetY(e.clientY - dragStartRef.current.y);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Random lightning effect when weather is at max
  useEffect(() => {
    if (weatherValue === 100) {
      const randomInterval = setInterval(() => {
        if (Math.random() > 0.7) {
          setShowLightning(true);
          setTimeout(() => setShowLightning(false), 100);
        }
      }, 500);

      return () => clearInterval(randomInterval);
    }
  }, [weatherValue]);

  // Calculate background saturation/brightness
  const saturation = (weatherValue / 100) * 30;
  const brightness = Math.max(100 - weatherValue * 0.3, 80);

  return (
    <motion.div
      className="relative w-full flex flex-col items-center justify-center"
      ref={skyBackgroundRef}
      style={{
        filter: `saturate(${100 + saturation}%) brightness(${brightness}%)`
      }}
    >
      {/* Sky Background */}
      <div className="absolute inset-0">
        <div
          className="w-full h-full"
          style={{
            background: `linear-gradient(to bottom, rgb(${135 - weatherValue}, ${200 - Math.floor(weatherValue * 0.5)}, 255) 0%, rgb(175, 220, 255) 50%, rgb(200, 230, 255) 100%)`
          }}
        />
      </div>

      {/* Lightning Background Glow */}
      {showLightning && (
        <motion.div
          className="absolute inset-0 bg-white/40 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.05 }}
        />
      )}

      {/* Cloud SVG - Draggable */}
      <motion.div
        ref={cloudRef}
        className="relative cursor-grab active:cursor-grabbing select-none z-10 mt-16"
        onMouseDown={handleMouseDown}
        style={{
          x: offsetX,
          y: offsetY,
        }}
      >
        <svg
          width="280"
          height="140"
          viewBox="0 0 280 140"
          className="drop-shadow-2xl"
          style={{
            filter: `drop-shadow(0 0 ${20 + weatherValue * 0.3}px rgba(100, 150, 255, ${weatherValue / 200}))`
          }}
        >
          {/* Cloud shape */}
          <g>
            {/* Main cloud body - white turning gray as weather increases */}
            <circle
              cx="50"
              cy="80"
              r="45"
              fill={`rgb(${255 - weatherValue * 0.5}, ${255 - weatherValue * 0.5}, ${255 - weatherValue * 0.3})`}
            />
            <circle
              cx="140"
              cy="60"
              r="55"
              fill={`rgb(${255 - weatherValue * 0.5}, ${255 - weatherValue * 0.5}, ${255 - weatherValue * 0.3})`}
            />
            <circle
              cx="230"
              cy="80"
              r="45"
              fill={`rgb(${255 - weatherValue * 0.5}, ${255 - weatherValue * 0.5}, ${255 - weatherValue * 0.3})`}
            />
            <rect
              x="50"
              y="80"
              width="180"
              height="50"
              fill={`rgb(${255 - weatherValue * 0.5}, ${255 - weatherValue * 0.5}, ${255 - weatherValue * 0.3})`}
            />
          </g>

          {/* Lightning bolt - appears when weather is 100% */}
          {weatherValue === 100 && (
            <g opacity={showLightning ? 1 : 0.3} className="transition-opacity duration-100">
              <path
                d="M 140 100 L 135 120 L 145 120 L 140 140 L 150 110 L 140 110 Z"
                fill="#FFD700"
                filter="url(#lightning-glow)"
              />
            </g>
          )}

          {/* Define glow filter */}
          <defs>
            <filter id="lightning-glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        </svg>
      </motion.div>

      {/* Weather Slider */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-20">
        <label className="text-sm font-mono text-gray-700 uppercase tracking-widest">
          Weather Intensity
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={weatherValue}
          onChange={(e) => setWeatherValue(Number(e.target.value))}
          className="w-48 h-2 bg-gradient-to-r from-blue-200 to-gray-500 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, rgb(150, 200, 255) 0%, rgb(${150 - weatherValue}, ${150 - weatherValue}, ${150 - weatherValue})) ${(weatherValue / 100) * 100}%, rgb(150, 150, 150) ${(weatherValue / 100) * 100}%, rgb(150, 150, 150) 100%)`
          }}
        />
        <span className="text-xs font-mono text-gray-600">
          {weatherValue}%
        </span>
      </div>

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #D4AF37, #FFE082);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          border: 2px solid white;
        }

        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #D4AF37, #FFE082);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          border: 2px solid white;
        }
      `}</style>
    </motion.div>
  );
};

// ============================================
// ORIGINS PORTAL - The Deep Dive (Scrollable)
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

  return (
    <motion.div
      className="fixed inset-0 z-50"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Fixed Background - Sky to Ground Transition */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* Sky gradient base - Starting from bright cloud colors and darkening on scroll */}
        <div 
          className="absolute inset-0 transition-all duration-700"
          style={{
            background: `linear-gradient(0deg, 
              rgb(${Math.max(25, Math.min(98, 98 - scrollProgress * 73))}, ${Math.max(22, Math.min(160, 160 - scrollProgress * 68))}, ${Math.max(18, Math.min(216, 216 - scrollProgress * 37))}) 0%, 
              rgb(${Math.max(20, Math.min(33, 33 - scrollProgress * 33))}, ${Math.max(18, Math.min(120, 120 - scrollProgress * 95))}, ${Math.max(15, Math.min(209, 209 - scrollProgress * 30))}) 50%,
              rgb(${Math.max(15, Math.min(8, 8 - scrollProgress * 0))}, ${Math.max(12, Math.min(92, 92 - scrollProgress * 80))}, ${Math.max(10, Math.min(179, 179 - scrollProgress * 169))}) 100%)`
          }}
        />
        
        {/* Atmospheric haze layers */}
        <div 
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: Math.max(0, 1 - scrollProgress * 1.5),
            background: `
              radial-gradient(ellipse 150% 60% at 50% 80%, rgba(255,255,255,0.15) 0%, transparent 50%),
              radial-gradient(ellipse 100% 40% at 30% 60%, rgba(200,220,255,0.1) 0%, transparent 40%),
              radial-gradient(ellipse 120% 50% at 70% 70%, rgba(255,240,220,0.08) 0%, transparent 45%)
            `
          }}
        />
        
        {/* Sun/golden glow - fades as we descend */}
        <div 
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: Math.max(0, 0.6 - scrollProgress),
            background: `radial-gradient(ellipse 80% 60% at 50% 30%, rgba(255,220,150,0.2) 0%, transparent 60%)`
          }}
        />
        
        {/* Venetian warm glow - appears as we approach ground */}
        <div 
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: Math.max(0, scrollProgress - 0.4) * 1.5,
            background: `radial-gradient(ellipse 100% 80% at 50% 100%, rgba(212,175,55,0.15) 0%, transparent 50%)`
          }}
        />
        
        {/* Mist/fog layers - increase near ground */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.3 + scrollProgress * 0.4,
            background: `
              linear-gradient(to top, 
                rgba(${30 + scrollProgress * 20}, ${25 + scrollProgress * 15}, ${20 + scrollProgress * 10}, ${0.3 + scrollProgress * 0.5}) 0%, 
                transparent 40%
              )
            `
          }}
        />
        
        {/* Subtle Venice silhouette hint at bottom - appears as we descend */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[30vh] transition-opacity duration-1000"
          style={{
            opacity: Math.max(0, scrollProgress - 0.5) * 2,
            background: `linear-gradient(to top, 
              rgba(15,12,10,0.95) 0%, 
              rgba(20,18,15,0.7) 30%,
              transparent 100%
            )`
          }}
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
      className="fixed inset-0 z-50 bg-[#020405]"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
    >
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

// ============================================
// HOME CONTENT WRAPPER
// ============================================
const HomeContent = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <HeroSection />
      <ArtifactSection />
      <HeritageSection />
      <AcquisitionSection />
    </motion.div>
  );
};

// ============================================
// MAIN APP COMPONENT
// ============================================

function App() {
  const [lang, setLang] = useState('en');
  const [activeSection, setActiveSection] = useState('home'); // 'home', 'story', 'origins', 'purity'
  const [scrollToAcquire, setScrollToAcquire] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const t = content[lang];
  
  // Smooth scroll behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when portal is open
  useEffect(() => {
    if (activeSection !== 'home') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeSection]);

  // Scroll to acquisition when coming back from portal
  useEffect(() => {
    if (activeSection === 'home' && scrollToAcquire) {
      // Use timeout to ensure DOM is updated
      const timer = setTimeout(() => {
        const acquisitionSection = document.querySelector('section:last-of-type');
        acquisitionSection?.scrollIntoView({ behavior: 'smooth' });
        setScrollToAcquire(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeSection, scrollToAcquire]);

  const handleNavClick = (section) => {
    if (section === 'acquire') {
      // If not on home, go to home first
      if (activeSection !== 'home') {
        setActiveSection('home');
        setScrollToAcquire(true);
      } else {
        // Already on home, scroll directly
        const acquisitionSection = document.querySelector('section:last-of-type');
        acquisitionSection?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      setActiveSection(section);
      setScrollToAcquire(false);
    }
  };
  
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <div className="min-h-screen bg-[#020405] text-[#F5F5F5] selection:bg-[#D4AF37]/30 selection:text-white">
        {/* Custom cursor glow effect (optional enhancement) */}
        <div className="fixed inset-0 pointer-events-none z-50 hidden lg:block">
          <div className="absolute w-96 h-96 bg-[radial-gradient(circle,_#D4AF37_0%,_transparent_70%)] opacity-[0.02] blur-3xl" 
            style={{ 
              transform: 'translate(-50%, -50%)',
              left: 'var(--mouse-x, 50%)',
              top: 'var(--mouse-y, 50%)'
            }} 
          />
        </div>
        
        {/* Language Switcher is now inside DropdownMenu */}
        
        {/* Dropdown Menu Navigation - Always visible */}
        <DropdownMenu onNavClick={handleNavClick} activeSection={activeSection} translations={t} />
        
        {/* Main Content with AnimatePresence */}
        <AnimatePresence mode="wait">
          {activeSection === 'home' && (
            <main key="home">
              <HomeContent />
            </main>
          )}
          
          {activeSection === 'story' && (
            <StoryPortal 
              key="story"
              onClose={() => setActiveSection('home')} 
            />
          )}
          
          {activeSection === 'origins' && (
            <OriginsPortal 
              key="origins"
              onClose={() => setActiveSection('home')} 
            />
          )}
          
          {activeSection === 'purity' && (
            <PurityPortal 
              key="purity"
              onClose={() => setActiveSection('home')} 
            />
          )}
        </AnimatePresence>
        
        {/* Global noise texture overlay */}
        <div 
          className="fixed inset-0 pointer-events-none z-30 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>
    </LanguageContext.Provider>
  );
}

export default App;