"use client";

import { useEffect } from "react";

interface Props {
  speedFactor?: number;
  starSize?: number;
  backgroundColor?: string;
  starColor?: [number, number, number];
  starCount?: number;
}

const Starfield = (props: Props) => {
  const {
    speedFactor = 0.05,
    starSize = 1,
    backgroundColor = "black",
    starColor = [255, 255, 255],
    starCount = 5000,
  } = props;

  useEffect(() => {
    const canvas = document.getElementById("starfield") as HTMLCanvasElement;

    if (canvas) {
      const c = canvas.getContext("2d");

      if (c) {
        let w = window.innerWidth;
        let h = window.innerHeight;

        const setCanvasExtents = () => {
          canvas.width = w;
          canvas.height = h;
        };

        setCanvasExtents();

        window.onresize = () => {
          setCanvasExtents();
        };

        const makeStars = (count: number) => {
          const out = [];
          for (let i = 0; i < count; i++) {
            const s = {
              x: Math.random() * 1600 - 800,
              y: Math.random() * 900 - 450,
              z: Math.random() * 1000,
            };
            out.push(s);
          }
          return out;
        };

        const stars = makeStars(starCount);

        const clear = () => {
          // Create linear gradient
          // const grad = c.createLinearGradient(0, 0, 280, 0);
          const grad = c.createRadialGradient(
            canvas.width / 2,
            canvas.height / 2,
            15,
            canvas.width / 2,
            canvas.height / 2,
            canvas.height / 2,
          );
          // const grad = c.createRadialGradient(
          //   canvas.width / 2,
          //   canvas.height / 2,
          //   0,
          //   canvas.width / 2,
          //   canvas.height / 2,
          //   canvas.height
          // );
          // grad.addColorStop(0, "darkblue");0c031a
          // grad.addColorStop(0, "#0a0117");
          grad.addColorStop(0, "#100126");
          grad.addColorStop(1, "#04000a");

          // Fill rectangle with gradient
          c.fillStyle = grad;
          // c.fillStyle = backgroundColor;

          // c.fillStyle = backgroundColor;
          c.fillRect(0, 0, canvas.width, canvas.height);
        };

        const putPixel = (
          x: number,
          y: number,
          brightness: number,
          i: number,
        ) => {
          const rgb =
            "rgba(" +
            starColor[0] +
            "," +
            starColor[1] +
            "," +
            starColor[2] +
            "," +
            brightness +
            ")";
          c.fillStyle = rgb;
          /*
          // Basic square star
          c.fillRect(x, y, starSize, starSize);
          */

          // Basic circle star
          c.beginPath();
          c.arc(x, y, ((starSize + i) % starSize) / 2, 0, Math.PI * 2);
          // c.arc(x, y, starSize / 2, 0, Math.PI * 2);
          c.fill();

          /*
          // Create a star that twinkles with a radial gradient
          const gradient = c.createRadialGradient(
            x,
            y,
            0, // Inner circle center and radius
            x,
            y,
            starSize / 2 // Outer circle center and radius
          );
          gradient.addColorStop(0, "rgba(255, 255, 255, 1)"); // Center: bright white
          gradient.addColorStop(1, "rgba(255, 255, 255, 1)"); // Edge: transparent

          c.fillStyle = gradient;
          c.beginPath();
          c.arc(x, y, (starSize + i) % starSize, 0, Math.PI * 2);
          c.fill();
          // Reset fillStyle if you have other drawing operations after this
          c.fillStyle = rgb;
          */

          /*
          // Create a star with a shadow
          c.save(); // Save the current canvas state
          c.shadowBlur = ((starSize + i) % starSize) * 2;
          c.shadowColor = "rgba(255, 255, 255, 0.7)";
          c.beginPath();
          c.arc(x, y, starSize / 2, 0, Math.PI * 2);
          c.fill();
          c.restore(); // Restore the canvas state
          c.fillStyle = rgb;
          */
        };

        const moveStars = (distance: number) => {
          const count = stars.length;
          for (let i = 0; i < count; i++) {
            const s = stars[i];
            s.z -= distance;
            while (s.z <= 1) {
              s.z += 1000;
            }
          }
        };

        let prevTime: number;
        const init = (time: number) => {
          prevTime = time;
          requestAnimationFrame(tick);
        };

        const tick = (time: number) => {
          const elapsed = time - prevTime;
          prevTime = time;

          moveStars(elapsed * speedFactor);

          clear();

          const cx = w / 2;
          const cy = h / 2;

          const count = stars.length;
          for (let i = 0; i < count; i++) {
            const star = stars[i];

            const x = cx + star.x / (star.z * 0.001);
            const y = cy + star.y / (star.z * 0.001);

            if (x < 0 || x >= w || y < 0 || y >= h) {
              continue;
            }

            const d = star.z / 1000.0;
            const b = 1 - d * d;

            putPixel(x, y, b, i);
          }

          requestAnimationFrame(tick);
        };

        requestAnimationFrame(init);

        // add window resize listener:
        window.addEventListener("resize", function () {
          w = window.innerWidth;
          h = window.innerHeight;
          setCanvasExtents();
        });
      } else {
        console.error("Could not get 2d context from canvas element");
      }
    } else {
      console.error('Could not find canvas element with id "starfield"');
    }

    return () => {
      window.onresize = null;
    };
  }, [backgroundColor, speedFactor, starColor, starCount, starSize]);

  return (
    <canvas
      id="starfield"
      style={{
        padding: 0,
        margin: 0,
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 10,
        opacity: 1,
        pointerEvents: "none",
        mixBlendMode: "screen",
      }}
    ></canvas>
  );
};

export { Starfield };
