import React, { useEffect, useState } from 'react';

const RotatingPhone = ({ startRotation, endRotation, bgImage }) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const maxScroll = 2000; // Adjust this to control when the rotation should stop changing
  const clampedScrollY = Math.min(scrollY, maxScroll);
  const rotationRange = startRotation - endRotation;
  const rotation = startRotation - ((clampedScrollY / maxScroll) * rotationRange);

  return (
    <>
      <div
        className="rotating-square"
        style={{
          transform: `rotate(${rotation}deg)`,
          backgroundImage: `url(${bgImage})`,
        }}
      />
      <style jsx>{`
        .rotating-square {
          width: 320px;
          height: 720px;
          border-radius:32px;
          background-color: #333;
          background-size: cover;
          background-position: center;
          transition: transform 0.1s;
          box-shadow: 0 0 0 8px rgba(0,0,0),
          0 0 0 12px rgba(30,30,30);

        }

      

      `}</style>
    </>
  );
};

export default RotatingPhone;




