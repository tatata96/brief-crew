import React, { useEffect, useRef, useState } from "react";
import Matter, {
  Engine, Render, Runner, World, Bodies, Composite,
  Mouse, MouseConstraint, Body
} from "matter-js";
import {createMartiniGlass, renderMartiniGlass} from "../../ui/utils/createShapes";


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
    
    // Responsive scaling for mobile devices
    const isMobile = width < 768;
    const mobileScale = isMobile ? 0.6 : 1;
    const mobileFontScale = isMobile ? 0.7 : 1;

    const engine = Engine.create({ gravity: { x: 0, y: 0 } });
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

    const shapeData: Map<Body, any> = new Map();

    const martiniHeight = 120 * mobileScale;
    const martiniWidth = martiniHeight * 0.6;

    // Create two identical martini glasses on left and right sides
    const leftMartini = createMartiniGlass(
      width * 0.2, // left side
      height * 0.6,  // center vertically
      400 * mobileScale, // height
      { 
        bowlColor: "#BFD5E2", 
        stemColor: "#BFD5E2", 
        baseColor: "#BFD5E2", 
        outlineColor: null 
      },
      true, // static - won't move
      shapeData
    );

    const rightMartini = createMartiniGlass(
      width * 0.80, // right side
      height * 0.6,  // center vertically
      400 * mobileScale, // height
      { 
        bowlColor: "#BFD5E2", 
        stemColor: "#BFD5E2", 
        baseColor: "#BFD5E2", 
        outlineColor: null 
      },
      true, // static - won't move
      shapeData
    );

    // Static overlay text (centered)
    const briefCrewText = Bodies.rectangle(width * 0.5, height * 0.5, width * 0.6, height * 0.4, {
      isStatic: true, 
      render: { visible: false },
    });
    
    const baseFontSize = width * 0.08 * mobileFontScale;
    const lineHeight = baseFontSize * 1.2;
    
    shapeData.set(briefCrewText, {
      type: "text",
      text: "IT IS \nALL\nABOUT",
      font: `900 ${baseFontSize}px Trocchi, system-ui, -apple-system, sans-serif`,
      textColor: "#000000",
      textAlign: "center",
      lineHeight,
    });

    // Add all bodies to world
    Composite.add(world, [
      leftMartini,
      rightMartini,
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

      // overlay text (centered)
      const textData = shapeData.get(briefCrewText);
      if (textData?.type === "text") {
        ctx.save();
        ctx.fillStyle = textData.textColor;
        ctx.font = textData.font;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const lines = textData.text.split("\n");
        const textX = width * 0.5;
        const textY = height * 0.5;
        lines.forEach((line: string, i: number) => {
          const offset = (i - (lines.length - 1) / 2) * textData.lineHeight;
          ctx.fillText(line, textX, textY + offset);
        });
        ctx.restore();
      }

      // Render martini glasses
      renderMartiniGlass(ctx, leftMartini, shapeData);
      renderMartiniGlass(ctx, rightMartini, shapeData);
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
        border: "0px solid #eee",
      }}
    />
  );
}
