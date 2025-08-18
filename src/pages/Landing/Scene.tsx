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
import {createCircle, createArch, renderArch, createRectangleWithInnerCircles, renderRectangleWithInnerCircles, createStar, renderStar, createEye, renderEye, createMartiniGlass, renderMartiniGlass, createOliveStick, renderOliveStick, createCameraFront, renderCameraFront, createExclamationMark, renderExclamationMark, createSparkStar, renderSparkStar} from "../../ui/utils/createShapes";

export default function Scene() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Color palette - 8 cohesive colors
  const colors = {
    primary:  "#C7D2FE", // pastel indigo
    secondary:"#A7F3D0", // pastel emerald (mint)
    accent:   "#FDE68A", // pastel amber
    warm:     "#FECACA", // pastel red (rose)
    cool:     "#A5F3FC", // pastel cyan
    neutral:  "#E5E7EB", // pastel gray
    light:    "#F9FAFB", // near-white
    dark:     "#94A3B8", // soft slate (muted “dark”)
  };

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
    const circle = createCircle(width * 0.5, R + 20, R, false, shapeData, false, colors.accent);

    // Add more circles with varying sizes and colors
    const smallCircle = createCircle(width * 0.2, 80, R * 0.6, false, shapeData, false, colors.secondary);

    // Add half circles
    const halfCircle1 = createCircle(width, height, R * 0.8, false, shapeData, true, colors.warm);

    const yellowWithDots = createRectangleWithInnerCircles(
      300, 500,           // x, y
      220, 70,            // width, height
      6,                  // circleCount
      8,                  // padding (outer + between circles)
      colors.accent,      // rectColor (amber)
      colors.dark,        // circleColors (dark gray)
      "bottom",           // align
      false,              // isStatic
      shapeData
    );

    const sun = createStar(420, 260, 16, 90, 45, colors.accent, false, shapeData);
    const star = createStar(200, 140, 8, 40, 18, colors.primary, true, shapeData);
    const sun2 = createStar(720, 560, 16, 90, 45, colors.accent, false, shapeData);
    const sun3 = createStar(950, 360, 16, 90, 45, colors.accent, false, shapeData);

    const glass = createMartiniGlass(
      500, 400,              // x, y
      460,                   // overall height
      { bowlColor: colors.warm, stemColor: colors.warm, baseColor: colors.warm, outlineColor: null },
      false,                 // isStatic
      shapeData
    );

    const skewer = createOliveStick(520, 340, {
      count: 3,
      oliveR: 62,
      stickMargin: 120, 
      spacing: 150,
      oliveColor: colors.secondary,
      pimentoColor: colors.warm,
      rodColor: colors.neutral,
      ballColor: colors.neutral,
    }, false, shapeData);

    const cam = createCameraFront(
      420, 280,       // x, y
      360, 210,       // width, height
      {
        bodyColor: colors.warm,
        topColor: colors.cool,
        lensRingColors: [colors.light, colors.neutral, colors.dark, colors.dark],
        labelText: "FT",
      },
      false,
      shapeData
    );

    const bang = createExclamationMark(
      300, 200,         // x, y
      280,              // total height
      { color:  colors.neutral, angleRad: -0.1 },  // options
      false,
      shapeData
    );

    const spark = createSparkStar(
      400, 280,            // x, y
      180, 220,            // width, height (controls long/skinny look)
      {
        color: "#FF4E1A",
        innerRatio: 0.18,      // sharper pinch
        curveMix: 0.6,
        curveAngle: Math.PI/10,// ~18°
        rotationRad: 0,        // rotate if you want
      },
      false,
      shapeData
    );

    Matter.Events.on(render, 'afterRender', () => {
      const ctx = render.context;

      // Draw all circles
      [circle, smallCircle, halfCircle1].forEach(circleBody => {
        const data = shapeData.get(circleBody);
        if (data?.type === 'circle') {
          const {x, y} = circleBody.position;
          const angle = circleBody.angle;

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angle);

          // Create different gradients for each circle using palette colors
          let gradient;
          if (circleBody === circle) {
            // Amber to warm gradient
            gradient = ctx.createRadialGradient(0, 0, data.size * 0.2, 0, 0, data.size);
            gradient.addColorStop(0, colors.accent);
            gradient.addColorStop(1, colors.warm);
          } else if (circleBody === smallCircle) {
            // Secondary to cool gradient
            gradient = ctx.createRadialGradient(0, 0, data.size * 0.2, 0, 0, data.size);
            gradient.addColorStop(0, colors.secondary);
            gradient.addColorStop(1, colors.cool);
          }  else {
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

      // Draw the yellow rectangle with dots
      renderRectangleWithInnerCircles(ctx, yellowWithDots, shapeData);

      renderStar(ctx, sun, shapeData);
      renderStar(ctx, star, shapeData);
      renderStar(ctx, sun2, shapeData);
      renderStar(ctx, sun3, shapeData);

      renderMartiniGlass(ctx, glass, shapeData);

      renderOliveStick(ctx, skewer, shapeData,);

      renderCameraFront(ctx, cam, shapeData);

      renderExclamationMark(ctx, bang, shapeData);

      renderSparkStar(ctx, spark, shapeData);

    });

    // 4) boundaries to keep shapes within the world
    const floor = Bodies.rectangle(width / 2, height - 20, width, 40, {
      isStatic: true,
      render: {fillStyle: colors.light, },
    });

    // Left wall - positioned exactly at left edge of screen
    const leftWall = Bodies.rectangle(20, height / 2, 40, height, {
      isStatic: true,
      render: {fillStyle: colors.light, },
    });

    // Right wall - positioned exactly at right edge of screen
    const rightWall = Bodies.rectangle(width - 20, height / 2, 40, height, {
      isStatic: true,
      render: {fillStyle: colors.light, },
    });

    // Ceiling - positioned at top edge to prevent shapes from going above screen
    const ceiling = Bodies.rectangle(width / 2, 20, width, 40, {
      isStatic: true,
      render: {fillStyle: colors.light, },
    });

    Composite.add(world, [circle, smallCircle, halfCircle1,  yellowWithDots, floor, leftWall, rightWall, ceiling, sun, star,  glass, skewer, cam, bang, spark]);

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
