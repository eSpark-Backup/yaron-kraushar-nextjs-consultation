import { useEffect } from 'react';

const Square = () => {
  useEffect(() => {
    const container = document.getElementById('square-container');

    function startRotation(square) {
      let rotation = Math.random() * 360; // Random initial rotation between 0 and 360 degrees
      const speed = Math.random() * 0.05 + 0.1; // Random rotation speed
      const rotationDirection = Math.random() < 0.5 ? 1 : -1;

      function rotateSquare() {
        rotation += speed * rotationDirection;
        square.style.transform = `rotate(${rotation}deg)`;
        requestAnimationFrame(rotateSquare);
      }

      rotateSquare();
    }

    function startBorderRadiusAnimation(square) {
      const minBorderRadius = 80; // Minimum border radius in pixels
      const maxBorderRadius = 200; // Maximum border radius in pixels

      const borderRadii = [
        { value: minBorderRadius + Math.random() * (maxBorderRadius - minBorderRadius), direction: 1 },
        { value: minBorderRadius + Math.random() * (maxBorderRadius - minBorderRadius), direction: -1 },
        { value: minBorderRadius + Math.random() * (maxBorderRadius - minBorderRadius), direction: 1 },
        { value: minBorderRadius + Math.random() * (maxBorderRadius - minBorderRadius), direction: -1 }
      ];

      function animateBorderRadius() {
        for (let i = 0; i < 4; i++) {
          const { value, direction } = borderRadii[i];
          borderRadii[i].value += .5 * direction; // increase value = more speed
          if (borderRadii[i].value >= maxBorderRadius || borderRadii[i].value <= minBorderRadius) {
            borderRadii[i].direction *= -1;
          }
        }

        const borderRadiusStyle = `${borderRadii[0].value}px ${borderRadii[1].value}px ${borderRadii[2].value}px ${borderRadii[3].value}px`;
        square.style.borderRadius = borderRadiusStyle;

        requestAnimationFrame(animateBorderRadius);
      }

      animateBorderRadius();
    }

    const colors = [
      'linear-gradient(45deg, rgba(22,148,250,1) 1%, rgba(22,148,250,0.2) 30%)',
      'linear-gradient(135deg, rgb(11, 212, 64) 1%, rgba(0, 255, 136, 0.2) 30%)',
      'linear-gradient(45deg, rgba(255,166,0,1) 1%, rgba(255,166,0,0.2) 50%)',
      'linear-gradient(135deg, rgba(217,39,119,1) 1%, rgba(217,39,119,0.2) 40%)'

    ];

    // Remove existing squares before creating new ones
    container.innerHTML = '';

    for (let i = 0; i < 4; i++) {
      const square = document.createElement('div');
      square.style.width = '150px';
      square.style.height = '150px';
      square.style.position = 'absolute';
      square.style.background = colors[i];
      square.style.top = '0';
      square.style.left = '0';
      container.appendChild(square);
      startRotation(square);
      startBorderRadiusAnimation(square);
    }
  }, []); // Empty dependency array ensures the effect runs only once

  return (
      <div className="square-container" id="square-container"></div>
  );
};

export default Square;

