// Scene.tsx (imports)
import React, { useEffect, useRef } from "react";
import Matter, { Engine, Render, Runner, World, Bodies, Composite, Mouse, MouseConstraint, Body } from "matter-js";
import {createBagel, renderBagel, createRibbon, renderRibbon} from "../../ui/utils/createShapes3";

export default function Scene() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const colors = {
    primary:  "#C7D2FE",
    secondary:"#A7F3D0",
    accent:   "#FDE68A",
    warm:     "#FECACA",
    cool:     "#A5F3FC",
    neutral:  "#E5E7EB",
    light:    "#F9FAFB",
    dark:     "#94A3B8",
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight - 80;

    const engine = Engine.create({ gravity: { x: 0, y: 1 } });
    const world = engine.world;

    const render = Render.create({
      element: containerRef.current,
      engine,
      options: { width, height, background: "#ffffff", wireframes: false, pixelRatio: window.devicePixelRatio },
    });
    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    const shapeData = new Map<Body, any>();

    // --- BAGELS & RIBBON (spawn from top) ---
    const blueBagel = createBagel(
      width * 0.58, 100, 260, 230,
      {
        fillColor: "#60A5FA", // blue
        thickness: 70,
        text: "CHARLEMAGNE REGULAR",
        font: "700 42px Inter",
        textColor: "#1E40AF", // darker blue
        textDirection: "cw",
        startAngleRad: Math.PI / 2,
      },
      false, shapeData
    );

    const orangeBagel = createBagel(
      width * 0.45, 150, 220, 220,
      {
        fillColor: "#FDB022",
        thickness: 70,
        text: "Cooper Black",
        font: "900 48px Inter",
        textColor: "#B91C1C",
        textDirection: "cw",
        startAngleRad: -Math.PI / 6,
      },
      false, shapeData
    );

    const rightTallBagel = createBagel(
      width * 0.84, 200, 200, 260,
      {
        fillColor: "#FB923C",
        thickness: 70,
        text: "CUBANO REGULAR",
        font: "800 40px Inter",
        textColor: "#0B1220",
        textDirection: "cw",
        startAngleRad: Math.PI / 2,
      },
      false, shapeData
    );

    const greyOvalBand = createBagel(
      width * 0.40, 250, 330, 120,
      {
        fillColor: "#E5E7EB",
        thickness: 55,
        text: "Filson Soft Book + Abril Tilt",
        font: "700 34px Inter",
        textColor: "#A11",
        textDirection: "cw",
        startAngleRad: Math.PI * 0.85,
      },
      false, shapeData
    );

    const pinkRibbon = createRibbon(
      width * 0.62, 300, 420, 90,
      {
        fillColor: "#F9A8D4",
        text: "Rigid Sq",
        font: "700 36px Inter",
        textColor: "#0B1220",
      },
      false, shapeData
    );
    Body.setAngle(pinkRibbon, -Math.PI / 6);

    // boundaries
    const floor = Bodies.rectangle(width / 2, height - 20, width, 40, { isStatic: true, render: { fillStyle: colors.light } });
    const leftWall  = Bodies.rectangle(20, height / 2, 40, height, { isStatic: true, render: { fillStyle: colors.light } });
    const rightWall = Bodies.rectangle(width - 20, height / 2, 40, height, { isStatic: true, render: { fillStyle: colors.light } });
    const ceiling   = Bodies.rectangle(width / 2, 20, width, 40, { isStatic: true, render: { fillStyle: colors.light } });

    Composite.add(world, [
      floor, leftWall, rightWall, ceiling,
      blueBagel, orangeBagel, rightTallBagel, greyOvalBand, pinkRibbon
    ]);

    // drag
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse, constraint: { stiffness: 0.2, render: { visible: false } },
    });
    Composite.add(world, mouseConstraint);
    const m: any = mouse;
    if (m.element && m.mousewheel) {
      m.element.removeEventListener("mousewheel", m.mousewheel);
      m.element.removeEventListener("DOMMouseScroll", m.mousewheel);
    }
    if (m.element && m.touchmove) m.element.removeEventListener("touchmove", m.touchmove);

    // custom renderers
    Matter.Events.on(render, "afterRender", () => {
      const ctx = render.context;
      renderBagel(ctx, blueBagel, shapeData);
      renderBagel(ctx, orangeBagel, shapeData);
      renderBagel(ctx, rightTallBagel, shapeData);
      renderBagel(ctx, greyOvalBand, shapeData);
      renderRibbon(ctx, pinkRibbon, shapeData);
    });

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      World.clear(world, false);
      Engine.clear(engine);
      render.canvas.remove();
      (render as any).textures = {};
    };
  }, []);

  return <div ref={containerRef} />;
}
