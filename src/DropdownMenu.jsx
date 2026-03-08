import React, { useRef, useEffect, useState, useContext } from 'react';
import gsap from 'gsap';
import { useLanguage } from './App';

const DropdownMenu = ({ onNavClick, activeSection, translations }) => {
  const t = translations;
  const { lang, setLang } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const hamburgerRef = useRef(null);
  const pathRef = useRef(null);
  const tlRef = useRef(null);
  const toggleBtnRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ paused: true });
    tlRef.current = tl;

    const start = "M0 502S175 272 500 272s500 230 500 230V0H0Z";
    const end = "M0,1005S175,995,500,995s500,5,500,5V0H0Z";

    // Menu visibility is now managed by React state, not gsap

    if (pathRef.current) {
      tl.to(pathRef.current, 0.8, { attr: { d: start }, ease: "power2.in" }, "0")
        .to(pathRef.current, 0.8, { attr: { d: end }, ease: "power2.out" }, "-=0.5");
    }

  }, []);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
    if (hamburgerRef.current) {
      hamburgerRef.current.classList.toggle("active");
    }
    if (tlRef.current) {
      tlRef.current.reversed(!tlRef.current.reversed());
    }
  };

  const handleMenuClick = (section) => {
    onNavClick(section);
    handleMenuToggle();
  };

  return (
    <>
      <style>{`
        :root {
          --bg: #020405;
          --link-color: #D4AF37;
          --overlay-bg: #020405;
        }

        #toggle-btn {
          position: fixed;
          top: 2em;
          left: 2em;
          width: 80px;
          height: 80px;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 60;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          transition: all 0.3s ease;
        }
        
        #toggle-btn:hover {
          opacity: 0.8;
        }

        #hamburger {
          position: relative;
          height: 20px;
          width: 20px;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          align-items: center;
        }

        #hamburger span {
          position: relative;
          display: inline-block;
          width: 24px;
          height: 2px;
          background: #D4AF37;
          transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
          transform: translateY(0);
        }

        #hamburger span::before {
          position: absolute;
          top: -8px;
          right: 0;
          content: "";
          width: 24px;
          height: 2px;
          background: #D4AF37;
          transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
        }

        #hamburger span::after {
          position: absolute;
          top: 8px;
          right: 0;
          content: "";
          width: 24px;
          height: 2px;
          background: #D4AF37;
          transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
        }

        #hamburger.active span {
          background: transparent;
        }

        #hamburger.active span::before {
          transform: rotate(45deg) translate(5px, 5px);
        }

        #hamburger.active span::after {
          transform: rotate(-45deg) translate(5px, -5px);
        }

        .overlay {
          position: fixed;
          width: 100vw;
          height: 100vh;
          top: 0;
          left: 0;
          z-index: 40;
          pointer-events: none;
        }

        svg path {
          fill: var(--overlay-bg);
        }

        .menu {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          display: flex;
          z-index: 55;
          visibility: hidden;
          opacity: 0;
          transition: opacity 0.3s ease, visibility 0.3s ease;
          background: rgba(2, 4, 5, 0.98);
          backdrop-filter: blur(10px);
          pointer-events: none;
        }
        
        .menu.active {
          visibility: visible;
          opacity: 1;
          pointer-events: auto;
        }

        .menu > div {
          height: 100%;
          display: flex;
        }

        .menu a {
          position: relative;
          top: 0;
          line-height: 1.2;
          text-decoration: none;
          color: var(--link-color);
          font-family: 'Playfair Display', serif;
          cursor: pointer;
          transition: letter-spacing 0.3s ease;
          display: inline-block;
        }

        .menu a:hover {
          letter-spacing: 0.05em;
        }

        .menu a span {
          font-size: 20px;
          margin-right: 2em;
          font-family: 'Courier New', monospace;
        }

        .menu-item {
          position: relative;
          margin: 1rem 0;
        }

        .menu-item::after {
          display: none;
        }

        .menu-container {
          width: 70%;
          height: 50%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .primary-menu {
          flex: 3;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding-top: -2rem;
          margin-top: -2rem;
        }

        .primary-menu .menu-container .wrapper {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .primary-menu a {
          text-transform: uppercase;
          font-size: 125px;
          font-weight: 500;
        }

        .primary-menu .menu-container .wrapper .menu-item:nth-child(1) a,
        .primary-menu .menu-container .wrapper .menu-item:nth-child(3) a {
          margin-left: 1em;
        }

        .secondary-menu {
          position: fixed;
          bottom: 8em;
          right: 2em;
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          z-index: 55;
          text-align: right;
          align-items: flex-end;
          visibility: hidden;
          opacity: 0;
          transition: opacity 0.3s ease, visibility 0.3s ease;
          pointer-events: none;
        }

        .secondary-menu.active {
          visibility: visible;
          opacity: 1;
          pointer-events: auto;
        }

        .secondary-menu .menu-container {
          width: auto;
          height: auto;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          gap: 0.8rem;
        }

        .secondary-menu .wrapper {
          display: flex;
          flex-direction: column;
        }

        .secondary-menu .menu-item a {
          font-family: 'Playfair Display', serif;
          font-size: 24px;
          margin-left: 0;
          color: var(--link-color);
          text-decoration: none;
          cursor: pointer;
          position: relative;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          padding-bottom: 4px;
        }

        .secondary-menu .menu-item a::after {
          content: '';
          position: absolute;
          bottom: 0;
          right: 0;
          width: 0;
          height: 1px;
          background: var(--link-color);
          transition: width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .secondary-menu .menu-item a:hover {
          letter-spacing: 0.05em;
          transform: translateX(-4px);
        }

        .secondary-menu .menu-item a:hover::after {
          width: 100%;
          right: auto;
          left: 0;
        }

        .secondary-menu .wrapper:nth-child(1) .menu-item:nth-child(1) a {
          font-size: 24px;
          margin-left: 0;
        }

        .secondary-menu .wrapper:nth-child(2) .menu-item:nth-child(1) a {
          font-size: 24px;
          margin-left: 0;
        }

        .language-switcher {
          position: fixed;
          bottom: 2em;
          left: 2em;
          display: flex;
          gap: 1em;
          z-index: 60;
        }

        .language-switcher button {
          background: none;
          border: none;
          color: var(--link-color);
          font-size: 12px;
          font-family: 'Courier New', monospace;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 2px;
          transition: all 0.3s ease;
          opacity: 0.5;
        }

        .language-switcher button.active {
          opacity: 1;
          font-weight: bold;
        }

        .language-switcher button:hover {
          opacity: 0.8;
        }

        .language-switcher span {
          color: var(--link-color);
          opacity: 0.3;
        }

        @media (max-width: 768px) {
          .primary-menu a { font-size: 60px; }
          .secondary-menu .menu-item a { font-size: 20px; }
          #toggle-btn { width: 70px; height: 70px; margin: 1em; }
          .btn-outline { width: 70px; height: 70px; }
        }
      `}</style>

      <div id="toggle-btn" ref={toggleBtnRef} onClick={handleMenuToggle}>
        <div id="hamburger" ref={hamburgerRef}>
          <span></span>
        </div>
      </div>

      <div className={`menu ${isMenuOpen ? 'active' : ''}`}>
        <div className="primary-menu">
          <div className="menu-container">
            <div className="wrapper">
              <div className="menu-item">
                <a onClick={() => handleMenuClick('acquire')}>
                  <span>I</span>{t?.navAcquire || 'ACQUIRE'}
                </a>
              </div>
              <div className="menu-item">
                <a onClick={() => handleMenuClick('purity')}>
                  <span>II</span>{t?.navPurity || 'PURITY'}
                </a>
              </div>
              <div className="menu-item">
                <a onClick={() => handleMenuClick('origins')}>
                  <span>III</span>{t?.navOrigins || 'ORIGINS'}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Language Switcher inside Menu */}
        <div className="language-switcher">
          {['en', 'fr', 'cn'].map((code, index) => (
            <React.Fragment key={code}>
              <button
                onClick={() => setLang(code)}
                className={code === lang ? 'active' : ''}
              >
                {code.toUpperCase()}
              </button>
              {index < 2 && <span>/</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className={`secondary-menu ${isMenuOpen ? 'active' : ''}`}>
        <div className="menu-container">
          <div className="wrapper">
            <div className="menu-item">
              <a onClick={() => handleMenuClick('story')}>
                {t?.navStory || 'STORY'}
              </a>
            </div>
          </div>
          <div className="wrapper">
            <div className="menu-item">
              <a href="#credits">Credits</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DropdownMenu;
