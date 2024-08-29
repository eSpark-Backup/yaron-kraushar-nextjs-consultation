import { useEffect, useState } from 'react';
import Image from 'next/image';

const images = [
  '/i_hero01.png',
  '/i_hero02.png',
  '/i_hero03.png'
];



const Slideshow = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setFade(false);

      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        setFade(true);
      }, 500);
    }, 5000); // Change image every 1 second

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="relative w-[400px] h-0 rotate-6" style={{ paddingBottom: '580px' }}>
      {images.map((src, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-500 ${index === currentImageIndex ? (fade ? 'opacity-100' : 'opacity-0') : 'opacity-0'}`}
        >
          <Image
            src={src}
            alt={`Slide ${index}`}
            layout="fill"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
};

export default Slideshow;
