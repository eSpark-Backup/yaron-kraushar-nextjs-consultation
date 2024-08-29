import Link from 'next/link';
import JimpleLogo from './jimple-logo';
import React, { useEffect, useState, useMemo } from 'react';

export default function LinkExpired(props) {
  const [animationClass, setAnimationClass] = useState('');

  const myAnimations = useMemo(
    () => [
      'animate__bounce',
      'animate__wobble',
      'animate__tada',
      'animate__heartBeat',
    ],
    [],
  );

  useEffect(() => {
    function setRandomAnimation() {
      const randomIndex = Math.floor(Math.random() * myAnimations.length);
      setAnimationClass(myAnimations[randomIndex]);
    }
    const intervalId = setInterval(setRandomAnimation, 2000);
    return () => clearInterval(intervalId);
  }, [myAnimations]);

  return (
    <div>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="flex justify-center">
          <JimpleLogo
            width={100}
            height={100}
            className={`animate__animated ${animationClass}`}
          />
        </div>

        <h1 className=" mb-8 text-2xl text-center justify-center">
          Link has expired
        </h1>
      </div>
    </div>
  );
}
