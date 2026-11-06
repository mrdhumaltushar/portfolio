/**
 * ===================================================================
 * NATIVE REAL-ELEMENT SWARM REBUILD ENGINE
 * ===================================================================
 * High-performance multiplayer cursor architecture operating DIRECTLY
 * on real DOM elements.
 *
 * Features:
 * - Direct real-element loading effect (no duplicate/cloned Shadow DOM)
 * - 100% native 120Hz/60Hz touch & wheel scrolling (pointer-events: none canvas)
 * - Arrows auto-leave off-screen as soon as each element's work is done
 * - Progressive load-on-scroll using IntersectionObserver
 * - Zero CPU/GPU overhead when idle
 * - Ultra-responsive across Mobile, Tablet, and Desktop
 */
(() => {
  "use strict";

  // Prevent multiple instantiations
  if (window.__realSwarmRebuild) return;
  window.__realSwarmRebuild = true;

  // Device & Concurrency Profiler
  const isMobile = window.innerWidth <= 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
  const isLowSpec = (navigator.hardwareConcurrency || 4) <= 4;
  const MAX_CONCURRENT_AGENTS = isMobile ? 2 : (isTablet ? 3 : (isLowSpec ? 4 : 5));

  // Agent Identities
  const AGENT_NAMES = ["Ada", "Linus", "Grace", "Tushar", "Dennis", "Margaret", "Ken", "Barbara"];
  const AGENT_COLORS = ["#0D99FF", "#0ACF83", "#F24E1E", "#A259FF", "#FFC700", "#00B5CE"];

  // Selectors for elements to be built directly on the real DOM
  const SECTION_SELECTORS = [
    {
      id: "hero",
      elements: [
        "#hero .greeting-wrapper",
        "#hero .hero-name",
        "#hero .hero-role-wrapper",
        "#hero .hero-desc",
        "#hero .hero-actions",
        "#hero .bi-cockpit-card",
        "#hero .portrait-wrapper",
        "#hero .floating-item"
      ]
    },
    {
      id: "about",
      elements: [
        "#about .section-header",
        "#about .about-card-main",
        "#about .info-box"
      ]
    },
    {
      id: "skills",
      elements: [
        "#skills .section-header",
        "#skills .bento-card"
      ]
    },
    {
      id: "projects",
      elements: [
        "#projects .section-header",
        "#projects .project-card"
      ]
    },
    {
      id: "experience",
      elements: [
        "#experience .section-header",
        "#experience .exp-card"
      ]
    },
    {
      id: "certifications",
      elements: [
        "#certifications .section-header",
        "#certifications .cert-card"
      ]
    },
    {
      id: "contact",
      elements: [
        "#contact .section-header",
        "#contact .contact-hub-wrapper",
        "#contact .contact-hub-card"
      ]
    }
  ];

  // Helper math
  const rand = (min, max) => min + Math.random() * (max - min);
  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

  class SwarmEngine {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.activeAgents = [];
      this.taskQueue = [];
      this.running = false;
      this.rafId = null;
      this.observer = null;
      this.nextAgentId = 0;
      this.builtElements = new WeakSet();

      this.init();
    }

    init() {
      // 1. Create transparent overlay canvas
      this.canvas = document.createElement("canvas");
      this.canvas.id = "swarm-rebuild-canvas";
      this.canvas.style.cssText =
        "position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none !important;z-index:99999;";
      document.documentElement.appendChild(this.canvas);
      this.ctx = this.canvas.getContext("2d", { alpha: true });

      this.resizeCanvas();
      window.addEventListener("resize", () => this.resizeCanvas(), { passive: true });

      // 2. Mark target elements with initial stealth state
      this.prepareElements();

      // 3. Setup progressive scroll observer
      this.setupObserver();

      // 4. Keyboard bypass (Esc reveals all)
      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") this.revealAll();
      });

      // 5. Clean up any leftover preload curtain immediately
      const curtain = document.getElementById("swarm-curtain");
      if (curtain) curtain.remove();
    }

    resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = window.innerWidth * dpr;
      this.canvas.height = window.innerHeight * dpr;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    prepareElements() {
      for (const sec of SECTION_SELECTORS) {
        for (const sel of sec.elements) {
          const els = document.querySelectorAll(sel);
          for (const el of els) {
            el.classList.add("swarm-target");
          }
        }
      }
    }

    setupObserver() {
      // Observe sections for scroll-driven rebuilding
      this.observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const secId = entry.target.id;
              this.enqueueSection(secId);
            }
          }
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
      );

      for (const sec of SECTION_SELECTORS) {
        const secEl = document.getElementById(sec.id);
        if (secEl) this.observer.observe(secEl);
      }

      // Immediately trigger hero section
      this.enqueueSection("hero");
    }

    enqueueSection(secId) {
      const secDef = SECTION_SELECTORS.find((s) => s.id === secId);
      if (!secDef) return;

      const newTasks = [];
      for (const sel of secDef.elements) {
        const els = document.querySelectorAll(sel);
        for (const el of els) {
          if (!this.builtElements.has(el)) {
            newTasks.push(el);
          }
        }
      }

      if (newTasks.length > 0) {
        // Enqueue unique tasks
        for (const el of newTasks) {
          if (!this.taskQueue.includes(el)) {
            this.taskQueue.push(el);
          }
        }
        this.fillAgents();
        if (!this.running) this.startLoop();
      }
    }

    fillAgents() {
      while (
        this.activeAgents.filter((a) => !a.leaving).length < MAX_CONCURRENT_AGENTS &&
        this.taskQueue.length > 0
      ) {
        const el = this.taskQueue.shift();
        this.spawnAgentFor(el);
      }
    }

    spawnAgentFor(el) {
      const id = this.nextAgentId++;
      const name = AGENT_NAMES[id % AGENT_NAMES.length];
      const color = AGENT_COLORS[id % AGENT_COLORS.length];

      const r = el.getBoundingClientRect();
      const fromLeft = Math.random() < 0.5;
      const startX = fromLeft ? -40 : window.innerWidth + 40;
      const startY = clamp(r.top + rand(-20, 20), 40, window.innerHeight - 40);

      const agent = {
        id,
        name,
        color,
        el,
        x: startX,
        y: startY,
        vx: 0,
        vy: 0,
        state: "fly_in", // "fly_in" -> "drawing" -> "leaving"
        progress: 0,
        drawSpeed: rand(0.015, 0.025), // Fast, crisp completion (~0.4s)
        leaving: false,
        exitX: fromLeft ? -60 : window.innerWidth + 60,
        exitY: startY + rand(-40, 40)
      };

      this.activeAgents.push(agent);
    }

    startLoop() {
      this.running = true;
      let lastTime = performance.now();

      const loop = (now) => {
        const dt = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;

        this.update(dt);
        this.render();

        if (this.activeAgents.length > 0 || this.taskQueue.length > 0) {
          this.rafId = requestAnimationFrame(loop);
        } else {
          // Zero active cursors! Sleep engine to save 100% CPU/GPU
          this.running = false;
          this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        }
      };

      this.rafId = requestAnimationFrame(loop);
    }

    update(dt) {
      const agents = [...this.activeAgents];

      for (const a of agents) {
        if (a.state === "fly_in") {
          const r = a.el.getBoundingClientRect();
          const targetX = r.left + r.width * 0.15;
          const targetY = r.top + r.height * 0.2;

          const dx = targetX - a.x;
          const dy = targetY - a.y;
          const dist = Math.hypot(dx, dy);

          const speed = Math.max(1400, dist * 6.5);
          a.x += (dx / (dist || 1)) * speed * dt;
          a.y += (dy / (dist || 1)) * speed * dt;

          if (dist < 25) {
            a.state = "drawing";
            a.el.classList.add("swarm-building");
          }
        } else if (a.state === "drawing") {
          a.progress += a.drawSpeed;

          const r = a.el.getBoundingClientRect();
          // Move cursor along the element perimeter while measuring
          const p = a.progress;
          if (p < 0.25) {
            a.x = r.left + (r.width * (p / 0.25));
            a.y = r.top;
          } else if (p < 0.5) {
            a.x = r.right;
            a.y = r.top + (r.height * ((p - 0.25) / 0.25));
          } else if (p < 0.75) {
            a.x = r.right - (r.width * ((p - 0.5) / 0.25));
            a.y = r.bottom;
          } else {
            a.x = r.left;
            a.y = r.bottom - (r.height * ((p - 0.75) / 0.25));
          }

          if (a.progress >= 1) {
            // Work done on this element! Reveal the real element cleanly
            a.el.classList.remove("swarm-building");
            a.el.classList.add("swarm-built");
            this.builtElements.add(a.el);

            // Check if there is another immediately pending task
            if (this.taskQueue.length > 0) {
              a.el = this.taskQueue.shift();
              a.progress = 0;
              a.state = "fly_in";
            } else {
              // Arrow work done! Fly off-screen and disappear ("remove this arrow by every element")
              a.state = "leaving";
              a.leaving = true;
              const right = a.x > window.innerWidth / 2;
              a.exitX = right ? window.innerWidth + 70 : -70;
              a.exitY = a.y + rand(-30, 30);
            }
          }
        } else if (a.state === "leaving") {
          const dx = a.exitX - a.x;
          const dy = a.exitY - a.y;
          const dist = Math.hypot(dx, dy);

          const speed = Math.max(1600, dist * 8);
          a.x += (dx / (dist || 1)) * speed * dt;
          a.y += (dy / (dist || 1)) * speed * dt;

          if (dist < 30 || a.x < -50 || a.x > window.innerWidth + 50) {
            // Remove cursor completely from active pool
            const idx = this.activeAgents.indexOf(a);
            if (idx !== -1) this.activeAgents.splice(idx, 1);
            this.fillAgents();
          }
        }
      }
    }

    render() {
      const ctx = this.ctx;
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      for (const a of this.activeAgents) {
        // 1. Draw element blueprint measurement box
        if (a.state === "drawing") {
          const r = a.el.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) {
            ctx.save();
            ctx.strokeStyle = a.color;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 4]);

            // Draw bounding rect
            ctx.strokeRect(r.left, r.top, r.width, r.height);

            // Draw 4 corner target crosshairs
            ctx.setLineDash([]);
            const ch = 7;
            // Top-left
            ctx.beginPath();
            ctx.moveTo(r.left - ch, r.top); ctx.lineTo(r.left + ch, r.top);
            ctx.moveTo(r.left, r.top - ch); ctx.lineTo(r.left, r.top + ch);
            // Top-right
            ctx.moveTo(r.right - ch, r.top); ctx.lineTo(r.right + ch, r.top);
            ctx.moveTo(r.right, r.top - ch); ctx.lineTo(r.right, r.top + ch);
            // Bottom-left
            ctx.moveTo(r.left - ch, r.bottom); ctx.lineTo(r.left + ch, r.bottom);
            ctx.moveTo(r.left, r.bottom - ch); ctx.lineTo(r.left, r.bottom + ch);
            // Bottom-right
            ctx.moveTo(r.right - ch, r.bottom); ctx.lineTo(r.right + ch, r.bottom);
            ctx.moveTo(r.right, r.bottom - ch); ctx.lineTo(r.right, r.bottom + ch);
            ctx.stroke();

            // Dimension badge pill above element
            const badgeText = `${Math.round(r.width)} × ${Math.round(r.height)}`;
            ctx.font = "600 11px system-ui, -apple-system, sans-serif";
            const textW = ctx.measureText(badgeText).width;
            const badgeX = r.left + r.width / 2 - textW / 2 - 8;
            const badgeY = Math.max(12, r.top - 20);

            ctx.fillStyle = a.color;
            ctx.beginPath();
            ctx.roundRect(badgeX, badgeY, textW + 16, 18, 4);
            ctx.fill();

            ctx.fillStyle = "#ffffff";
            ctx.fillText(badgeText, badgeX + 8, badgeY + 13);
            ctx.restore();
          }
        }

        // 2. Draw multiplayer agent cursor pointer & name badge
        this.drawCursor(ctx, a);
      }
    }

    drawCursor(ctx, a) {
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.globalAlpha = a.leaving ? 0.6 : 1.0;

      // Draw SVG-style sharp cursor pointer
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 16);
      ctx.lineTo(4.5, 12.5);
      ctx.lineTo(9.5, 20);
      ctx.lineTo(12, 18.5);
      ctx.lineTo(7, 11);
      ctx.lineTo(13.5, 11);
      ctx.closePath();

      ctx.fillStyle = a.color;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Agent name tag pill next to cursor
      const label = a.name;
      ctx.font = "600 11px system-ui, -apple-system, sans-serif";
      const lw = ctx.measureText(label).width;
      const lx = 14;
      const ly = 12;

      ctx.fillStyle = a.color;
      ctx.beginPath();
      ctx.roundRect(lx, ly, lw + 12, 18, 4);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.fillText(label, lx + 6, ly + 13);

      ctx.restore();
    }

    revealAll() {
      // Reveal all targeted elements immediately and clear canvas
      const els = document.querySelectorAll(".swarm-target");
      for (const el of els) {
        el.classList.remove("swarm-building");
        el.classList.add("swarm-built");
        this.builtElements.add(el);
      }
      this.activeAgents = [];
      this.taskQueue = [];
      this.running = false;
      if (this.ctx) this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  // Initialize immediately on DOM ready
  let engine = null;
  const startEngine = () => {
    if (!engine) engine = new SwarmEngine();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startEngine, { once: true });
  } else {
    startEngine();
  }

  // Safety fallback: ensure page is never stuck if any error occurs
  setTimeout(() => {
    if (engine) {
      const heroEls = document.querySelectorAll("#hero .swarm-target");
      for (const el of heroEls) el.classList.add("swarm-built");
    }
  }, 2500);
})();
