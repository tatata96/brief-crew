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
} from "matter-js";

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

    // 3) first object: a circle
    const circle = Bodies.circle(width * 0.5, 60, 60, {
      restitution: 0.6,
      friction: 0.2,
      render: { fillStyle: "#ff8a00" },
    });

    // 4) a floor so it can land
    const floor = Bodies.rectangle(width / 2, height - 20, width, 40, {
      isStatic: true,
      render: { fillStyle: "#e8e8e8", },
    });

    Composite.add(world, [circle, floor]);

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
