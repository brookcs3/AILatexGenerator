import { useEffect, useRef } from "react";
import reglInit from "regl";
import "./ShaderBackground.css";

const ShaderBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const regl = reglInit({ canvas });
    let mouse = [0.5, 0.5];

    const handleMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse = [
        (e.clientX - rect.left) / rect.width,
        1 - (e.clientY - rect.top) / rect.height,
      ];
    };

    const handleTouch = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      const rect = canvas.getBoundingClientRect();
      mouse = [
        (e.touches[0].clientX - rect.left) / rect.width,
        1 - (e.touches[0].clientY - rect.top) / rect.height,
      ];
    };

    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("touchmove", handleTouch, { passive: true });

    const draw = regl({
      frag: `
        precision mediump float;
        uniform vec2 mouse;
        uniform float time;
        varying vec2 uv;
        void main() {
          vec2 p = uv - mouse;
          float d = length(p);
          float glow = 0.015 / d;
          float wave = sin(10.0 * d - time * 2.0);
          vec3 color = mix(vec3(0.2,0.3,0.6), vec3(0.8,0.2,0.6), wave);
          gl_FragColor = vec4(color * glow, 1.0);
        }
      `,
      vert: `
        precision mediump float;
        attribute vec2 position;
        varying vec2 uv;
        void main() {
          uv = position * 0.5 + 0.5;
          gl_Position = vec4(position, 0, 1);
        }
      `,
      attributes: {
        position: [
          [-1, -1],
          [-1, 1],
          [1, 1],
          [1, -1],
        ],
      },
      elements: [
        [0, 1, 2],
        [0, 2, 3],
      ],
      uniforms: {
        mouse: () => mouse,
        time: ({ time }: { time: number }) => time,
      },
    });

    const frame = regl.frame(() => {
      draw();
    });

    const handleResize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      frame.cancel();
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("touchmove", handleTouch);
      window.removeEventListener("resize", handleResize);
      regl.destroy();
    };
  }, []);

  return <canvas ref={canvasRef} className="shader-bg-canvas" />;
};

export default ShaderBackground;
