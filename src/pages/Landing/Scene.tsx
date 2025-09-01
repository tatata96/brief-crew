import React, {useEffect, useRef, useState} from "react";
import Matter, {
  Engine, Render, Runner, World, Bodies, Composite,
  Mouse, MouseConstraint, Body
} from "matter-js";
import {createMartiniGlass, renderMartiniGlass, createCogwheel, renderCogwheel, createOliveStick, renderOliveStick} from "../../ui/utils/createShapes";
import {createStar, renderStar} from "../../ui/utils/createShapes2";
import {  createVLabel, renderVLabel, createBurst, renderBurst}from "../../ui/utils/createShapes4";  

let colors = [
  "#FFD601",
  "#FF8CF4",
  "#EE4A37",
  "#8A0F52",
  "#0F3DD4",
  "#0C7114",
  "#88E1FF",
  "#d41b1b"
];

export default function Scene() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({width: 1000, height: 600});
  const [showCollisionBodies, setShowCollisionBodies] = useState(false); // Debug flag

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = Math.max(600, window.innerHeight * 0.8);
      setDimensions({width, height});
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const {width, height} = dimensions;

    // Responsive scaling for mobile devices
    const isMobile = width < 768;
    const mobileScale = isMobile ? 0.6 : 1;
    const mobileFontScale = isMobile ? 0.7 : 1;

    const engine = Engine.create({gravity: {x: 0, y: 0.5}});
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

    // Create two identical martini glasses on left and right sides
    const leftMartini = createMartiniGlass(
      width * 0.2, // left side
      height * 0.6,  // center vertically
      400 * mobileScale, // height
      {
        bowlColor: "#BFD5E2",
        stemColor: "#BFD5E2",
        baseColor: "#BFD5E2",
        outlineColor: null,
        showCollision: showCollisionBodies
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
        outlineColor: null,
        showCollision: showCollisionBodies
      },
      true, // static - won't move
      shapeData
    );

       

    // Create multiple falling objects for better collision testing
    const skewer = createOliveStick(520, 340, {
      count: 3,
      oliveR: 22,
      stickMargin: 80,
      spacing: 50,
      oliveColor: "#8CAE68",
      pimentoColor: "#FECACA",
      rodColor: "#E5E7EB",
      ballColor: "#E5E7EB",
    }, false, shapeData);

    /*/ Create some additional falling objects
    const cogwheel1 = createCogwheel(300, 200, 40, {
      fillColor: colors[0],
      pointCount: 8,
      innerRadius: 15,
      outerRadius: 20,
    }, false, shapeData);

    const cogwheel2 = createCogwheel(700, 150, 35, {
      fillColor: colors[1],
      pointCount: 6,
      innerRadius: 12,
      outerRadius: 17,
    }, false, shapeData);

    */
    // Create 20 varied stars and bursts with different properties
    const stars: Body[] = [];
    
    // Create 12 stars with varying parameters

    // Create 8 bursts with varying parameters
    for (let i = 0; i < 18; i++) {
      const innerR = 20 + Math.random() * 30; // 60-100 radius
      const outerR = innerR * 0.6 + Math.random() * 0.4; // 60-100% of inner radius
      const spikes = 6 + Math.random() * 0.4; // 6-16 spikes (max 16)
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const burst = createBurst(
        620, 260, // Initial position (will be set later)
        {
          fill: color,
          spikes: spikes,
          innerR: innerR,
          outerR: outerR,
          text: "",
          font: `900 ${24 * mobileFontScale}px Inter, system-ui, -apple-system, sans-serif`,
          textColor: color,
        },
        false,
        shapeData
      );
      stars.push(burst);
    }

    // Create a simple test star to debug physics
    const testStar = Bodies.circle(100, 100, 15, {
      isStatic: false,
      restitution: 0.8,
      friction: 0.1,
      density: 0.001,
      render: {visible: false},
    });
    shapeData.set(testStar, {
      type: "testStar",
      x: 100,
      y: 100,
      size: 30,
      options: {fillColor: "#FF0000", pointCount: 5, innerRadius: 10, outerRadius: 15}
    });


      const burst = createBurst(width * 0.68, height * 0.35, {
          fill: "#22C55E",
          spikes: 12, innerR: 66 * mobileScale, outerR: 46 * mobileScale,
          text: "",
          font: `900 ${24 * mobileFontScale}px Inter, system-ui, -apple-system, sans-serif`,
          textColor: "#15803D",
        }, false, shapeData);


    // Static overlay text (centered)
    const briefCrewText = Bodies.rectangle(width * 0.5, height * 0.5, width * 0.6, height * 0.4, {
      isStatic: true,
      render: {visible: false},
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

    // Combine all falling shapes
    const allFallingShapes = [...stars, testStar,skewer, burst];

    // Make shapes fall from above the screen with better distribution
    const dropFromTop = (bodies: Body[], gap = 120) => {
      bodies.forEach((b, i) => {
        // Distribute objects across the screen width and above
        const x = width * 0.1 + (i * 0.8 * width / bodies.length) + (Math.random() - 0.5) * 100;
        const y = - (i * gap + 100 + Math.random() * 80);

        Body.setPosition(b, {x, y});
        Body.setAngle(b, (Math.random() - 0.5) * Math.PI); // Full rotation range

        // Add random initial velocity for more dynamic movement
        Body.setVelocity(b, {
          x: (Math.random() - 0.5) * 3,
          y: 2 + Math.random() * 2
        });

        // Add some angular velocity for spinning
        Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.1);

        // Debug logging for stars
        const bodyData = shapeData.get(b);
        if (bodyData?.type === 'star') {
          console.log(`Star ${i + 1} positioned at:`, {x, y});
          console.log(`Star ${i + 1} initial velocity:`, {x: (Math.random() - 0.5) * 3, y: 2 + Math.random() * 2});
        }
      });
    };
    dropFromTop(allFallingShapes);

    // Force stars to have stronger initial movement
    [skewer, ...stars].forEach((star, i) => {
      Body.setVelocity(star, {x: 0, y: 5}); // Strong downward velocity
      console.log(`Star ${i + 1} forced velocity:`, star.velocity);
    });

    // Debug: Log all bodies in the world
    console.log('All falling shapes:', allFallingShapes);
    console.log('Stars created:', stars);

    // Add boundaries (no ceiling so bodies can enter from above)
    const floor = Bodies.rectangle(width / 2, height - 20, width, 40, {isStatic: true, render: {visible: false}});
    const leftWall = Bodies.rectangle(20, height / 2, 40, height, {isStatic: true, render: {visible: false}});
    const rightWall = Bodies.rectangle(width - 20, height / 2, 40, height, {isStatic: true, render: {visible: false}});

    // Add all bodies to world
    Composite.add(world, [
      floor, leftWall, rightWall,
      leftMartini,
      rightMartini,

      //  briefCrewText,
      ...allFallingShapes,
    ]);

    // Debug: Check if stars are actually in the world
    console.log('World bodies count:', world.bodies.length);
    console.log('Stars in world:', world.bodies.filter(b => {
      const data = shapeData.get(b);
      return data?.type === 'star';
    }));

    // Debug: Check star properties
    stars.forEach((star, i) => {
      console.log(`Star ${i + 1} properties:`, {
        isStatic: star.isStatic,
        position: star.position,
        velocity: star.velocity,
        mass: star.mass,
        inverseMass: star.inverseMass
      });

      // Force stars to be non-static and give them mass
      if (star.isStatic) {
        console.log(`Warning: Star ${i + 1} is static!`);
        Body.setStatic(star, false);
      }
    });

    // mouse drag
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {stiffness: 0.25, render: {visible: false}},
    });
    Composite.add(world, mouseConstraint);

    // Add collision detection for debugging
    Matter.Events.on(engine, 'collisionStart', (event) => {
      const pairs = event.pairs;
      pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        /*/ Check if collision involves a martini glass
        const leftGlassData = shapeData.get(leftMartini);
        const rightGlassData = shapeData.get(rightMartini);

        if ((bodyA === leftMartini || bodyB === leftMartini) ||
          (bodyA === rightMartini || bodyB === rightMartini)) {
          console.log('Collision with martini glass detected!', {bodyA, bodyB});
        }
          */
      });
    });

    // Add respawn system for objects that fall off screen
    Matter.Events.on(engine, 'afterUpdate', () => {
      allFallingShapes.forEach((body) => {
        // If object falls below the screen, respawn it at the top
        if (body.position.y > height + 100) {
          const x = Math.random() * width;
          const y = -50 - Math.random() * 100;

          Body.setPosition(body, {x, y});
          Body.setVelocity(body, {
            x: (Math.random() - 0.5) * 2,
            y: 1 + Math.random() * 2
          });
          Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.05);
        }
      });
    });

    // Debug: Force stars to move every few frames
    let frameCount = 0;
    Matter.Events.on(engine, 'afterUpdate', () => {
      frameCount++;
      if (frameCount % 60 === 0) { // Every 60 frames (about 1 second)
        stars.forEach((star, i) => {
          if (star.isStatic) {
            console.log(`Forcing star ${i + 1} to be non-static`);
            Body.setStatic(star, false);
          }
          // Give stars a small push to ensure they're moving
          Body.setVelocity(star, {
            x: star.velocity.x + (Math.random() - 0.5) * 0.1,
            y: star.velocity.y + 0.1
          });
        });

        // Debug test star
        console.log('Test star position:', testStar.position);
        console.log('Test star velocity:', testStar.velocity);
        console.log('Test star isStatic:', testStar.isStatic);
      }
    });

    // Add interactive hover effects
    let hoveredBody: Body | null = null;
    Matter.Events.on(mouse, 'mousemove', (event: any) => {
      const mousePosition = event.mouse.position;

      // Check which body is being hovered
      allFallingShapes.forEach((body) => {
        const distance = Math.sqrt(
          Math.pow(body.position.x - mousePosition.x, 2) +
          Math.pow(body.position.y - mousePosition.y, 2)
        );

        if (distance < 50) {
          hoveredBody = body;
          // Add a subtle bounce effect when hovering
          Body.setVelocity(body, {
            x: body.velocity.x * 1.1,
            y: body.velocity.y * 1.1
          });
        }
      });
    });

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
      /*
            // Render all falling shapes
            renderCogwheel(ctx, cogwheel1, shapeData);
            renderCogwheel(ctx, cogwheel2, shapeData);
            */
      renderOliveStick(ctx, skewer, shapeData);

      // Render all stars and bursts
      stars.forEach((star) => {
        const starData = shapeData.get(star);
        if (starData?.type === 'star') {
          renderStar(ctx, star, shapeData);
        } else if (starData?.type === 'burst') {
          renderBurst(ctx, star, shapeData);
        }
      });
      

      // Render test star
      const testStarData = shapeData.get(testStar);
      if (testStarData?.type === "testStar") {
        ctx.save();
        ctx.fillStyle = testStarData.options.fillColor;
        ctx.beginPath();
        ctx.arc(testStar.position.x, testStar.position.y, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

    });

    return () => {
      Render.stop(render);
      Runner.stop(runner);
      World.clear(world, false);
      Engine.clear(engine);
      render.canvas.remove();
      (render as any).textures = {};
    };
  }, [dimensions, showCollisionBodies]);

  return (
    <div style={{position: "relative"}}>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: `${dimensions.height}px`,
          margin: "0 auto",
          border: "0px solid #eee",
        }}
      />
      <button
        onClick={() => setShowCollisionBodies(!showCollisionBodies)}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          padding: "8px 12px",
          backgroundColor: showCollisionBodies ? "#ef4444" : "#10b981",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "12px",
          zIndex: 1000,
        }}
      >
        {showCollisionBodies ? "Hide" : "Show"} Collision Bodies
      </button>
    </div>
  );
}
