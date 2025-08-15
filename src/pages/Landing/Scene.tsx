import React from "react";
import { useEffect, useRef } from "react";
import Matter, {
  Engine,
  Render,
  Runner,
  World,
  Bodies,
  Composite,
  Mouse,
  MouseConstraint,
  Body,
} from "matter-js";
import {createCircle, createArch, renderArch} from "../../ui/utils/createShapes";

export default function Scene() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // sizes
    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight;

    // 1) engine & world
    const engine = Engine.create({ gravity: { x: 0, y: 1 } });
    const world = engine.world;

    // 2) renderer
    const render = Render.create({
      element: containerRef.current,
      engine,
      options: {
        width,
        height,
        background: "transparent",
        wireframes: false,
        pixelRatio: window.devicePixelRatio,
      
      },
    });
    Render.run(render);

    // runner (game loop)
    const runner = Runner.create();
    Runner.run(runner, engine);

    // Store shape metadata separately
    const shapeData = new Map<Body, { type: string; color: string; size: number; archSide?: string }>();

    const R = Math.min(60, width * 0.15, height * 0.15);
    const archSize = Math.min(280, width * 0.2, height * 0.2);

    // 3) Create shapes
    const circle = createCircle(width * 0.5, R + 20, R, false, shapeData);
    const pinkArch = createArch(width * 0.3, height * 0.6, archSize, '#ff69b4', 'bottom', true, shapeData);
    const blueArch = createArch(width * 0.7, 50, archSize * 0.8, '#4169e1', 'top', false, shapeData);
    
    // Add more circles with varying sizes and colors
    const smallCircle = createCircle(width * 0.2, 80, R * 0.6, false, shapeData);
    const largeCircle = createCircle(width * 0.8, height * 0.7, R * 1.4, false, shapeData);

    Matter.Events.on(render, 'afterRender', () => {
      const ctx = render.context;
      
      // Draw all circles
      [circle, smallCircle, largeCircle].forEach(circleBody => {
        const data = shapeData.get(circleBody);
        if (data?.type === 'circle') {
          const { x, y } = circleBody.position;
          const angle = circleBody.angle;
        
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angle);
        
          // Create different gradients for each circle
          let gradient;
          if (circleBody === circle) {
            // Original orange to pink gradient
            gradient = ctx.createRadialGradient(0, 0, data.size * 0.2, 0, 0, data.size);
            gradient.addColorStop(0, '#ff8a00');
            gradient.addColorStop(1, '#ff0080');
          } else if (circleBody === smallCircle) {
            // Green to blue gradient
            gradient = ctx.createRadialGradient(0, 0, data.size * 0.2, 0, 0, data.size);
            gradient.addColorStop(0, '#00ff88');
            gradient.addColorStop(1, '#0088ff');
          } else {
            // Purple to yellow gradient
            gradient = ctx.createRadialGradient(0, 0, data.size * 0.2, 0, 0, data.size);
            gradient.addColorStop(0, '#8a2be2');
            gradient.addColorStop(1, '#ffff00');
          }
        
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(0, 0, data.size, 0, Math.PI * 2);
          ctx.fill();
        
          ctx.restore();
        }
      });

      // Draw arches using the utility function
      [pinkArch, blueArch].forEach(arch => {
        renderArch(ctx, arch, shapeData);
      });
    });

    // 4) boundaries to keep shapes within the world
    const floor = Bodies.rectangle(width / 2, height - 20, width, 40, {
      isStatic: true,
      render: { fillStyle: "#e8e8e8", },
    });
    
    // Left wall - positioned exactly at left edge of screen
    const leftWall = Bodies.rectangle(20, height / 2, 40, height, {
      isStatic: true,
      render: { fillStyle: "#e8e8e8", },
    });
    
    // Right wall - positioned exactly at right edge of screen
    const rightWall = Bodies.rectangle(width - 20, height / 2, 40, height, {
      isStatic: true,
      render: { fillStyle: "#e8e8e8", },
    });
    
    // Ceiling - positioned at top edge to prevent shapes from going above screen
    const ceiling = Bodies.rectangle(width / 2, 20, width, 40, {
      isStatic: true,
      render: { fillStyle: "#e8e8e8", },
    });

    Composite.add(world, [circle, pinkArch, blueArch, smallCircle, largeCircle, floor, leftWall, rightWall, ceiling]);

    // 5) basic interactivity (drag with mouse/touch)
  // 5) interactivity (drag) — but don't swallow page scroll
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
  mouse,
  constraint: { stiffness: 0.2, render: { visible: false } },
});
Composite.add(world, mouseConstraint);

// Allow page scroll while hovering canvas:
const m = mouse as any;
if (m.element && m.mousewheel) {
  m.element.removeEventListener('mousewheel', m.mousewheel);
  m.element.removeEventListener('DOMMouseScroll', m.mousewheel); // Firefox
}
// (optional) let touch scroll pass through as well
if (m.element && m.touchmove) {
  m.element.removeEventListener('touchmove', m.touchmove);
}


    // cleanup
    return () => {
      Render.stop(render);
      Runner.stop(runner);
      World.clear(world, false);
      Engine.clear(engine);
      render.canvas.remove();
      (render as any).textures = {};
    };
  }, []);

  // full-bleed canvas host
  return (
    <div
      ref={containerRef}
    />
  );
}
