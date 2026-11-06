/**
 * ===================================================================
 * HIGH-PERFORMANCE 120FPS MULTIPLAYER CANVAS SWARM REBUILD ENGINE
 * ===================================================================
 * - 100% Hardware-Accelerated 2D Canvas (Zero DOM thrashing, zero lag)
 * - Razor-sharp rendering (Zero blur filters, zero GPU bottlenecks)
 * - Authentic Figma multiplayer cursors (Ada, Linus, Ken, Grace, Sophie, etc.)
 * - Selection marquees, corner handles, dimension tags, red snapping guides, top/left rulers
 * - Direct real-element reveals across the whole page & smoothly on scroll
 * - 100% native touch-screen & trackpad scrolling (pointer-events: none)
 * - Zero bottom HUD, zero audio
 */
(() => {
  "use strict";

  const KEY = "__swarmEngine";
  if (window[KEY]) {
    try { window[KEY].destroy(); } catch (_) {}
  }

  // --- Constants ---
  const NAMES = [
    "Ada", "Linus", "Grace", "Alan", "Margaret", "Ken", "Barbara", "Dennis",
    "Radia", "Guido", "Frances", "Bjarne", "Hedy", "Tim", "Katherine", "Sophie"
  ];
  const COLORS = [
    "#F24E1E", "#A259FF", "#1ABCFE", "#0ACF83", "#FF7262", "#FFC700",
    "#9747FF", "#E8467C", "#14AE5C", "#0D99FF", "#FF8A00", "#00B5CE"
  ];
  const BLUE = "#0D99FF";
  const RED = "#F24822";
  const RULER = 20;

  const isMobile = window.innerWidth <= 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
  const isLowSpec = (navigator.hardwareConcurrency || 4) <= 4;
  const MAX_CONCURRENT_AGENTS = isMobile ? 3 : (isTablet ? 4 : (isLowSpec ? 5 : 6));

  // --- Target Element Scanning ---
  function getCandidateTargets() {
    const selectors = [
      // Hero
      ".hero-badge", ".hero-name", ".hero-role-wrapper", ".hero-description",
      ".hero-cta-group", ".hero-center-portrait", ".hero-socials", ".floating-item",
      // About & Bento
      ".section-badge", ".section-title", ".section-subtitle",
      ".bento-card", ".about-card-main", ".about-metrics", ".bento-badge-metric",
      // Projects
      ".project-card", ".bmw-interactive-card", ".project-banner", ".project-title",
      // Experience & Certs
      ".exp-card", ".exp-card-featured", ".cert-card",
      // Contact
      ".contact-hub-card", ".contact-cards-grid"
    ];
    const elements = [];
    for (const sel of selectors) {
      document.querySelectorAll(sel).forEach((el) => {
        if (!elements.includes(el) && el.offsetParent !== null) {
          elements.push(el);
        }
      });
    }
    return elements;
  }

  class SwarmEngine {
    constructor() {
      // Remove instant curtain if present
      const curtain = document.getElementById("swarm-curtain");
      if (curtain) curtain.remove();

      // Create full-screen transparent hardware-accelerated canvas
      this.canvas = document.createElement("canvas");
      this.canvas.id = "swarm-canvas-engine";
      this.canvas.style.cssText =
        "position:fixed;inset:0;width:100vw;height:100vh;z-index:2147483647;pointer-events:none !important;display:block;";
      document.documentElement.appendChild(this.canvas);
      this.ctx = this.canvas.getContext("2d", { alpha: true, desynchronized: true });

      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.resize();

      this.activeAgents = [];
      this.agentIdCounter = 0;
      this.guides = [];
      this.rulerAlpha = 1.0;
      this.animating = true;
      this.lastTime = performance.now();

      // Collect real elements
      this.rawTargets = getCandidateTargets();
      this.rawTargets.forEach((el) => {
        el.classList.add("swarm-target");
      });

      this.taskQueue = [];
      this.completedCount = 0;

      this.bindEvents();
      this.initIntersectionObserver();
      this.scheduleInitialViewport();

      this.raf = requestAnimationFrame((t) => this.loop(t));
    }

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.floor(this.width * this.dpr);
      this.canvas.height = Math.floor(this.height * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    bindEvents() {
      this.onResize = () => this.resize();
      window.addEventListener("resize", this.onResize, { passive: true });
    }

    initIntersectionObserver() {
      const sections = document.querySelectorAll("section, header, footer");
      this.observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const targets = entry.target.querySelectorAll(".swarm-target:not(.swarm-built):not(.swarm-building)");
              targets.forEach((el) => this.enqueueTask(el));
            }
          }
        },
        { rootMargin: "180px 0px 180px 0px", threshold: 0.05 }
      );
      sections.forEach((sec) => this.observer.observe(sec));
    }

    scheduleInitialViewport() {
      const vh = window.innerHeight;
      const initial = this.rawTargets.filter((el) => {
        const r = el.getBoundingClientRect();
        return r.top < vh + 100 && r.bottom > -50;
      });
      initial.forEach((el) => this.enqueueTask(el));
      this.fillAgents();
    }

    enqueueTask(el) {
      if (el._swarmQueued || el.classList.contains("swarm-built") || el.classList.contains("swarm-building")) return;
      el._swarmQueued = true;
      this.taskQueue.push({ el, enqueuedAt: performance.now() });
      this.fillAgents();
    }

    fillAgents() {
      while (
        this.activeAgents.filter((a) => !a.leaving).length < MAX_CONCURRENT_AGENTS &&
        this.taskQueue.length > 0
      ) {
        const task = this.taskQueue.shift();
        this.spawnAgent(task);
      }
    }

    spawnAgent(task) {
      const id = this.agentIdCounter++;
      const name = NAMES[id % NAMES.length];
      const color = COLORS[id % COLORS.length];

      const r = task.el.getBoundingClientRect();
      const targetBox = { x: r.left, y: r.top, w: Math.max(r.width, 24), h: Math.max(r.height, 20) };

      // Spawn from random edge
      let startX, startY;
      const edge = Math.floor(Math.random() * 4);
      if (edge === 0) { startX = -40; startY = Math.random() * this.height; }
      else if (edge === 1) { startX = this.width + 40; startY = Math.random() * this.height; }
      else if (edge === 2) { startX = Math.random() * this.width; startY = -40; }
      else { startX = Math.random() * this.width; startY = this.height + 40; }

      const agent = {
        id,
        name,
        color,
        task,
        x: startX,
        y: startY,
        angle: 0,
        press: 0,
        leaving: false,
        phase: "approaching", // approaching -> drafting -> finishing -> leaving
        progress: 0,
        box: targetBox,
        currentDraftBox: { x: targetBox.x, y: targetBox.y, w: 0, h: 0 }
      };

      task.el.classList.add("swarm-building");
      this.activeAgents.push(agent);

      // Add temporary snapping guide line
      if (Math.random() > 0.45) {
        this.guides.push({
          axis: Math.random() > 0.5 ? "x" : "y",
          pos: Math.random() > 0.5 ? targetBox.x : targetBox.y,
          alpha: 1.0,
          color: RED
        });
      }
    }

    loop(now) {
      if (!this.animating) return;
      const dt = Math.min((now - this.lastTime) / 1000, 0.05);
      this.lastTime = now;

      this.update(dt);
      this.render();

      this.raf = requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
      const speedMultiplier = 1.3;

      for (let i = this.activeAgents.length - 1; i >= 0; i--) {
        const a = this.activeAgents[i];
        const r = a.task.el.getBoundingClientRect();
        a.box = { x: r.left, y: r.top, w: Math.max(r.width, 24), h: Math.max(r.height, 20) };

        if (a.phase === "approaching") {
          const tx = a.box.x;
          const ty = a.box.y;
          const dx = tx - a.x;
          const dy = ty - a.y;
          const dist = Math.hypot(dx, dy);

          a.angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
          const step = Math.max(850, dist * 6.5) * dt * speedMultiplier;

          if (dist < 20) {
            a.x = tx;
            a.y = ty;
            a.phase = "drafting";
            a.progress = 0;
            a.press = 1;
          } else {
            a.x += (dx / dist) * step;
            a.y += (dy / dist) * step;
          }
        } else if (a.phase === "drafting") {
          a.progress += dt * 2.0 * speedMultiplier;
          const p = Math.min(a.progress, 1);
          // Animate selection box perimeter
          a.currentDraftBox = {
            x: a.box.x,
            y: a.box.y,
            w: a.box.w * Math.min(p * 1.4, 1),
            h: a.box.h * Math.max(0, Math.min((p - 0.2) * 1.25, 1))
          };

          // Cursor follows perimeter
          if (p < 0.35) {
            a.x = a.box.x + a.box.w * (p / 0.35);
            a.y = a.box.y;
            a.angle = 90;
          } else if (p < 0.7) {
            a.x = a.box.x + a.box.w;
            a.y = a.box.y + a.box.h * ((p - 0.35) / 0.35);
            a.angle = 180;
          } else {
            a.x = a.box.x + a.box.w * (1 - (p - 0.7) / 0.3);
            a.y = a.box.y + a.box.h;
            a.angle = -90;
          }

          if (p >= 1) {
            a.phase = "finishing";
            a.progress = 0;
            a.press = 0;
            // Real element is completely built with razor-sharp clarity
            a.task.el.classList.remove("swarm-building");
            a.task.el.classList.add("swarm-built");
            this.completedCount++;
          }
        } else if (a.phase === "finishing") {
          a.progress += dt * 3.5;
          if (a.progress >= 0.2) {
            a.phase = "leaving";
            a.leaving = true;
            // Target exit point off-screen
            const exitAngle = Math.random() * Math.PI * 2;
            a.exitTarget = {
              x: a.x + Math.cos(exitAngle) * (this.width + 120),
              y: a.y + Math.sin(exitAngle) * (this.height + 120)
            };
          }
        } else if (a.phase === "leaving") {
          const dx = a.exitTarget.x - a.x;
          const dy = a.exitTarget.y - a.y;
          const dist = Math.hypot(dx, dy);
          a.angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
          const step = 1150 * dt * speedMultiplier;

          a.x += (dx / dist) * step;
          a.y += (dy / dist) * step;

          if (a.x < -70 || a.x > this.width + 70 || a.y < -70 || a.y > this.height + 70) {
            this.activeAgents.splice(i, 1);
            this.fillAgents();
          }
        }
      }

      // Update guide lines fade
      for (let j = this.guides.length - 1; j >= 0; j--) {
        this.guides[j].alpha -= dt * 1.4;
        if (this.guides[j].alpha <= 0) this.guides.splice(j, 1);
      }
    }

    render() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.width, this.height);

      // 1. Snapping guidelines (Figma Red)
      ctx.save();
      for (const g of this.guides) {
        ctx.strokeStyle = g.color;
        ctx.globalAlpha = Math.max(0, g.alpha);
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        if (g.axis === "x") {
          ctx.moveTo(g.pos, 0);
          ctx.lineTo(g.pos, this.height);
        } else {
          ctx.moveTo(0, g.pos);
          ctx.lineTo(this.width, g.pos);
        }
        ctx.stroke();
      }
      ctx.restore();

      // 2. Draft selection boxes & dimension tags (Figma Blue)
      for (const a of this.activeAgents) {
        if (a.phase === "drafting" || a.phase === "finishing") {
          const b = a.phase === "finishing" ? a.box : a.currentDraftBox;
          if (b.w > 2 && b.h > 2) {
            ctx.save();
            ctx.strokeStyle = BLUE;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(b.x, b.y, b.w, b.h);

            // 4 Corner handles (White square with blue outline)
            const corners = [
              [b.x, b.y],
              [b.x + b.w, b.y],
              [b.x, b.y + b.h],
              [b.x + b.w, b.y + b.h]
            ];
            ctx.fillStyle = "#ffffff";
            for (const [cx, cy] of corners) {
              ctx.fillRect(cx - 3, cy - 3, 6, 6);
              ctx.strokeRect(cx - 3, cy - 3, 6, 6);
            }

            // Dimension Tag ("w × h")
            const dimText = `${Math.round(a.box.w)} × ${Math.round(a.box.h)}`;
            ctx.font = "600 10px Inter, system-ui, sans-serif";
            const tagW = ctx.measureText(dimText).width + 10;
            const tagH = 16;
            const tagX = b.x + (b.w - tagW) / 2;
            const tagY = b.y + b.h + 6;

            ctx.fillStyle = BLUE;
            ctx.beginPath();
            ctx.roundRect(tagX, tagY, tagW, tagH, 3);
            ctx.fill();

            ctx.fillStyle = "#ffffff";
            ctx.textBaseline = "middle";
            ctx.fillText(dimText, tagX + 5, tagY + tagH / 2);
            ctx.restore();
          }
        }
      }

      // 3. Figma Multiplayer Cursors
      for (const a of this.activeAgents) {
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate((a.angle * Math.PI) / 180);
        const s = a.press ? 0.88 : 1.0;
        ctx.scale(s, s);

        // Arrow head
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(15, 6);
        ctx.lineTo(9, 8.5);
        ctx.lineTo(7, 14.5);
        ctx.closePath();
        ctx.fillStyle = a.color;
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.4;
        ctx.lineJoin = "round";
        ctx.stroke();

        ctx.restore();

        // Name badge pill
        ctx.save();
        ctx.translate(a.x + 12, a.y + 10);
        ctx.font = "600 10px Inter, system-ui, sans-serif";
        const nw = ctx.measureText(a.name).width;
        const pillW = nw + 10;
        const pillH = 16;

        ctx.fillStyle = a.color;
        ctx.beginPath();
        ctx.roundRect(0, 0, pillW, pillH, 3);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.textBaseline = "middle";
        ctx.fillText(a.name, 5, pillH / 2);
        ctx.restore();
      }

      // 4. Subtle Top & Left Drafting Rulers
      if (this.rulerAlpha > 0.01) {
        ctx.save();
        ctx.fillStyle = "#161b22";
        ctx.fillRect(0, 0, this.width, RULER);
        ctx.fillRect(0, 0, RULER, this.height);

        ctx.strokeStyle = "#30363d";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, RULER);
        ctx.lineTo(this.width, RULER);
        ctx.moveTo(RULER, 0);
        ctx.lineTo(RULER, this.height);
        ctx.stroke();

        ctx.fillStyle = "#8b949e";
        ctx.font = "500 8.5px Inter, system-ui, sans-serif";
        ctx.textBaseline = "middle";

        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        const startX = Math.floor(scrollX / 100) * 100;
        for (let x = startX; x - scrollX < this.width; x += 50) {
          const rx = x - scrollX;
          if (rx < RULER) continue;
          const isMajor = x % 100 === 0;
          ctx.beginPath();
          ctx.moveTo(rx, isMajor ? 11 : 15);
          ctx.lineTo(rx, RULER);
          ctx.stroke();
          if (isMajor) ctx.fillText(x.toString(), rx + 3, 8);
        }

        const startY = Math.floor(scrollY / 100) * 100;
        for (let y = startY; y - scrollY < this.height; y += 50) {
          const ry = y - scrollY;
          if (ry < RULER) continue;
          const isMajor = y % 100 === 0;
          ctx.beginPath();
          ctx.moveTo(isMajor ? 11 : 15, ry);
          ctx.lineTo(RULER, ry);
          ctx.stroke();
          if (isMajor) {
            ctx.save();
            ctx.translate(8, ry - 3);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(y.toString(), 0, 0);
            ctx.restore();
          }
        }

        ctx.fillStyle = "#21262d";
        ctx.fillRect(0, 0, RULER, RULER);
        ctx.restore();
      }
    }

    destroy() {
      this.animating = false;
      cancelAnimationFrame(this.raf);
      window.removeEventListener("resize", this.onResize);
      if (this.observer) this.observer.disconnect();
      if (this.canvas) this.canvas.remove();
      this.rawTargets.forEach((el) => {
        el.classList.remove("swarm-target", "swarm-building");
        el.classList.add("swarm-built");
      });
    }
  }

  // Self-start immediately
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window[KEY] = new SwarmEngine();
    }, { once: true });
  } else {
    window[KEY] = new SwarmEngine();
  }
})();
