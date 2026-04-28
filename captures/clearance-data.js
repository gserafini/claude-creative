(function initClearanceData(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.ClearanceData = api;
})(typeof globalThis !== "undefined" ? globalThis : this, () => {
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function parseNoaaTime(value) {
    return Date.parse(value.replace(" ", "T") + ":00Z");
  }

  function easeInOutSine(t) {
    return -(Math.cos(Math.PI * t) - 1) / 2;
  }

  function normalizePrediction(prediction) {
    return {
      ...prediction,
      timeMs: prediction.timeMs ?? parseNoaaTime(prediction.t),
      height: prediction.height ?? Number.parseFloat(prediction.v)
    };
  }

  function findBracket(predictions, nowMs) {
    const normalized = predictions.map(normalizePrediction).sort((a, b) => a.timeMs - b.timeMs);

    for (let i = 0; i < normalized.length - 1; i += 1) {
      const current = normalized[i];
      const next = normalized[i + 1];
      if (nowMs >= current.timeMs && nowMs <= next.timeMs) {
        return { previous: current, next };
      }
    }

    if (nowMs < normalized[0].timeMs) {
      return { previous: normalized[0], next: normalized[1] };
    }

    return {
      previous: normalized[normalized.length - 2],
      next: normalized[normalized.length - 1]
    };
  }

  function getTideFrame(predictions, nowMs) {
    const { previous, next } = findBracket(predictions, nowMs);
    const duration = Math.max(1, next.timeMs - previous.timeMs);
    const progress = clamp((nowMs - previous.timeMs) / duration, 0, 1);
    const eased = easeInOutSine(progress);
    const height = previous.height + (next.height - previous.height) * eased;
    const direction = next.type === "H" ? "flood" : "ebb";
    const maxHeight = Math.max(previous.height, next.height);
    const minHeight = Math.min(previous.height, next.height);
    const slackFactor = 1 - Math.abs(0.5 - progress) * 2;

    return {
      previous,
      next,
      progress,
      eased,
      height,
      direction,
      range: maxHeight - minHeight,
      slackFactor
    };
  }

  function kmhToKnots(value) {
    return value * 0.539957;
  }

  function degreesToCardinal(degrees) {
    const labels = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    const normalized = ((degrees % 360) + 360) % 360;
    const index = Math.round(normalized / 22.5) % 16;
    return labels[index];
  }

  function describeWeather(current) {
    const code = current.weather_code;
    let label = "clear";

    if ([45, 48].includes(code)) {
      label = "fog";
    } else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
      label = "rain";
    } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
      label = "snow";
    } else if ([95, 96, 99].includes(code)) {
      label = "storm";
    } else if (current.cloud_cover >= 70) {
      label = "overcast";
    } else if (current.cloud_cover >= 35) {
      label = "broken";
    }

    return {
      label,
      windKnots: Math.round(kmhToKnots(current.wind_speed_10m || 0)),
      windCardinal: degreesToCardinal(current.wind_direction_10m || 0),
      cloudCover: current.cloud_cover ?? 0,
      temperatureC: current.temperature_2m ?? null,
      code
    };
  }

  function formatPacificTime(timeMs) {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      hour: "numeric",
      minute: "2-digit"
    }).format(new Date(timeMs));
  }

  return {
    clamp,
    parseNoaaTime,
    easeInOutSine,
    normalizePrediction,
    findBracket,
    getTideFrame,
    kmhToKnots,
    degreesToCardinal,
    describeWeather,
    formatPacificTime
  };
});
