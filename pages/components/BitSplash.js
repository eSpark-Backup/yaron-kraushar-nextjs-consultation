import { useState, useEffect } from 'react';

const messageHello = [
  { icon: 'core-hello', label: 'Hello', message: `"Hello, how are you?"`,rotate:'rotate-6' },
  { icon: 'core-hello', label: 'Hello', message: `"Hola, ¿cómo estás?"`,rotate:'rotate-6' },
  { icon: 'core-hello', label: 'Hello', message: `"你好，你怎么样"`,rotate:'rotate-6' },
  { icon: 'food-coffee', label: 'Coffee', message: `"Would you like a coffee?"`,rotate:'-rotate-6' },
  { icon: 'food-coffee', label: 'Coffee', message: `"¿Quieres un café?"`,rotate:'-rotate-6' },
  { icon: 'food-coffee', label: 'Coffee', message: `"你想喝咖啡吗"`,rotate:'-rotate-6' },
  { icon: 'emotion-happy', label: 'Happy', message: `"I'm feeling great"`,rotate:'-rotate-2' },
  { icon: 'emotion-happy', label: 'Happy', message: `"Me siento muy bien"`,rotate:'rotate-2' },
  { icon: 'emotion-happy', label: 'Happy', message: `"我感觉很好"`,rotate:'-rotate-2' },
];

export default function BitSplash() {
  const [selectedMessage, setSelectedMessage] = useState({});
  const [animateState, setAnimateState] = useState(true);

  useEffect(() => {
    const messageTimer = setInterval(() => {
      setAnimateState(true);
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * messageHello.length);
        setSelectedMessage(messageHello[randomIndex]);
      }, 800);

      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * messageHello.length);
        setAnimateState(false);
      }, 1000);
    }, 5000);

    return () => clearInterval(messageTimer);
  }, []);

  const onAnimationEnd = () => {
    setAnimateState(false);
  };

  return (
    <div className={`${selectedMessage.rotate}`}>
      <div
        className={`flex flex-col items-center origin-center animate__animated ${animateState ? 'animate__bounceOut' : 'animate__bounceIn' }`} onAnimationEnd={onAnimationEnd}>
        {selectedMessage.label && (
          <div className={`flex flex-col justify-center items-center w-32 h-32 bg-white rounded-lg`}>
            <div className={`pt-2 w-24 h-24 ${selectedMessage.icon}`}></div>
            <div className="text-black -mt-2 bottom-2">{selectedMessage.label}</div>
          </div>
        )}
        {selectedMessage.message && <div className=" text-2xl mt-2">{selectedMessage.message}</div>}
      </div>
    </div>
  );
}
