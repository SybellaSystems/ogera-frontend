import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface Slide {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface FeatureSliderProps {
  slides: Slide[];
  interval?: number;
}

const FeatureSlider: React.FC<FeatureSliderProps> = ({
  slides,
  interval = 5000,
}) => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const advance = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(advance, interval);
    return () => clearInterval(timer);
  }, [advance, interval, isPaused]);

  const slide = slides[current];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        maxWidth: 420,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      {/* Card */}
      <div
        style={{
          width: "100%",
          minHeight: 200,
          position: "relative",
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderRadius: 16,
          border: "1px solid rgba(255, 255, 255, 0.15)",
          padding: "36px 30px",
          overflow: "hidden",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 14,
            }}
          >
            {/* Icon in circular container */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {slide.icon}
            </div>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 800,
                fontFamily: "'Nunito', sans-serif",
                color: "#ffffff",
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {slide.title}
            </h2>
            <p
              style={{
                fontSize: 15,
                fontFamily: "'Nunito', sans-serif",
                color: "#ffffff",
                opacity: 0.9,
                margin: 0,
                lineHeight: 1.6,
                fontWeight: 400,
              }}
            >
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      <div style={{ display: "flex", gap: 8 }}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              width: i === current ? 24 : 8,
              height: 8,
              borderRadius: 4,
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "all 0.3s ease",
              backgroundColor:
                i === current
                  ? "rgba(255, 255, 255, 0.95)"
                  : "rgba(255, 255, 255, 0.35)",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default FeatureSlider;
