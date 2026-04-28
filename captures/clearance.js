(() => {
  const canvas = document.getElementById("scene");
  const ctx = canvas.getContext("2d");

  const waterEl = document.getElementById("water-level");
  const currentEl = document.getElementById("current-state");
  const slackEl = document.getElementById("slack-state");

  const phrases = [
    { text: "check west pier for salt bloom", x: 0.18, y: 0.34, mode: "beam" },
    { text: "replace lamp before storm season", x: 0.68, y: 0.43, mode: "rail" },
    { text: "measure again at slack water", x: 0.36, y: 0.58, mode: "water" },
    { text: "clearance changes with the moon", x: 0.56, y: 0.61, mode: "water" },
    { text: "east cable sings before first rain", x: 0.77, y: 0.31, mode: "beam" },
    { text: "log corrosion after midnight", x: 0.12, y: 0.73, mode: "deck" },
    { text: "water keeps its own ledger", x: 0.49, y: 0.79, mode: "deck" },
    { text: "do not trust the first stillness", x: 0.63, y: 0.87, mode: "deck" }
  ];

  const pointer = {
    x: window.innerWidth * 0.72,
    y: window.innerHeight * 0.58,
    active: false
  };

  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let lastTime = performance.now();
  let elapsed = 0;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function mix(a, b, t) {
    return a + (b - a) * t;
  }

  function dist(x1, y1, x2, y2) {
    return Math.hypot(x1 - x2, y1 - y2);
  }

  function tideState(t) {
    const surge =
      Math.sin(t * 0.00012) * 0.42 +
      Math.sin(t * 0.00029 + 1.7) * 0.2 +
      Math.sin(t * 0.00053 + 5.2) * 0.08;

    const current =
      Math.cos(t * 0.00012) * 0.42 * 0.00012 +
      Math.cos(t * 0.00029 + 1.7) * 0.2 * 0.00029 +
      Math.cos(t * 0.00053 + 5.2) * 0.08 * 0.00053;

    const normalized = surge / 0.7;
    const slack = clamp(1 - Math.abs(current) * 12000, 0, 1);

    return { normalized, slack, current };
  }

  function drawBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "#070a0f");
    sky.addColorStop(0.38, "#11161d");
    sky.addColorStop(1, "#050709");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 16; i += 1) {
      const x = (i / 15) * width;
      const y = height * (0.12 + (i % 3) * 0.03);
      const radius = mix(120, 260, (i % 5) / 4);
      const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
      glow.addColorStop(0, "rgba(214, 168, 92, 0.05)");
      glow.addColorStop(1, "rgba(214, 168, 92, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
  }

  function drawBridgeDeck(horizon) {
      ctx.strokeStyle = "rgba(38, 45, 53, 0.96)";
    ctx.lineWidth = Math.max(2, width * 0.0045);
    ctx.beginPath();
    ctx.moveTo(-width * 0.1, horizon - height * 0.14);
    ctx.lineTo(width * 1.1, horizon - height * 0.1);
    ctx.stroke();

    ctx.lineWidth = Math.max(1, width * 0.0012);
      ctx.strokeStyle = "rgba(92, 104, 116, 0.28)";

    for (let i = -1; i < 14; i += 1) {
      const x = width * 0.08 + i * width * 0.09;
      const topY = horizon - height * 0.18;
      const bottomY = horizon - height * 0.02;
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x + width * 0.035, bottomY);
      ctx.lineTo(x + width * 0.07, topY);
      ctx.stroke();
    }

    const piers = [0.1, 0.44, 0.74, 0.92];
    piers.forEach((fraction, index) => {
      const x = width * fraction;
      const w = width * (index === 3 ? 0.06 : 0.045);
      ctx.fillStyle = "rgba(22, 27, 33, 0.97)";
      ctx.fillRect(x, horizon - height * 0.26, w, height * 0.64);
      ctx.strokeStyle = "rgba(181, 129, 73, 0.28)";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, horizon - height * 0.26, w, height * 0.64);
    });
  }

  function drawPlatform(horizon) {
    const left = width * 0.08;
    const top = horizon + height * 0.07;
    const platformWidth = width * 0.82;
    const platformHeight = height * 0.46;

    const deck = ctx.createLinearGradient(left, top, left + platformWidth, top + platformHeight);
    deck.addColorStop(0, "#181d22");
    deck.addColorStop(1, "#0b0e12");
    ctx.fillStyle = deck;
    ctx.fillRect(left, top, platformWidth, platformHeight);

    ctx.strokeStyle = "rgba(197, 204, 209, 0.28)";
    ctx.lineWidth = 1.8;
    ctx.strokeRect(left, top, platformWidth, platformHeight);

    ctx.strokeStyle = "rgba(231, 161, 85, 0.24)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(left, top + platformHeight * 0.12);
    ctx.lineTo(left + platformWidth, top + platformHeight * 0.12);
    ctx.moveTo(left, top + platformHeight * 0.75);
    ctx.lineTo(left + platformWidth, top + platformHeight * 0.75);
    ctx.stroke();

    for (let i = 0; i < 26; i += 1) {
      const x = left + (i / 25) * platformWidth;
      const wobble = Math.sin(i * 1.7) * height * 0.008;
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x + wobble, top + platformHeight);
      ctx.stroke();
    }

    for (let i = 0; i < 18; i += 1) {
      const x = left + (i / 17) * platformWidth;
      const y = top + ((i % 5) / 4) * platformHeight;
      const puddle = ctx.createRadialGradient(x, y, 0, x, y, width * 0.035);
      puddle.addColorStop(0, "rgba(184, 214, 232, 0.03)");
      puddle.addColorStop(1, "rgba(184, 214, 232, 0)");
      ctx.fillStyle = puddle;
      ctx.fillRect(x - width * 0.035, y - width * 0.035, width * 0.07, width * 0.07);
    }

    const lampX = left + platformWidth * 0.03;
    const lampY = top + platformHeight * 0.06;
    const lampGlow = ctx.createRadialGradient(lampX, lampY, 0, lampX, lampY, width * 0.12);
    lampGlow.addColorStop(0, "rgba(237, 181, 88, 0.68)");
    lampGlow.addColorStop(1, "rgba(237, 181, 88, 0)");
    ctx.fillStyle = lampGlow;
    ctx.fillRect(lampX - width * 0.12, lampY - width * 0.12, width * 0.24, width * 0.24);
  }

  function drawWater(horizon, state) {
    const top = horizon + height * 0.4;
    const mean = mix(top - height * 0.06, height * 0.83, (state.normalized + 1) * 0.5);
    const amplitude = mix(height * 0.004, height * 0.018, 1 - state.slack);

    const water = ctx.createLinearGradient(0, mean - 30, 0, height);
    water.addColorStop(0, "rgba(20, 27, 34, 0.4)");
    water.addColorStop(1, "rgba(5, 7, 9, 0.96)");
    ctx.fillStyle = water;
    ctx.fillRect(0, mean, width, height - mean);

    ctx.beginPath();
    ctx.moveTo(0, mean);
    for (let x = 0; x <= width + 16; x += 16) {
      const wave =
        Math.sin(x * 0.012 + elapsed * 0.0012) * amplitude +
        Math.sin(x * 0.022 - elapsed * 0.0017) * amplitude * 0.5;
      ctx.lineTo(x, mean + wave);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = "rgba(9, 14, 18, 0.88)";
    ctx.fill();

    ctx.strokeStyle = `rgba(184, 214, 232, ${mix(0.05, 0.22, state.slack)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, mean);
    for (let x = 0; x <= width + 10; x += 10) {
      const wave =
        Math.sin(x * 0.012 + elapsed * 0.0012) * amplitude +
        Math.sin(x * 0.022 - elapsed * 0.0017) * amplitude * 0.5;
      ctx.lineTo(x, mean + wave);
    }
    ctx.stroke();

    for (let i = 0; i < 11; i += 1) {
      const rx = (i / 10) * width;
      const reflectionHeight = mix(height * 0.08, height * 0.18, (i % 3) / 2);
      const reflection = ctx.createLinearGradient(0, mean, 0, mean + reflectionHeight);
      reflection.addColorStop(0, `rgba(237, 181, 88, ${mix(0.02, 0.08, state.slack)})`);
      reflection.addColorStop(1, "rgba(237, 181, 88, 0)");
      ctx.fillStyle = reflection;
      ctx.fillRect(rx, mean, width * 0.008, reflectionHeight);
    }

    return mean;
  }

  function drawMist(horizon, slack) {
    for (let i = 0; i < 5; i += 1) {
      const x = width * (0.15 + i * 0.16);
      const y = horizon + height * (0.08 + (i % 2) * 0.05);
      const r = width * 0.22;
      const mist = ctx.createRadialGradient(x, y, 0, x, y, r);
      mist.addColorStop(0, `rgba(187, 198, 208, ${mix(0.03, 0.11, slack)})`);
      mist.addColorStop(1, "rgba(187, 198, 208, 0)");
      ctx.fillStyle = mist;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
  }

  function drawLamp() {
    const r = width < 700 ? width * 0.2 : width * 0.15;
    const glow = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, r);
    glow.addColorStop(0, "rgba(255, 244, 208, 0.28)");
    glow.addColorStop(0.35, "rgba(255, 222, 168, 0.16)");
    glow.addColorStop(1, "rgba(255, 222, 168, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(pointer.x - r, pointer.y - r, r * 2, r * 2);
  }

  function drawPhrases(waterline, state) {
    ctx.textBaseline = "middle";
    ctx.font = `${Math.max(12, width * 0.0115)}px "IBM Plex Mono", monospace`;

    phrases.forEach((phrase, index) => {
      const x = width * phrase.x;
      const y = height * phrase.y;
      const d = dist(pointer.x, pointer.y, x, y);
      const lamp = clamp(1 - d / (width * 0.22), 0, 1);
      const tideMatch = 1 - clamp(Math.abs(waterline - y) / (height * 0.14), 0, 1);

      let visibility = lamp * 1.05 + state.slack * 0.06;
      if (phrase.mode === "water") {
        visibility += state.slack * 0.85 * tideMatch;
      } else if (phrase.mode === "deck") {
        visibility += state.slack * 0.42;
      } else {
        visibility += lamp * 0.26;
      }

      visibility = clamp(visibility, 0, 1);
      if (visibility < 0.06) {
        return;
      }

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((index % 3 === 0 ? -1 : 1) * 0.02 * (index + 1));
      ctx.fillStyle = `rgba(222, 227, 231, ${visibility * 0.96})`;
      ctx.shadowColor = `rgba(255, 236, 201, ${visibility * 0.24})`;
      ctx.shadowBlur = 16 * visibility;
      ctx.fillText(phrase.text, 0, 0);
      ctx.restore();
    });
  }

  function updateStatus(state, waterline) {
    const relative = ((height - waterline) / height) * 18 - 4;
    waterEl.textContent = `${relative.toFixed(1)} ft`;

    const direction = state.current > 0 ? "flooding" : "ebbing";
    const movement = Math.abs(state.current);
    if (movement < 0.00002) {
      currentEl.textContent = "slack";
    } else if (movement < 0.00005) {
      currentEl.textContent = `${direction} / slow`;
    } else {
      currentEl.textContent = `${direction} / running`;
    }

    if (state.slack > 0.78) {
      slackEl.textContent = "clear";
    } else if (state.slack > 0.45) {
      slackEl.textContent = "partial";
    } else {
      slackEl.textContent = "poor";
    }
  }

  function tick(now) {
    const dt = now - lastTime;
    lastTime = now;
    elapsed += dt;

    if (!pointer.active) {
      pointer.x = width * (0.5 + Math.sin(elapsed * 0.00012) * 0.26);
      pointer.y = height * (0.56 + Math.cos(elapsed * 0.00017) * 0.1);
    }

    const horizon = height * 0.32;
    const state = tideState(elapsed);

    ctx.clearRect(0, 0, width, height);
    drawBackground();
    drawBridgeDeck(horizon);
    drawPlatform(horizon);
    const waterline = drawWater(horizon, state);
    drawMist(horizon, state.slack);
    drawLamp();
    drawPhrases(waterline, state);
    updateStatus(state, waterline);

    requestAnimationFrame(tick);
  }

  function onPointerMove(event) {
    const touch = event.touches ? event.touches[0] : event;
    pointer.x = touch.clientX;
    pointer.y = touch.clientY;
    pointer.active = true;
  }

  function onPointerLeave() {
    pointer.active = false;
  }

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", onPointerMove, { passive: true });
  window.addEventListener("mouseleave", onPointerLeave);
  window.addEventListener("touchstart", onPointerMove, { passive: true });
  window.addEventListener("touchmove", onPointerMove, { passive: true });
  window.addEventListener("touchend", onPointerLeave, { passive: true });

  resize();
  requestAnimationFrame(tick);
})();
