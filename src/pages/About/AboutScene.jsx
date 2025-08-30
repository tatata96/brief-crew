import React, { useEffect, useRef, useState } from "react";
import Matter, {
  Engine, Render, Runner, World, Bodies, Composite,
  Mouse, MouseConstraint, Body
} from "matter-js";

import {
  createTextComponent, renderTextComponent
} from "../../ui/utils/createShapes4";

export default function AboutScene() {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 400 });
  const [isAnimationStarted, setIsAnimationStarted] = useState(false);

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = Math.max(400, window.innerHeight * 0.5);
      setDimensions({ width, height });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (!containerRef.current || !isAnimationStarted) return;

    // Add a small delay to make the appearance more dramatic
    const startTimer = setTimeout(() => {
      startAnimation();
    }, 300);

    return () => clearTimeout(startTimer);
  }, [dimensions, isAnimationStarted]);

  const startAnimation = () => {
    if (!containerRef.current) return;

    const { width, height } = dimensions;
    
    // Responsive scaling for mobile devices
    const isMobile = width < 768;
    const mobileScale = isMobile ? 0.6 : 1;
    const mobileFontScale = isMobile ? 0.7 : 1;

    const engine = Engine.create({ gravity: { x: 0, y: 0.5 } });
    const world = engine.world;

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
    const runner = Runner.create();
    Runner.run(runner, engine);

    const shapeData = new Map();

    // Create text components that will fall to the About page - using the same ones from Scene.tsx
    const textComponent1 = createTextComponent(
      width * 0.2, height * 0.1, 180 * mobileScale, 80 * mobileScale,
      {
        fill: "#F59E0B",
        outline: "#B45309",
        outlineWidth: 2,
        text: "CREATIVE",
        font: `700 ${28 * mobileFontScale}px Inter, system-ui, -apple-system, sans-serif`,
        textColor: "#B45309",
        rotationRad: -0.1,
      },
      false, shapeData
    );

    const textComponent2 = createTextComponent(
      width * 0.8, height * 0.15, 180 * mobileScale, 80 * mobileScale,
      {
        fill: "#22C55E",
        outline: "#15803D",
        outlineWidth: 2,
        text: "MISFITS",
        font: `700 ${28 * mobileFontScale}px Inter, system-ui, -apple-system, sans-serif`,
        textColor: "#15803D",
        rotationRad: 0.1,
      },
      false, shapeData
    );

    const textComponent3 = createTextComponent(
      width * 0.3, height * 0.2, 200 * mobileScale, 80 * mobileScale,
      {
        fill: "#F9A8D4",
        outline: "#BE185D",
        outlineWidth: 2,
        text: "THINKING",
        font: `700 ${28 * mobileFontScale}px Inter, system-ui, -apple-system, sans-serif`,
        textColor: "#BE185D",
        rotationRad: -0.2,
      },
      false, shapeData
    );

    const textComponent4 = createTextComponent(
      width * 0.7, height * 0.25, 180 * mobileScale, 80 * mobileScale,
      {
        fill: "#C2F261",
        outline: "#059669",
        outlineWidth: 2,
        text: "OUTSIDE",
        font: `700 ${28 * mobileFontScale}px Inter, system-ui, -apple-system, sans-serif`,
        textColor: "#059669",
        rotationRad: 0.15,
      },
      false, shapeData
    );

    const textComponent5 = createTextComponent(
      width * 0.15, height * 0.3, 160 * mobileScale, 80 * mobileScale,
      {
        fill: "#93C5FD",
        outline: "#1E40AF",
        outlineWidth: 2,
        text: "THE BOX",
        font: `700 ${28 * mobileFontScale}px Inter, system-ui, -apple-system, sans-serif`,
        textColor: "#1E40AF",
        rotationRad: -0.3,
      },
      false, shapeData
    );

    const textComponent6 = createTextComponent(
      width * 0.45, height * 0.35, 180 * mobileScale, 80 * mobileScale,
      {
        fill: "#FACC15",
        outline: "#A16207",
        outlineWidth: 2,
        text: "TINKERING",
        font: `700 ${28 * mobileFontScale}px Inter, system-ui, -apple-system, sans-serif`,
        textColor: "#A16207",
        rotationRad: 0.25,
      },
      false, shapeData
    );

    const textComponent7 = createTextComponent(
      width * 0.45, height * 0.4, 160 * mobileScale, 80 * mobileScale,
      {
        fill: "#FFEE70",
        outline: "#A16207",
        outlineWidth: 2,
        text: "DREAMING",
        font: `700 ${28 * mobileFontScale}px Inter, system-ui, -apple-system, sans-serif`,
        textColor: "#A16207",
        rotationRad: -0.1,
      },
      false, shapeData
    );

    const textComponent8 = createTextComponent(
      width * 0.75, height * 0.45, 200 * mobileScale, 80 * mobileScale,
      {
        fill: "#60A5FA",
        outline: "#1E40AF",
        outlineWidth: 2,
        text: "EXPERIMENTING",
        font: `700 ${28 * mobileFontScale}px Inter, system-ui, -apple-system, sans-serif`,
        textColor: "#1E40AF",
        rotationRad: 0.2,
      },
      false, shapeData
    );

    // Make all text components fall from the top
    const fallables = [
      textComponent1, textComponent2, textComponent3, textComponent4,
      textComponent5, textComponent6, textComponent7, textComponent8
    ];

    const dropFromTop = (bodies, gap = 120) => {
      bodies.forEach((b, i) => {
        // Stack them above the screen with slight random rotation
        const y = -(i * gap + 100 + Math.random() * 40);
        Body.setPosition(b, { x: b.position.x, y });
        Body.setAngle(b, (Math.random() - 0.5) * 0.4);
        // Give a tiny downward nudge so they separate
        Body.setVelocity(b, { x: (Math.random() - 0.5) * 0.3, y: 1.2 + Math.random() * 0.6 });
        Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.015);
      });
    };
    dropFromTop(fallables);

    // Boundaries (no ceiling so bodies can enter from above)
    const floor = Bodies.rectangle(width / 2, height - 20, width, 40, { 
      isStatic: true, 
      render: { visible: false } 
    });
    const leftWall = Bodies.rectangle(20, height / 2, 40, height, { 
      isStatic: true, 
      render: { visible: false } 
    });
    const rightWall = Bodies.rectangle(width - 20, height / 2, 40, height, { 
      isStatic: true, 
      render: { visible: false } 
    });

    Composite.add(world, [
      floor, leftWall, rightWall,
      ...fallables,
    ]);

    // Mouse drag
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.25, render: { visible: false } },
    });
    Composite.add(world, mouseConstraint);

    // Let wheel/touch scroll the page
    const m = mouse;
    if (m.element && m.mousewheel) {
      m.element.removeEventListener("mousewheel", m.mousewheel);
      m.element.removeEventListener("DOMMouseScroll", m.mousewheel);
    }
    if (m.element && m.touchmove) m.element.removeEventListener("touchmove", m.touchmove);

    // Custom render pass
    Matter.Events.on(render, "afterRender", () => {
      const ctx = render.context;

      // Render all text components
      renderTextComponent(ctx, textComponent1, shapeData);
      renderTextComponent(ctx, textComponent2, shapeData);
      renderTextComponent(ctx, textComponent3, shapeData);
      renderTextComponent(ctx, textComponent4, shapeData);
      renderTextComponent(ctx, textComponent5, shapeData);
      renderTextComponent(ctx, textComponent6, shapeData);
      renderTextComponent(ctx, textComponent7, shapeData);
      renderTextComponent(ctx, textComponent8, shapeData);
    });

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      World.clear(world, false);
      Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    };
  };

  // Start animation when component mounts
  useEffect(() => {
    setIsAnimationStarted(true);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: `${dimensions.height}px`,
        margin: "0 auto",
        overflow: "hidden",
      }}
    />
  );
}
