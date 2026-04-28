const test = require("node:test");
const assert = require("node:assert/strict");

const {
  parseNoaaTime,
  getTideFrame,
  kmhToKnots,
  degreesToCardinal,
  describeWeather
} = require("./clearance-data.js");

test("parseNoaaTime parses GMT timestamps into epoch ms", () => {
  const ms = parseNoaaTime("2026-04-28 07:11");
  assert.equal(new Date(ms).toISOString(), "2026-04-28T07:11:00.000Z");
});

test("getTideFrame interpolates between low and high across midnight", () => {
  const predictions = [
    { t: "2026-04-28 00:43", v: "0.169", type: "L" },
    { t: "2026-04-28 07:11", v: "5.060", type: "H" },
    { t: "2026-04-28 13:28", v: "0.210", type: "L" }
  ];

  const now = Date.parse("2026-04-28T04:54:00.000Z");
  const frame = getTideFrame(predictions, now);

  assert.equal(frame.direction, "flood");
  assert.equal(frame.previous.type, "L");
  assert.equal(frame.next.type, "H");
  assert.ok(frame.height > 0.169);
  assert.ok(frame.height < 5.060);
  assert.ok(frame.progress > 0.6);
  assert.ok(frame.progress < 0.7);
});

test("getTideFrame returns ebbing after the high", () => {
  const predictions = [
    { t: "2026-04-28 00:43", v: "0.169", type: "L" },
    { t: "2026-04-28 07:11", v: "5.060", type: "H" },
    { t: "2026-04-28 13:28", v: "0.210", type: "L" }
  ];

  const now = Date.parse("2026-04-28T10:00:00.000Z");
  const frame = getTideFrame(predictions, now);

  assert.equal(frame.direction, "ebb");
  assert.equal(frame.previous.type, "H");
  assert.equal(frame.next.type, "L");
  assert.ok(frame.height > 0.210);
  assert.ok(frame.height < 5.060);
});

test("describeWeather converts live-style current weather into readable scene data", () => {
  const weather = describeWeather({
    weather_code: 0,
    cloud_cover: 0,
    wind_speed_10m: 14.7,
    wind_direction_10m: 287,
    temperature_2m: 12.4
  });

  assert.equal(weather.label, "clear");
  assert.equal(weather.windCardinal, "WNW");
  assert.equal(weather.windKnots, Math.round(kmhToKnots(14.7)));
  assert.equal(weather.temperatureC, 12.4);
});

test("degreesToCardinal handles wrapping", () => {
  assert.equal(degreesToCardinal(0), "N");
  assert.equal(degreesToCardinal(225), "SW");
  assert.equal(degreesToCardinal(359), "N");
});
