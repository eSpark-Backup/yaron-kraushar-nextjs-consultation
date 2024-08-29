import React, { useEffect, useState, useRef } from 'react';

const RotatingSquare = ({
  startRotation,
  endRotation,
  bgImage,
  width = 200,
  height = 200,
  maxScroll = 2000,
}) => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [baselineScrollY, setBaselineScrollY] = useState(null);
  const squareRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setBaselineScrollY(window.scrollY);
          setIsVisible(true);
        } else {
          setIsVisible(false);
          setBaselineScrollY(null); // Reset baseline scroll when the component is not visible
        }
      },
      { threshold: 0.1 },
    );

    const currentSquareRef = squareRef.current; // Capture the ref value

    if (currentSquareRef) {
      observer.observe(currentSquareRef);
    }

    window.addEventListener('scroll', handleScroll);

    return () => {
      if (currentSquareRef) {
        observer.unobserve(currentSquareRef); // Use the captured ref value
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const effectiveScrollY =
    baselineScrollY !== null ? scrollY - baselineScrollY : 0;
  const clampedScrollY = Math.min(Math.max(effectiveScrollY, 0), maxScroll);
  const rotationRange = endRotation - startRotation;
  const rotation = startRotation + (clampedScrollY / maxScroll) * rotationRange;

  return (
    <>
      <div
        ref={squareRef}
        className="rotating-square"
        style={{
          transform: isVisible
            ? `rotate(${rotation}deg)`
            : `rotate(${startRotation}deg)`,
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        <div
          className="background-image"
          style={{ backgroundImage: `url(${bgImage})` }}
        ></div>
      </div>
      <style jsx>{`
        .rotating-square {
          border-radius: 24px;
          background-color: #fff;
          transition: transform 0.1s;
          position: relative;
          padding: 10px; /* Add padding to the parent container */
          overflow: hidden; /* Ensure content stays within bounds */
        }

        .background-image {
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          border-radius: inherit; /* Ensure the border radius is inherited */
        }
      `}</style>
    </>
  );
};

export default RotatingSquare;
