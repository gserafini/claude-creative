(() => {
  const canvas = document.getElementById("scene");
  const ctx = canvas.getContext("2d");

  const waterEl = document.getElementById("water-level");
  const tideEl = document.getElementById("current-state");
  const weatherEl = document.getElementById("slack-state");
  const noteEl = document.getElementById("cycle-note");
  const signalEl = document.getElementById("cycle-signal");

  const {
    clamp,
    getTideFrame,
    describeWeather,
    formatPacificTime
  } = window.ClearanceData;

  const tideStationId = "9415111";
  const weatherParams = "temperature_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m";
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=38.0494&longitude=-122.1586&current=${weatherParams}&timezone=America%2FLos_Angeles&forecast_days=1`;

  const fallbackPredictions = [
    { t: "2026-04-28 00:43", v: "0.169", type: "L" },
    { t: "2026-04-28 07:11", v: "5.060", type: "H" },
    { t: "2026-04-28 13:28", v: "0.210", type: "L" },
    { t: "2026-04-28 19:21", v: "4.026", type: "H" }
  ];

  const fallbackWeather = describeWeather({
    weather_code: 0,
    cloud_cover: 12,
    wind_speed_10m: 11.0,
    wind_direction_10m: 290,
    temperature_2m: 12
  });

  const reveals = [
    { kind: "text", text: "winter surge mark 11/14", ft: 4.65, x: 0.14, angle: -0.03, align: "left" },
    { kind: "text", text: "paint over the first number", ft: 3.85, x: 0.30, angle: -0.02, align: "left" },
    { kind: "ring", ft: 1.65, x: 0.73, size: 0.042 },
    { kind: "hook", ft: 0.92, x: 0.56, size: 0.046 },
    { kind: "text", text: "old ladder rung / only on winter lows", ft: 0.62, x: 0.33, mobileX: 0.26, angle: 0.018, align: "left" },
    { kind: "text", text: "water keeps its own ledger", ft: 0.38, x: 0.61, mobileX: 0.72, angle: -0.022, align: "center" }
  ];

  const deckNotes = [
    { text: "check west pier for salt bloom", x: 0.18, y: 0.33, angle: -0.02 },
    { text: "replace lamp before storm season", x: 0.77, y: 0.40, angle: 0.015 },
    { text: "east cable sings before first rain", x: 0.88, y: 0.25, angle: 0.01 }
  ];

  const pointer = {
    x: 0,
    y: 0,
    active: false
  };

  const live = {
    predictions: fallbackPredictions,
    weather: fallbackWeather,
    hasLiveTide: false,
    hasLiveWeather: false,
    fetchedAt: 0
  };

  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let lastTime = performance.now();
  let elapsed = 0;

  function formatUtcDate(date) {
    return date.toISOString().slice(0, 10).replace(/-/g, "");
  }

  function getTideBounds(predictions) {
    const heights = predictions.map((entry) => Number.parseFloat(entry.v));
    return {
      min: Math.min(...heights),
      max: Math.max(...heights)
    };
  }

  function waterHeightToY(ft, bounds) {
    const normalized = clamp((ft - bounds.min) / Math.max(0.1, bounds.max - bounds.min), 0, 1);
    return height * 0.82 - normalized * height * 0.28;
  }

  function weatherMood() {
    const weather = live.weather;
    return {
      mist: weather.label === "fog" ? 0.95 : clamp((weather.cloudCover + (weather.label === "rain" ? 25 : 0)) / 100, 0.08, 0.82),
      rain: weather.label === "rain" || weather.label === "storm",
      darkness: clamp(0.25 + weather.cloudCover / 160, 0.28, 0.78),
      ripple: clamp(3 + weather.windKnots * 0.45, 3, 11),
      clarity: weather.label === "clear" ? 0.92 : weather.label === "broken" ? 0.72 : weather.label === "overcast" ? 0.52 : 0.42
    };
  }

  function cycleCopy(frame) {
    if (frame.direction === "flood") {
      return {
        note: `The flood is taking most of it back. High water at ${formatPacificTime(frame.next.timeMs)}.`,
        signal: `Benicia live tide / flooding\nmore will show after the turn`
      };
    }

    return {
      note: `The ebb is giving a little back. Low water at ${formatPacificTime(frame.next.timeMs)}.`,
      signal: `Benicia live tide / ebbing\nlow water reveals the lower marks`
    };
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (!pointer.active) {
      pointer.x = width * 0.22;
      pointer.y = height * 0.62;
    }
  }

  async function fetchTidePredictions() {
    const now = new Date();
    const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const end = new Date(now.getTime() + 36 * 60 * 60 * 1000);
    const url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${formatUtcDate(start)}&end_date=${formatUtcDate(end)}&station=${tideStationId}&product=predictions&datum=MLLW&time_zone=gmt&interval=hilo&units=english&format=json`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`NOAA tide request failed: ${response.status}`);
    }
    const json = await response.json();
    if (!json.predictions || json.predictions.length < 3) {
      throw new Error("NOAA tide payload missing predictions");
    }
    return json.predictions;
  }

  async function fetchWeather() {
    const response = await fetch(weatherUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Weather request failed: ${response.status}`);
    }
    const json = await response.json();
    if (!json.current) {
      throw new Error("Weather payload missing current");
    }
    return describeWeather(json.current);
  }

  async function loadLiveData() {
    try {
      const [predictions, weather] = await Promise.all([
        fetchTidePredictions(),
        fetchWeather()
      ]);

      live.predictions = predictions;
      live.weather = weather;
      live.hasLiveTide = true;
      live.hasLiveWeather = true;
      live.fetchedAt = Date.now();
    } catch (error) {
      console.error("Clearance live data fallback:", error);
    }
  }

  function drawBackground(mood) {
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "#05070a");
    sky.addColorStop(0.42, "#0f141a");
    sky.addColorStop(1, "#040608");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    const haze = ctx.createLinearGradient(0, 0, 0, height * 0.55);
    haze.addColorStop(0, `rgba(255, 242, 220, ${0.03 + mood.darkness * 0.03})`);
    haze.addColorStop(1, "rgba(255, 242, 220, 0)");
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, width, height * 0.55);

    if (mood.rain) {
      ctx.strokeStyle = "rgba(188, 201, 211, 0.11)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 90; i += 1) {
        const x = (i / 89) * width + (elapsed * 0.03) % 24;
        const y = ((i * 47) % 100) / 100 * height;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 10, y + 32);
        ctx.stroke();
      }
    }
  }

  function drawBridgeDeck(horizon, mood) {
    ctx.strokeStyle = `rgba(42, 50, 58, ${0.88 + mood.clarity * 0.08})`;
    ctx.lineWidth = Math.max(2, width * 0.0045);
    ctx.beginPath();
    ctx.moveTo(-width * 0.1, horizon - height * 0.14);
    ctx.lineTo(width * 1.1, horizon - height * 0.1);
    ctx.stroke();

    ctx.lineWidth = Math.max(1, width * 0.0012);
    ctx.strokeStyle = `rgba(96, 109, 121, ${0.18 + mood.clarity * 0.12})`;

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

    [0.1, 0.44, 0.74, 0.92].forEach((fraction, index) => {
      const x = width * fraction;
      const w = width * (index === 3 ? 0.06 : 0.045);
      ctx.fillStyle = "rgba(21, 27, 33, 0.97)";
      ctx.fillRect(x, horizon - height * 0.26, w, height * 0.64);
      ctx.strokeStyle = "rgba(182, 131, 76, 0.26)";
      ctx.strokeRect(x, horizon - height * 0.26, w, height * 0.64);
    });
  }

  function drawPlatform(horizon) {
    const left = width * 0.08;
    const top = horizon + height * 0.07;
    const platformWidth = width * 0.82;
    const platformHeight = height * 0.46;

    const deck = ctx.createLinearGradient(left, top, left + platformWidth, top + platformHeight);
    deck.addColorStop(0, "#171c21");
    deck.addColorStop(1, "#0a0d11");
    ctx.fillStyle = deck;
    ctx.fillRect(left, top, platformWidth, platformHeight);

    ctx.strokeStyle = "rgba(197, 204, 209, 0.24)";
    ctx.lineWidth = 1.6;
    ctx.strokeRect(left, top, platformWidth, platformHeight);

    ctx.strokeStyle = "rgba(231, 161, 85, 0.18)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(left, top + platformHeight * 0.12);
    ctx.lineTo(left + platformWidth, top + platformHeight * 0.12);
    ctx.moveTo(left, top + platformHeight * 0.75);
    ctx.lineTo(left + platformWidth, top + platformHeight * 0.75);
    ctx.stroke();

    for (let i = 0; i < 26; i += 1) {
      const x = left + (i / 25) * platformWidth;
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, top + platformHeight);
      ctx.stroke();
    }
  }

  function drawWater(currentHeight, bounds, mood) {
    const mean = waterHeightToY(currentHeight, bounds);
    const amplitude = mood.ripple;

    const water = ctx.createLinearGradient(0, mean - 20, 0, height);
    water.addColorStop(0, "rgba(16, 23, 29, 0.45)");
    water.addColorStop(1, "rgba(5, 8, 11, 0.97)");
    ctx.fillStyle = water;
    ctx.fillRect(0, mean, width, height - mean);

    ctx.beginPath();
    ctx.moveTo(0, mean);
    for (let x = 0; x <= width + 12; x += 12) {
      const wave =
        Math.sin(x * 0.011 + elapsed * 0.00028) * amplitude +
        Math.sin(x * 0.021 - elapsed * 0.00019) * amplitude * 0.45;
      ctx.lineTo(x, mean + wave);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = "rgba(7, 12, 16, 0.9)";
    ctx.fill();

    ctx.strokeStyle = `rgba(184, 214, 232, ${0.08 + mood.clarity * 0.14})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, mean);
    for (let x = 0; x <= width + 10; x += 10) {
      const wave =
        Math.sin(x * 0.011 + elapsed * 0.00028) * amplitude +
        Math.sin(x * 0.021 - elapsed * 0.00019) * amplitude * 0.45;
      ctx.lineTo(x, mean + wave);
    }
    ctx.stroke();

    return mean;
  }

  function drawMist(horizon, mood) {
    const density = mood.mist;
    for (let i = 0; i < 5; i += 1) {
      const x = width * (0.12 + i * 0.18);
      const y = horizon + height * (0.06 + (i % 2) * 0.05);
      const r = width * 0.22;
      const mist = ctx.createRadialGradient(x, y, 0, x, y, r);
      mist.addColorStop(0, `rgba(187, 198, 208, ${0.02 + density * 0.12})`);
      mist.addColorStop(1, "rgba(187, 198, 208, 0)");
      ctx.fillStyle = mist;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
  }

  function spotlightStrength(x, y) {
    if (!pointer.active) {
      return 0;
    }
    const radius = width * 0.18;
    return clamp(1 - Math.hypot(pointer.x - x, pointer.y - y) / radius, 0, 1);
  }

  function drawLamp() {
    if (!pointer.active) {
      return;
    }

    const r = width < 700 ? width * 0.2 : width * 0.16;
    const glow = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, r);
    glow.addColorStop(0, "rgba(255, 244, 208, 0.25)");
    glow.addColorStop(0.35, "rgba(255, 222, 168, 0.13)");
    glow.addColorStop(1, "rgba(255, 222, 168, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(pointer.x - r, pointer.y - r, r * 2, r * 2);
  }

  function drawDeckNotes() {
    ctx.textBaseline = "middle";
    ctx.font = `${Math.max(12, width * 0.011)}px "IBM Plex Mono", monospace`;

    deckNotes.forEach((note) => {
      const x = width * note.x;
      const y = height * note.y;
      const spotlight = spotlightStrength(x, y);
      const visibility = 0.06 + spotlight * 0.7;
      if (visibility < 0.08) {
        return;
      }

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(note.angle);
      ctx.fillStyle = `rgba(221, 226, 229, ${visibility})`;
      ctx.shadowColor = `rgba(255, 236, 201, ${visibility * 0.2})`;
      ctx.shadowBlur = 12 * spotlight;
      ctx.fillText(note.text, 0, 0);
      ctx.restore();
    });
  }

  function drawRing(x, y, visibility, size) {
    const radius = width * size;
    ctx.strokeStyle = `rgba(164, 170, 176, ${visibility * 0.85})`;
    ctx.lineWidth = Math.max(1.2, radius * 0.12);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.55, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawHook(x, y, visibility, size) {
    const span = width * size;
    ctx.strokeStyle = `rgba(178, 162, 138, ${visibility * 0.85})`;
    ctx.lineWidth = Math.max(1.4, span * 0.09);
    ctx.beginPath();
    ctx.moveTo(x, y - span * 0.7);
    ctx.lineTo(x, y + span * 0.15);
    ctx.quadraticCurveTo(x + span * 0.4, y + span * 0.55, x + span * 0.18, y + span * 0.9);
    ctx.stroke();
  }

  function drawReveals(frame, bounds) {
    ctx.textBaseline = "middle";
    ctx.font = `${Math.max(10, width * 0.0102)}px "IBM Plex Mono", monospace`;

    reveals.forEach((item) => {
      const x = width * (width < 500 && item.mobileX ? item.mobileX : item.x);
      const y = waterHeightToY(item.ft, bounds) + height * 0.015;
      const aboveWater = clamp((item.ft - frame.height + 0.12) / 0.5, 0, 1);
      const underwaterGhost = clamp((frame.height - item.ft + 0.2) / 0.9, 0, 1) * 0.18;
      const spotlight = spotlightStrength(x, y) * 0.72;

      if (width < 500 && item.kind === "text" && aboveWater < 0.08 && spotlight < 0.18) {
        return;
      }

      const visibility = clamp(Math.max(aboveWater * 0.92, spotlight, underwaterGhost), 0, 1);

      if (visibility < 0.05) {
        return;
      }

      if (item.kind === "text") {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(item.angle || 0);
        ctx.textAlign = item.align || "left";
        ctx.fillStyle = `rgba(223, 227, 229, ${visibility})`;
        ctx.shadowColor = `rgba(255, 236, 201, ${visibility * 0.12})`;
        ctx.shadowBlur = 14 * visibility;
        ctx.fillText(item.text, 0, 0);
        ctx.restore();
      } else if (item.kind === "ring") {
        drawRing(x, y, visibility, item.size);
      } else if (item.kind === "hook") {
        drawHook(x, y, visibility, item.size);
      }
    });
  }

  function updateStatus(frame) {
    waterEl.textContent = `${frame.height.toFixed(1)} ft`;
    tideEl.textContent = `${frame.direction} to ${frame.next.height.toFixed(1)} @ ${formatPacificTime(frame.next.timeMs)}`;

    const weather = live.weather;
    weatherEl.textContent = `${weather.label} / ${weather.windCardinal} ${weather.windKnots} kt`;

    const copy = cycleCopy(frame);
    noteEl.textContent = copy.note;
    signalEl.innerHTML = copy.signal.replace("\n", "<br>");
  }

  function tick(now) {
    const dt = now - lastTime;
    lastTime = now;
    elapsed += dt;

    const bounds = getTideBounds(live.predictions);
    const frame = getTideFrame(live.predictions, Date.now());
    const mood = weatherMood();
    const horizon = height * 0.32;

    ctx.clearRect(0, 0, width, height);
    drawBackground(mood);
    drawBridgeDeck(horizon, mood);
    drawPlatform(horizon);
    drawMist(horizon, mood);
    drawDeckNotes();
    drawWater(frame.height, bounds, mood);
    drawReveals(frame, bounds);
    drawLamp();
    updateStatus(frame);

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
  loadLiveData();
  window.setInterval(loadLiveData, 15 * 60 * 1000);
  requestAnimationFrame(tick);
})();
