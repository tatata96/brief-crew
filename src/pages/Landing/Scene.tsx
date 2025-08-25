import React, { useEffect, useRef, useState } from "react";
import Matter, {
  Engine, Render, Runner, World, Bodies, Composite,
  Mouse, MouseConstraint, Body
} from "matter-js";

import {
  createDot, renderDot,
  createBanner, renderBanner,
  createBurst, renderBurst,
  createPill, renderPill,
  createParallelogram, renderParallelogram,
  createVLabel, renderVLabel,
  createQuarterPie, renderQuarterPie,
  createThickC, renderThickC,
  createTextComponent, renderTextComponent,
  ShapeStore
} from "../../ui/utils/createShapes";
import { createBagel, renderBagel } from "../../ui/utils/createShapes3";

export default function Scene() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = Math.max(600, window.innerHeight * 0.8);
      setDimensions({ width, height });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const { width, height } = dimensions;

    const engine = Engine.create({ gravity: { x: 0, y: 0.5 } });
    const world = engine.world;

    const render = Render.create({
      element: containerRef.current,
      engine,
      options: {
        width,
        height,
        background: "#FFFFFF",
        wireframes: false,
        pixelRatio: window.devicePixelRatio,
      },
    });
    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    const shapeData: ShapeStore = new Map();

    // ---- create all shapes at their target X positions (Y will be moved above) ----
    const redDot = createDot(width * 0.55, height * 0.2, 90, { fill: "#D7261E", textColor: "#8B0000" }, false, shapeData);

    const banner = createBanner(width * 0.74, height * 0.15, 60, 80, {
      fill: "#F59E0B",
      text: "",
      font: "800 32px Inter, system-ui, -apple-system, sans-serif",
      textColor: "#B45309",
      notch: 28,
    }, false, shapeData);

    const burst = createBurst(width * 0.68, height * 0.35, {
      fill: "#22C55E",
      spikes: 12, innerR: 66, outerR: 46,
      text: "",
      font: "900 24px Inter, system-ui, -apple-system, sans-serif",
      textColor: "#15803D",
    }, false, shapeData);

    const pill = createPill(width * 0.83, height * 0.45, 60, 30, {
      fill: "#F9A8D4",
      text: "",
      font: "900 28px Inter, system-ui, -apple-system, sans-serif",
      textColor: "#BE185D",
      rotationRad: -0.45,
    }, false, shapeData);


    const pill2 = createPill(width * 0.83, height * 0.45, 60, 80, {
      fill: "#BEA7E5",
      text: "",
      font: "900 28px Inter, system-ui, -apple-system, sans-serif",
      textColor: "#BE185D",
      rotationRad: -0.45,
    }, false, shapeData);

    const details = createParallelogram(width * 0.3, height * 0.5, 180, 140, {
      fill: "#A7F3D0",
      text: "",
      font: "900 28px Inter, system-ui, -apple-system, sans-serif",
      textColor: "#059669",
      skew: 0.95,
    }, false, shapeData);

    const vlabel = createVLabel(width * 0.48, height * 0.4, 90, 260, {
      fill: "#93C5FD",
      text: "",
      font: "900 24px Inter, system-ui, -apple-system, sans-serif",
      textColor: "#1E40AF",
    }, false, shapeData);

    const production = createQuarterPie(width * 0.64, height * 0.55, 160, {
      fill: "#FACC15",
      text: "",
      font: "900 26px Inter, system-ui, -apple-system, sans-serif",
      textColor: "#A16207",
      rotationRad: Math.PI,
    }, false, shapeData);

    const cShape = createThickC(width * 0.82, height * 0.65, {
      fill: "#FFEE70",
      outerR: 70, innerR: 20,
      startRad: -Math.PI * 0.15, endRad: Math.PI * 1.15,
    }, false, shapeData);

    const blueBagel = createBagel(
      width * 0.28, 600, 50, 90,
      {
        fillColor: "#60A5FA", // blue
        thickness: 70,
        text: "",
        font: "700 42px Inter",
        textColor: "#1E40AF", // darker blue
        textDirection: "cw",
        startAngleRad: Math.PI / 2,
      },
      false, shapeData
    );

    const textComponent = createTextComponent(
      width * 0.75, height * 0.6, 200, 80,
      {
        fill: "white",
        outline: "black",
        outlineWidth: 2,
        text: "PRODUCTION",
        font: "700 28px Inter, system-ui, -apple-system, sans-serif",
        textColor: "black",
        rotationRad: -0.2,
      },
      false, shapeData
    );

    const textComponent2 = createTextComponent(
      width * 0.75, height * 0.6, 180, 80,
      {
        fill: "white",
        outline: "black",
        outlineWidth: 2,
        text: "CATERING",
        font: "700 28px Inter, system-ui, -apple-system, sans-serif",
        textColor: "black",
        rotationRad: -0.2,
      },
      false, shapeData
    );

    const textComponent3 = createTextComponent(
      width * 0.95, height * 0.6, 180, 80,
      {
        fill: "white",
        outline: "black",
        outlineWidth: 2,
        text: "MEMORIES",
        font: "700 28px Inter, system-ui, -apple-system, sans-serif",
        textColor: "black",
        rotationRad: -0.2,
      },
      false, shapeData
    );

    const textComponent4 = createTextComponent(
      width * 0.45, height * 0.6, 180, 80,
      {
        fill: "white",
        outline: "black",
        outlineWidth: 2,
        text: "CONCEPTS",
        font: "700 28px Inter, system-ui, -apple-system, sans-serif",
        textColor: "black",
        rotationRad: -0.2,
      },
      false, shapeData
    );

    const textComponent5 = createTextComponent(
      width * 0.55, height * 0.6, 180, 80,
      {
        fill: "white",
        outline: "black",
        outlineWidth: 2,
        text: "MOOD",
        font: "700 28px Inter, system-ui, -apple-system, sans-serif",
        textColor: "black",
        rotationRad: -0.2,
      },
      false, shapeData
    );

    const textComponent6 = createTextComponent(
      width * 0.44, height * 0.6, 210, 80,
      {
        fill: "white",
        outline: "black",
        outlineWidth: 2,
        text: "IMPRESSIONS",
        font: "700 28px Inter, system-ui, -apple-system, sans-serif",
        textColor: "black",
        rotationRad: -0.2,
      },
      false, shapeData
    );

    const textComponent7 = createTextComponent(
      width * 0.89, height * 0.6, 210, 80,
      {
        fill: "white",
        outline: "black",
        outlineWidth: 2,
        text: "ATMOSPHERE",
        font: "700 28px Inter, system-ui, -apple-system, sans-serif",
        textColor: "black",
        rotationRad: -0.2,
      },
      false, shapeData
    );
    // static overlay text (kept static; not a falling shape)
    const briefCrewText = Bodies.rectangle(width * 0.15, height * 0.3, width * 0.3, height * 0.4, {
      isStatic: true, render: { visible: false },
    });
    const baseFontSize =  width * 0.1;
    console.log(baseFontSize);
    const lineHeight = baseFontSize * 1.1;
    shapeData.set(briefCrewText, {
      type: "text",
      text: "BRIEF\nCREW",
      font: `900 ${baseFontSize}px Inter, system-ui, -apple-system, sans-serif`,
      textColor: "#000000",
      lineHeight,
    });

    // ---- make everything fall from the top ----
    const fallables = [redDot, banner, burst, pill, details, vlabel, production, cShape, textComponent,blueBagel,textComponent2,textComponent3,textComponent4,textComponent5,pill2,textComponent6,textComponent7];

    const dropFromTop = (bodies: Body[], gap = 140) => {
      bodies.forEach((b, i) => {
        // stack them above the screen with slight random rotation
        const y = - (i * gap + 120 + Math.random() * 60);
        Body.setPosition(b, { x: b.position.x, y });
        Body.setAngle(b, (Math.random() - 0.5) * 0.6);
        // give a tiny downward nudge so they separate
        Body.setVelocity(b, { x: (Math.random() - 0.5) * 0.5, y: 1.5 + Math.random() * 0.8 });
        Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.02);
      });
    };
    dropFromTop(fallables);

    // ---- boundaries (no ceiling so bodies can enter from above) ----
    const floor   = Bodies.rectangle(width / 2, height - 20, width, 40, { isStatic: true, render: { visible: false } });
    const leftWall  = Bodies.rectangle(20, height / 2, 40, height, { isStatic: true, render: { visible: false } });
    const rightWall = Bodies.rectangle(width - 20, height / 2, 40, height, { isStatic: true, render: { visible: false } });

    Composite.add(world, [
      floor, leftWall, rightWall,
      ...fallables,
      briefCrewText,
    ]);

    // mouse drag
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.25, render: { visible: false } },
    });
    Composite.add(world, mouseConstraint);

    // let wheel/touch scroll the page
    const m: any = mouse;
    if (m.element && m.mousewheel) {
      m.element.removeEventListener("mousewheel", m.mousewheel);
      m.element.removeEventListener("DOMMouseScroll", m.mousewheel);
    }
    if (m.element && m.touchmove) m.element.removeEventListener("touchmove", m.touchmove);

    // custom render pass
    Matter.Events.on(render, "afterRender", () => {
      const ctx = render.context;

      // overlay text
      const textData = shapeData.get(briefCrewText);
      if (textData?.type === "text") {
        ctx.save();
        ctx.fillStyle = textData.textColor;
        ctx.font = textData.font;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        const lines = textData.text.split("\n");
        const textX = width * 0.05;
        const textY = height * 0.2;
        lines.forEach((line: string, i: number) => {
          ctx.fillText(line, textX, textY + i * textData.lineHeight);
        });
        ctx.restore();
      }

      // shapes
      renderDot(ctx, redDot, shapeData);
      renderTextComponent(ctx, textComponent4, shapeData);
      renderTextComponent(ctx, textComponent5, shapeData);
      renderBanner(ctx, banner, shapeData);
      renderBurst(ctx, burst, shapeData);
      renderPill(ctx, pill, shapeData);
      renderTextComponent(ctx, textComponent, shapeData);
      renderTextComponent(ctx, textComponent2, shapeData);
      renderTextComponent(ctx, textComponent3, shapeData);
      renderPill(ctx, pill2, shapeData);
      renderParallelogram(ctx, details, shapeData);
      renderVLabel(ctx, vlabel, shapeData);
      renderQuarterPie(ctx, production, shapeData);
      renderThickC(ctx, cShape, shapeData);
      renderTextComponent(ctx, textComponent6, shapeData);
      renderTextComponent(ctx, textComponent7, shapeData);
      renderBagel(ctx, blueBagel, shapeData);
   

    });

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      World.clear(world, false);
      Engine.clear(engine);
      render.canvas.remove();
      (render as any).textures = {};
    };
  }, [dimensions]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: `${dimensions.height}px`,
        margin: "0 auto",
        border: "1px solid #eee",
      }}
    />
  );
}
