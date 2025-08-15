import React from "react";
import {useEffect, useRef} from "react";
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
import {createCircle, createArch, renderArch, createRectangleWithInnerCircles, renderRectangleWithInnerCircles, createStar, renderStar, createEye, renderEye} from "../../ui/utils/createShapes";

export default function Scene() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // sizes
    const width = containerRef.current.clientWidth || window.innerWidth;
    // MİNUS HEADER HEİGHT
    const height = containerRef.current.clientHeight || window.innerHeight - 80;

    // 1) engine & world
    const engine = Engine.create({gravity: {x: 0, y: 1}});
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
    const shapeData = new Map<Body, {type: string; color: string; size: number; archSide?: string; isHalfCircle?: boolean}>();

    const R = Math.min(260, width * 0.15, height * 0.15);
    const archSize = Math.min(280, width * 0.2, height * 0.2);

    // 3) Create shapes
    const circle = createCircle(width * 0.5, R + 20, R, false, shapeData, false, '#ff8a00');
    const pinkArch = createArch(width * 0.3, height * 0.6, archSize, '#ff69b4', 'bottom', true, shapeData);
    const blueArch = createArch(width * 0.7, 50, archSize * 0.8, '#4169e1', 'top', false, shapeData);

    // Add more circles with varying sizes and colors
    const smallCircle = createCircle(width * 0.2, 80, R * 0.6, false, shapeData, false, '#00ff88');
    const largeCircle = createCircle(width * 0.8, height * 0.7, R * 1.4, false, shapeData, false, '#8a2be2');

    // Add half circles
    const halfCircle1 = createCircle(width, height, R * 0.8, false, shapeData, true, '#FF6B6B');
    const halfCircle2 = createCircle(width * 0.85, height * 0.4, R * 0.7, false, shapeData, true, '#4ECDC4');
    const halfCircle3 = createCircle(width * 0.5, height * 0.2, R * 0.9, false, shapeData, true, '#45B7D1');

    const yellowWithDots = createRectangleWithInnerCircles(
      300, 500,           // x, y
      220, 70,            // width, height
      6,                  // circleCount
      8,                  // padding (outer + between circles)
      "#FFC94A",          // rectColor (yellow)
      "#000000",          // circleColors (black)
      "bottom",           // align
      false,              // isStatic
      shapeData
    );

    const blueWithDots = createRectangleWithInnerCircles(
      300, 500,           // x, y
      520, 270,            // width, height
      6,                  // circleCount
      8,                  // padding (outer + between circles)
      "beige",          // rectColor (yellow)
      "white",          // circleColors (black)
      "bottom",           // align
      false,              // isStatic
      shapeData
    );

    const sun = createStar(420, 260, 16, 90, 45, "#FF8A00", false, shapeData);
    const star = createStar(200, 140, 8, 40, 18, "#FFD24A", true, shapeData);
    const sun2 = createStar(720, 560, 16, 90, 45, "#FF8A00", false, shapeData);
    const sun3 = createStar(950, 360, 16, 90, 45, "yellow", false, shapeData);


    // Neutral eye, centered gaze
const eye1 = createEye(300, 260, 180, 180, "white", "#2AA7FF", "#111", 1, 0, 0, 0.38, 0.45, "white", 3, false, shapeData);

// Looking up-left, slightly squinted
const eye2 = createEye(520, 260, 160, 70, "#FFF", "#66C08E", "#000", 0.6, -0.7, -0.4, 0.35, 0.5, null, 0, true, shapeData);

    
    Matter.Events.on(render, 'afterRender', () => {
      const ctx = render.context;

      // Draw all circles
      [circle, smallCircle, largeCircle, halfCircle1, halfCircle2, halfCircle3].forEach(circleBody => {
        const data = shapeData.get(circleBody);
        if (data?.type === 'circle') {
          const {x, y} = circleBody.position;
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
          } else if (circleBody === largeCircle) {
            // Purple to yellow gradient
            gradient = ctx.createRadialGradient(0, 0, data.size * 0.2, 0, 0, data.size);
            gradient.addColorStop(0, '#8a2be2');
            gradient.addColorStop(1, '#ffff00');
          } else {
            // Solid color for half circles
            ctx.fillStyle = data.color;
            ctx.beginPath();
            if (data.isHalfCircle) {
              // Draw half circle (semi-circle)
              ctx.arc(0, 0, data.size, 0, Math.PI, true);
            } else {
              // Draw full circle
              ctx.arc(0, 0, data.size, 0, Math.PI * 2);
            }
            ctx.fill();
            ctx.restore();
            return; // Skip the gradient rendering for half circles
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

      // Draw the yellow rectangle with dots
      renderRectangleWithInnerCircles(ctx, yellowWithDots, shapeData);
      renderRectangleWithInnerCircles(ctx, blueWithDots, shapeData);

      renderStar(ctx, sun, shapeData);
      renderStar(ctx, star, shapeData);
      renderStar(ctx, sun2, shapeData);
      renderStar(ctx, sun3, shapeData);

      renderEye(ctx, eye1, shapeData);
      renderEye(ctx, eye2, shapeData);
    });

    // 4) boundaries to keep shapes within the world
    const floor = Bodies.rectangle(width / 2, height - 20, width, 40, {
      isStatic: true,
      render: {fillStyle: "#e8e8e8", },
    });

    // Left wall - positioned exactly at left edge of screen
    const leftWall = Bodies.rectangle(20, height / 2, 40, height, {
      isStatic: true,
      render: {fillStyle: "#e8e8e8", },
    });

    // Right wall - positioned exactly at right edge of screen
    const rightWall = Bodies.rectangle(width - 20, height / 2, 40, height, {
      isStatic: true,
      render: {fillStyle: "#e8e8e8", },
    });

    // Ceiling - positioned at top edge to prevent shapes from going above screen
    const ceiling = Bodies.rectangle(width / 2, 20, width, 40, {
      isStatic: true,
      render: {fillStyle: "#e8e8e8", },
    });

    Composite.add(world, [circle, pinkArch, blueArch, smallCircle, largeCircle, halfCircle1, halfCircle2, halfCircle3, yellowWithDots, floor, leftWall, rightWall, ceiling,blueWithDots, sun, star, eye1, eye2]);

    // 5) basic interactivity (drag with mouse/touch)
    // 5) interactivity (drag) — but don't swallow page scroll
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {stiffness: 0.2, render: {visible: false}},
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
