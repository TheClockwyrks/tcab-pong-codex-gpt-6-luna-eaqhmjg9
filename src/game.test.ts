import { createCanvas } from "@napi-rs/canvas";
import { ConstantClock, createEngine } from "@clockwyrks/simple-2d";
import type { Engine } from "@clockwyrks/simple-2d";
import { describe, expect, it } from "vitest";
import { game } from "./game";
import type { CaromDebugApi, CaromState } from "./game";

function harness(stepMs = 8): Engine<CaromState, CaromDebugApi> {
  const canvas = createCanvas(1280, 720) as unknown as HTMLCanvasElement;
  const events = new EventTarget();
  return createEngine({
    canvas,
    width: 1280,
    height: 720,
    game,
    clock: new ConstantClock(stepMs),
    surface: {
      cssWidth: () => 1280,
      cssHeight: () => 720,
      dpr: () => 1,
      events: () => events,
    },
  });
}

describe("Carom simulation", () => {
  it("starts complete and exposes world poses through debug", async () => {
    const engine = harness();
    await engine.initialize();
    expect(engine.debug.snapshot(engine.state).screen).toBe("title");
    engine.apply((s) => engine.debug.clearWorld(s));
    expect(engine.debug.snapshot(engine.state).ball).toBeNull();
    expect(engine.debug.snapshot(engine.state).obstacles).toHaveLength(0);
    engine.apply((s) => engine.debug.spawnBall(s));
    expect(engine.debug.snapshot(engine.state).ball?.held).toBe(true);
    engine.destroy();
  });

  it("serves on the countdown frame that exhausts the hold", async () => {
    const engine = harness(250);
    await engine.initialize();
    engine.apply((s) => engine.debug.setScreen(s, "countdown"));
    await engine.advance(4);
    const snapshot = engine.debug.snapshot(engine.state);
    expect(snapshot.screen).toBe("playing");
    expect(snapshot.ball?.held).toBe(false);
    expect(snapshot.ball?.speed).toBeCloseTo(520, 5);
    engine.destroy();
  });

  it("integrates a driven paddle and retains its configured speed", async () => {
    const engine = harness(100);
    await engine.initialize();
    engine.apply((s) => engine.debug.setScreen(s, "playing"));
    engine.apply((s) => engine.debug.setPaddleDriven(s, "left", true));
    engine.apply((s) => engine.debug.setPaddleVy(s, "left", 400));
    await engine.advance(1);
    const paddle = engine.debug.snapshot(engine.state).paddles.left;
    expect(paddle.cy).toBe(400);
    expect(paddle.vy).toBe(400);
    expect(paddle.drivenVy).toBe(400);
    engine.destroy();
  });

  it("bounces from a wall and awards a point beyond the goal", async () => {
    const engine = harness(100);
    await engine.initialize();
    engine.apply((s) => engine.debug.clearWorld(s));
    engine.apply((s) => engine.debug.spawnBall(s));
    engine.apply((s) => engine.debug.setScreen(s, "playing"));
    engine.apply((s) => engine.debug.setBallPosition(s, 640, 15));
    engine.apply((s) => engine.debug.setBallVelocity(s, 0, -200));
    await engine.advance(1);
    expect(engine.debug.snapshot(engine.state).ball?.vy).toBeGreaterThan(0);
    engine.apply((s) => engine.debug.setBallPosition(s, 1270, 360));
    engine.apply((s) => engine.debug.setBallVelocity(s, 500, 0));
    await engine.advance(1);
    const snapshot = engine.debug.snapshot(engine.state);
    expect(snapshot.score.p1).toBe(1);
    expect(snapshot.screen).toBe("countdown");
    expect(snapshot.receiver).toBe("right");
    engine.destroy();
  });
});
