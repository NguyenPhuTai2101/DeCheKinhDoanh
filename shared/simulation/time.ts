export function simulationDelta(tickMs: number, speed: number) {
  const milliseconds = tickMs * Math.max(0, speed);
  return { milliseconds, seconds:milliseconds / 1000, gameMinutes:milliseconds / 400 };
}
