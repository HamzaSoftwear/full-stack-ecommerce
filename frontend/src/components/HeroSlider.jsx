import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HeroSlider({ slides = [] }) {
  const navigate = useNavigate();
  const safeSlides = Array.isArray(slides) && slides.length > 0 ? slides : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentSlide = safeSlides[activeIndex] || {
    title: "",
    subtitle: "",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
    accent: "#2563eb"
  };

  useEffect(() => {
    if (safeSlides.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
      setActiveIndex(prev => (prev + 1) % safeSlides.length);
        setIsTransitioning(false);
      }, 300);
    }, 5000);
    return () => clearInterval(timer);
  }, [safeSlides.length, isPaused]);

  const handlePrev = () => {
    setIsTransitioning(true);
    setTimeout(() => {
    setActiveIndex(prev => (prev - 1 + safeSlides.length) % safeSlides.length);
      setIsTransitioning(false);
    }, 150);
  };

  const handleNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
    setActiveIndex(prev => (prev + 1) % safeSlides.length);
      setIsTransitioning(false);
    }, 150);
  };

  const dots = useMemo(
    () =>
      safeSlides.map((_, idx) => (
        <button
          key={idx}
          type="button"
          className={`hero-dot ${idx === activeIndex ? "is-active" : ""}`}
          onClick={() => {
            setIsTransitioning(true);
            setTimeout(() => {
              setActiveIndex(idx);
              setIsTransitioning(false);
            }, 150);
          }}
          aria-label={`الانتقال إلى الشريحة ${idx + 1}`}
        />
      )),
    [safeSlides, activeIndex]
  );

  return (
    <div
      className="hero-slider-wrapper"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      dir="rtl"
    >
      <div className="hero-slider-container">
        {safeSlides.map((slide, idx) => (
          <div
            key={idx}
            className={`hero-slide ${idx === activeIndex ? "active" : ""} ${isTransitioning ? "transitioning" : ""}`}
            style={{
              background: `linear-gradient(135deg, ${slide.accent || "#2563eb"}15 0%, ${slide.accent || "#2563eb"}05 100%)`
            }}
          >
            <div className="hero-slide-content">
              <div className="hero-slide-text">
                <div className="hero-badge">
                  <span>✨</span>
                  <span>اكتشف العروض</span>
                </div>
                <h1 className="hero-title">{slide.title}</h1>
                <p className="hero-subtitle">{slide.subtitle}</p>
                <button 
                  className="hero-cta-btn" 
                  type="button" 
                  onClick={() => navigate("/")}
        style={{
                    background: slide.accent || "#2563eb",
                    boxShadow: `0 4px 14px 0 ${slide.accent || "#2563eb"}40`
                  }}
                >
              تسوق الآن
                  <span>→</span>
            </button>
              </div>
              <div className="hero-slide-image-wrapper">
                <div 
                  className="hero-image-bg"
                  style={{ background: slide.accent || "#2563eb" }}
                />
                <img 
                  src={slide.image} 
                  alt={slide.title} 
                  className="hero-slide-image"
                  loading={idx === 0 ? "eager" : "lazy"}
                />
              </div>
            </div>
          </div>
        ))}
        </div>

      {safeSlides.length > 1 && (
        <>
          <button 
            type="button" 
            className="hero-nav-btn hero-nav-prev" 
            onClick={handlePrev}
            aria-label="الشريحة السابقة"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
        </button>
          <button 
            type="button" 
            className="hero-nav-btn hero-nav-next" 
            onClick={handleNext}
            aria-label="الشريحة التالية"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
        </button>
        </>
      )}

      <div className="hero-dots-container">
        {dots}
      </div>
    </div>
  );
}
