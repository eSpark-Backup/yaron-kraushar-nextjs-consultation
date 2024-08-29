import Link from 'next/link';
import JimpleLogo from './jimple-logo';
import React, { useEffect, useState, useMemo } from 'react';
import DeepLink from '../../services/deeplink';

export default function NotAuthorized(props) {
  const myAnimations = useMemo(
    () => [
      'animate__bounce',
      'animate__wobble',
      'animate__tada',
      'animate__heartBeat',
    ],
    [],
  );

  const [animationClass, setAnimationClass] = useState('');
  useEffect(() => {
    function setRandomAnimation() {
      const randomIndex = Math.floor(Math.random() * myAnimations.length);
      setAnimationClass(myAnimations[randomIndex]);
    }
    const intervalId = setInterval(setRandomAnimation, 2000);
    return () => clearInterval(intervalId);
  }, [myAnimations]);

  const navigateBack = () => {
    DeepLink.error();
  };

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

        <h1 className="text-red-500">
          Something went wrong, please try again later
        </h1>
        <>
          <button
            onClick={navigateBack}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Return to App
          </button>
        </>
      </div>
    </div>
  );
}
