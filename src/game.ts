import type {
  Game,
  InitApi,
  RenderApi,
  UpdateApi,
} from "@clockwyrks/simple-2d";
import type { DeepReadonly } from "ts-essentials";
import {
  ACTIONS,
  CAROM_DEBUG_VERSION,
  AI_DEADZONE,
  AI_HOME_DEADZONE,
  AI_HOME_Y,
  AI_REACT,
  AI_SPEED,
  BALL_R,
  BINDINGS,
  CUES,
  FIELD_CX,
  FIELD_CY,
  FIELD_H,
  FIELD_W,
  HOLD_TIME,
  MAX_BOUNCE_ANGLE,
  MAX_SUBSTEP,
  MATCHOVER_ITEMS,
  NET_X,
  OBSTACLE_CENTERS,
  OBSTACLE_H,
  OBSTACLE_W,
  OBSTACLES,
  PADDLE_HALF,
  PADDLE_H,
  PADDLE_MAX_CY,
  PADDLE_MIN_CY,
  PADDLE_SPEED,
  PADDLE_W,
  P1_X0,
  P1_X1,
  P2_X0,
  P2_X1,
  PAUSE_ITEMS,
  SERVE_ANGLE,
  SERVE_SPEED,
  SPIN_CLAMP,
  SPIN_FROM_PADDLE,
  SPIN_HALFLIFE,
  SPEED_CAP,
  SPEED_MULT,
  TITLE_ITEMS,
  TITLE_TEXT,
  TRAIL_TIME,
  WIN_LEAD,
  WIN_SCORE,
} from "./constants";

export type Screen =
  "title" | "howto" | "countdown" | "playing" | "paused" | "matchover";
export type Mode = "solo" | "versus";
export type Side = "left" | "right";
export interface PaddleState {
  readonly cy: number;
  readonly vy: number;
  readonly driven: boolean;
  readonly drivenVy: number;
}
export interface AiState {
  readonly tracking: boolean;
  readonly movement: boolean;
}
export interface TrailSample {
  readonly x: number;
  readonly y: number;
  readonly t: number;
}
export interface BallState {
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly spin: number;
  readonly held: boolean;
  readonly holdTimer: number;
  readonly serveSign: 1 | -1;
  readonly trail: readonly TrailSample[];
}
export interface ObstacleState {
  readonly index: number;
  readonly cx: number;
  readonly cy: number;
}
export interface CaromState {
  readonly screen: Screen;
  readonly mode: Mode;
  readonly menuIndex: number;
  readonly titleIndex: number;
  readonly resumeScreen: "countdown" | "playing";
  readonly score: { readonly p1: number; readonly p2: number };
  readonly winner: Side | null;
  readonly paddles: { readonly left: PaddleState; readonly right: PaddleState };
  readonly ai: AiState;
  readonly receiver: Side;
  readonly ball: BallState | null;
  readonly obstacles: readonly ObstacleState[];
  readonly simTime: number;
  readonly muted: boolean;
}
export interface CaromSnapshot extends Omit<CaromState, "ball"> {
  readonly version: number;
  readonly ball: (BallState & { readonly speed: number }) | null;
}
export interface CaromDebugApi {
  readonly version: number;
  clearWorld(s: DeepReadonly<CaromState>): CaromState;
  spawnBall(s: DeepReadonly<CaromState>): CaromState;
  spawnObstacle(s: DeepReadonly<CaromState>, index: number): CaromState;
  reset(s: DeepReadonly<CaromState>): CaromState;
  reconcile(s: DeepReadonly<CaromState>): CaromState;
  setScreen(s: DeepReadonly<CaromState>, screen: Screen): CaromState;
  setMode(s: DeepReadonly<CaromState>, mode: Mode): CaromState;
  setMenuIndex(s: DeepReadonly<CaromState>, index: number): CaromState;
  setTitleIndex(s: DeepReadonly<CaromState>, index: number): CaromState;
  setResumeScreen(
    s: DeepReadonly<CaromState>,
    screen: "countdown" | "playing",
  ): CaromState;
  setScore(s: DeepReadonly<CaromState>, p1: number, p2: number): CaromState;
  setWinner(s: DeepReadonly<CaromState>, side: Side | null): CaromState;
  setReceiver(s: DeepReadonly<CaromState>, side: Side): CaromState;
  setPaddleCy(s: DeepReadonly<CaromState>, side: Side, cy: number): CaromState;
  setPaddleVy(s: DeepReadonly<CaromState>, side: Side, vy: number): CaromState;
  setPaddleDriven(
    s: DeepReadonly<CaromState>,
    side: Side,
    driven: boolean,
  ): CaromState;
  setBallPosition(
    s: DeepReadonly<CaromState>,
    x: number,
    y: number,
  ): CaromState;
  setBallVelocity(
    s: DeepReadonly<CaromState>,
    vx: number,
    vy: number,
  ): CaromState;
  setBallSpin(s: DeepReadonly<CaromState>, spin: number): CaromState;
  setBallHeld(s: DeepReadonly<CaromState>, held: boolean): CaromState;
  setBallHoldTimer(s: DeepReadonly<CaromState>, seconds: number): CaromState;
  setBallServeSign(s: DeepReadonly<CaromState>, sign: 1 | -1): CaromState;
  drawBallServeSign(s: DeepReadonly<CaromState>): CaromState;
  setAiTracking(s: DeepReadonly<CaromState>, enabled: boolean): CaromState;
  setAiMovement(s: DeepReadonly<CaromState>, enabled: boolean): CaromState;
  setMuted(s: DeepReadonly<CaromState>, muted: boolean): CaromState;
  snapshot(s: DeepReadonly<CaromState>): CaromSnapshot;
  menuItemRect(
    s: DeepReadonly<CaromState>,
    index: number,
  ): { x: number; y: number; w: number; h: number } | null;
}

export const BACKGROUND = "#080d18";
const C = {
  ink: "#e9f2ff",
  dim: "#8090a8",
  cyan: "#45e5d0",
  coral: "#ff6f7d",
  gold: "#ffd166",
  obstacle: "#a98bff",
  panel: "#111b2c",
};
const freshSign = (): 1 | -1 => (Math.random() < 0.5 ? -1 : 1);
const paddle = (cy = FIELD_CY): PaddleState => ({
  cy,
  vy: 0,
  driven: false,
  drivenVy: 0,
});
const ballHome = (): BallState => ({
  x: FIELD_CX,
  y: FIELD_CY,
  vx: 0,
  vy: 0,
  spin: 0,
  held: true,
  holdTimer: HOLD_TIME,
  serveSign: freshSign(),
  trail: [],
});
const obstacle = (index: number): ObstacleState => ({
  index,
  cx: OBSTACLE_CENTERS[index]!.x,
  cy: OBSTACLE_CENTERS[index]!.y,
});
const initial = (muted = false): CaromState => ({
  screen: "title",
  mode: "solo",
  menuIndex: 0,
  titleIndex: 0,
  resumeScreen: "playing",
  score: { p1: 0, p2: 0 },
  winner: null,
  paddles: { left: paddle(), right: paddle() },
  ai: { tracking: true, movement: true },
  receiver: "left",
  ball: ballHome(),
  obstacles: [obstacle(0), obstacle(1)],
  simTime: 0,
  muted,
});
const clamp = (n: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, n));
const sign = (): 1 | -1 => freshSign();
const withBall = (
  s: DeepReadonly<CaromState>,
  f: (b: BallState) => BallState,
): CaromState => {
  if (!s.ball) throw new Error("Carom: no ball is present");
  return { ...s, ball: f(s.ball as BallState) };
};
const rectFor = (
  screen: Screen,
  index: number,
): { x: number; y: number; w: number; h: number } | null => {
  const items =
    screen === "title"
      ? TITLE_ITEMS
      : screen === "paused"
        ? PAUSE_ITEMS
        : screen === "matchover"
          ? MATCHOVER_ITEMS
          : screen === "howto"
            ? ["BACK TO TITLE"]
            : [];
  return index >= 0 && index < items.length
    ? {
        x: 440,
        y:
          (screen === "title" ? 345 : screen === "howto" ? 575 : 390) +
          index * 66,
        w: 400,
        h: 52,
      }
    : null;
};
const serve = (b: BallState, receiver: Side): BallState => {
  const dir = receiver === "left" ? -1 : 1;
  return {
    ...b,
    vx: dir * SERVE_SPEED * Math.cos(SERVE_ANGLE),
    vy: b.serveSign * SERVE_SPEED * Math.sin(SERVE_ANGLE),
    held: false,
    holdTimer: 0,
    trail: [],
  };
};
const park = (): BallState => ballHome();
const startMatch = (s: DeepReadonly<CaromState>, mode: Mode): CaromState => ({
  ...s,
  screen: "countdown",
  mode,
  menuIndex: 0,
  resumeScreen: "playing",
  score: { p1: 0, p2: 0 },
  winner: null,
  receiver: "left",
  ball: park(),
  paddles: { left: paddle(), right: paddle() },
});
const backToTitle = (s: DeepReadonly<CaromState>): CaromState => ({
  ...initial(s.muted),
  titleIndex: s.titleIndex,
  menuIndex: s.titleIndex,
  simTime: s.simTime,
});
const menuLength = (screen: Screen): number =>
  screen === "title"
    ? TITLE_ITEMS.length
    : screen === "paused"
      ? PAUSE_ITEMS.length
      : screen === "matchover"
        ? MATCHOVER_ITEMS.length
        : screen === "howto"
          ? 1
          : 0;
const moveMenu = (s: CaromState, dir: -1 | 1): CaromState => ({
  ...s,
  menuIndex: (s.menuIndex + dir + menuLength(s.screen)) % menuLength(s.screen),
});
const choose = (s: CaromState): CaromState => {
  if (s.screen === "title") {
    const titleIndex = s.menuIndex;
    if (titleIndex === 0 || titleIndex === 1)
      return {
        ...startMatch(s, titleIndex === 0 ? "solo" : "versus"),
        titleIndex,
      };
    return { ...s, screen: "howto", titleIndex, menuIndex: 0 };
  }
  if (s.screen === "howto") return backToTitle(s);
  if (s.screen === "paused")
    return s.menuIndex === 0
      ? { ...s, screen: s.resumeScreen }
      : s.menuIndex === 1
        ? startMatch(s, s.mode)
        : backToTitle(s);
  if (s.screen === "matchover")
    return s.menuIndex === 0 ? startMatch(s, s.mode) : backToTitle(s);
  return s;
};
function movePaddle(p: PaddleState, vy: number, dt: number): PaddleState {
  const cy = clamp(p.cy + vy * dt, PADDLE_MIN_CY, PADDLE_MAX_CY);
  return { ...p, cy, vy: dt > 0 ? (cy - p.cy) / dt : vy };
}
function advanceBall(
  b0: BallState,
  paddles: CaromState["paddles"],
  obstacles: readonly ObstacleState[],
  dt: number,
  now: number,
): { ball: BallState; events: Set<string>; scored: boolean } {
  let b = { ...b0, trail: [...b0.trail] };
  const events = new Set<string>();
  const speed0 = Math.hypot(b.vx, b.vy);
  const n = Math.max(1, Math.ceil((speed0 * dt) / MAX_SUBSTEP));
  const h = dt / n;
  for (let step = 0; step < n; step++) {
    const speed = Math.hypot(b.vx, b.vy);
    if (speed > 0) {
      const a = (b.spin / speed) * h;
      const c = Math.cos(a);
      const sn = Math.sin(a);
      [b.vx, b.vy] = [b.vx * c - b.vy * sn, b.vx * sn + b.vy * c];
    }
    b.spin *= 0.5 ** (h / SPIN_HALFLIFE);
    b.x += b.vx * h;
    b.y += b.vy * h;
    if (b.y - BALL_R < 0 && b.vy < 0) {
      b.y = BALL_R;
      b.vy = -b.vy;
      events.add(CUES.wallBounce);
    } else if (b.y + BALL_R > FIELD_H && b.vy > 0) {
      b.y = FIELD_H - BALL_R;
      b.vy = -b.vy;
      events.add(CUES.wallBounce);
    }
    for (const side of ["left", "right"] as const) {
      const p = paddles[side];
      const x0 = side === "left" ? P1_X0 : P2_X0;
      const x1 = side === "left" ? P1_X1 : P2_X1;
      const y0 = p.cy - PADDLE_HALF;
      const y1 = p.cy + PADDLE_HALF;
      if (
        b.x < x1 + BALL_R &&
        b.x > x0 - BALL_R &&
        b.y > y0 - BALL_R &&
        b.y < y1 + BALL_R
      ) {
        const depths = [
          b.x - (x0 - BALL_R),
          x1 + BALL_R - b.x,
          b.y - (y0 - BALL_R),
          y1 + BALL_R - b.y,
        ];
        const face = depths.indexOf(Math.min(...depths));
        if (face < 2) {
          const offset = clamp((b.y - p.cy) / PADDLE_HALF, -1, 1);
          const theta = offset * MAX_BOUNCE_ANGLE;
          const newSpeed = Math.min(
            Math.hypot(b.vx, b.vy) * SPEED_MULT,
            SPEED_CAP,
          );
          const dir = side === "left" ? 1 : -1;
          b = {
            ...b,
            x: side === "left" ? P1_X1 + BALL_R : P2_X0 - BALL_R,
            vx: dir * newSpeed * Math.cos(theta),
            vy: newSpeed * Math.sin(theta),
            spin: clamp(
              b.spin + p.vy * SPIN_FROM_PADDLE,
              -SPIN_CLAMP,
              SPIN_CLAMP,
            ),
          };
          events.add(CUES.paddleHit);
        } else {
          b = {
            ...b,
            y: face === 2 ? y0 - BALL_R : y1 + BALL_R,
            vy:
              (face === 2 && b.vy > 0) || (face === 3 && b.vy < 0)
                ? -b.vy
                : b.vy,
          };
          events.add(CUES.wallBounce);
        }
      }
    }
    for (const o of obstacles) {
      const r = OBSTACLES[o.index]!;
      if (
        b.x > r.x0 - BALL_R &&
        b.x < r.x1 + BALL_R &&
        b.y > r.y0 - BALL_R &&
        b.y < r.y1 + BALL_R
      ) {
        const depths = [
          b.x - (r.x0 - BALL_R),
          r.x1 + BALL_R - b.x,
          b.y - (r.y0 - BALL_R),
          r.y1 + BALL_R - b.y,
        ];
        const face = depths.indexOf(Math.min(...depths));
        if (face === 0) {
          b.x = r.x0 - BALL_R;
          if (b.vx > 0) b.vx = -b.vx;
        }
        if (face === 1) {
          b.x = r.x1 + BALL_R;
          if (b.vx < 0) b.vx = -b.vx;
        }
        if (face === 2) {
          b.y = r.y0 - BALL_R;
          if (b.vy > 0) b.vy = -b.vy;
        }
        if (face === 3) {
          b.y = r.y1 + BALL_R;
          if (b.vy < 0) b.vy = -b.vy;
        }
        events.add(CUES.obstacleBounce);
      }
    }
  }
  const scored = b.x - BALL_R > FIELD_W || b.x + BALL_R < 0;
  const trail = scored ? b.trail : [...b.trail, { x: b.x, y: b.y, t: now }];
  return { ball: { ...b, trail }, events, scored };
}

export const game: Game<CaromState, CaromDebugApi> = {
  initialize(api: InitApi<CaromState>): [CaromState, CaromDebugApi] {
    for (const name of ACTIONS)
      api.input.register(name, { keys: [...BINDINGS[name]] });
    api.audio.define(CUES.paddleHit, {
      wave: "triangle",
      freq: 570,
      freqTo: 320,
      durationMs: 55,
      gain: 0.16,
    });
    api.audio.define(CUES.wallBounce, {
      wave: "sine",
      freq: 300,
      freqTo: 220,
      durationMs: 65,
      gain: 0.13,
    });
    api.audio.define(CUES.obstacleBounce, {
      wave: "square",
      freq: 440,
      freqTo: 260,
      durationMs: 80,
      gain: 0.1,
    });
    api.audio.define(CUES.score, {
      wave: "triangle",
      freq: 520,
      freqTo: 880,
      durationMs: 220,
      gain: 0.2,
    });
    const reads: Record<
      string,
      (s: DeepReadonly<CaromState>) => string | number | boolean
    > = {
      screen: (s) => s.screen,
      mode: (s) => s.mode,
      "score p1": (s) => s.score.p1,
      "score p2": (s) => s.score.p2,
      "ball x": (s) => s.ball?.x ?? "none",
      "ball y": (s) => s.ball?.y ?? "none",
      "ball vx": (s) => s.ball?.vx ?? "none",
      "ball vy": (s) => s.ball?.vy ?? "none",
      "ball speed": (s) => (s.ball ? Math.hypot(s.ball.vx, s.ball.vy) : "none"),
      "ball spin": (s) => s.ball?.spin ?? "none",
      "left cy": (s) => s.paddles.left.cy,
      "left vy": (s) => s.paddles.left.vy,
      "right cy": (s) => s.paddles.right.cy,
      "right vy": (s) => s.paddles.right.vy,
    };
    for (const [name, read] of Object.entries(reads))
      api.diagnostics.register(name, read);
    const debug: CaromDebugApi = {
      version: CAROM_DEBUG_VERSION,
      clearWorld: (s) => ({ ...s, ball: null, obstacles: [] }),
      spawnBall: (s) => ({ ...s, ball: park() }),
      spawnObstacle: (s, i) => {
        if (i !== 0 && i !== 1)
          throw new RangeError(`Carom: invalid obstacle index ${i}`);
        return {
          ...s,
          obstacles: [
            ...s.obstacles.filter((o) => o.index !== i),
            obstacle(i),
          ].sort((a, b) => a.index - b.index),
        };
      },
      reset: (s) => initial(s.muted),
      reconcile: (s) => ({ ...s }),
      setScreen: (s, screen) => ({ ...s, screen }),
      setMode: (s, mode) => ({ ...s, mode }),
      setMenuIndex: (s, menuIndex) => ({ ...s, menuIndex }),
      setTitleIndex: (s, titleIndex) => ({ ...s, titleIndex }),
      setResumeScreen: (s, resumeScreen) => ({ ...s, resumeScreen }),
      setScore: (s, p1, p2) => ({ ...s, score: { p1, p2 } }),
      setWinner: (s, winner) => ({ ...s, winner }),
      setReceiver: (s, receiver) => ({ ...s, receiver }),
      setPaddleCy: (s, side, cy) => ({
        ...s,
        paddles: { ...s.paddles, [side]: { ...s.paddles[side], cy } },
      }),
      setPaddleVy: (s, side, drivenVy) => ({
        ...s,
        paddles: { ...s.paddles, [side]: { ...s.paddles[side], drivenVy } },
      }),
      setPaddleDriven: (s, side, driven) => ({
        ...s,
        paddles: { ...s.paddles, [side]: { ...s.paddles[side], driven } },
      }),
      setBallPosition: (s, x, y) => withBall(s, (b) => ({ ...b, x, y })),
      setBallVelocity: (s, vx, vy) => withBall(s, (b) => ({ ...b, vx, vy })),
      setBallSpin: (s, spin) => withBall(s, (b) => ({ ...b, spin })),
      setBallHeld: (s, held) => withBall(s, (b) => ({ ...b, held })),
      setBallHoldTimer: (s, holdTimer) =>
        withBall(s, (b) => ({ ...b, holdTimer })),
      setBallServeSign: (s, serveSign) =>
        withBall(s, (b) => ({ ...b, serveSign })),
      drawBallServeSign: (s) =>
        withBall(s, (b) => ({ ...b, serveSign: sign() })),
      setAiTracking: (s, tracking) => ({ ...s, ai: { ...s.ai, tracking } }),
      setAiMovement: (s, movement) => ({ ...s, ai: { ...s.ai, movement } }),
      setMuted: (s, muted) => ({ ...s, muted }),
      snapshot: (s) => ({
        ...s,
        score: { ...s.score },
        paddles: { left: { ...s.paddles.left }, right: { ...s.paddles.right } },
        ai: { ...s.ai },
        version: CAROM_DEBUG_VERSION,
        ball: s.ball
          ? {
              ...s.ball,
              trail: s.ball.trail.map((sample) => ({ ...sample })),
              speed: Math.hypot(s.ball.vx, s.ball.vy),
            }
          : null,
        obstacles: s.obstacles.map((item) => ({ ...item })),
      }),
      menuItemRect: (s, index) => rectFor(s.screen, index),
    };
    return [initial(), debug];
  },
  update(state, api: UpdateApi, dt): CaromState {
    let s: CaromState = {
      ...state,
      simTime: state.simTime + dt,
      paddles: {
        left: { ...state.paddles.left },
        right: { ...state.paddles.right },
      },
      score: { ...state.score },
    };
    const input = api.input;
    if (input.pressed("mute")) {
      const muted = !api.audio.muted();
      api.audio.setMuted(muted);
      s = { ...s, muted };
    } else if (s.muted !== api.audio.muted())
      s = { ...s, muted: api.audio.muted() };
    const p1Up = input.value("p1-up") || input.value("p2-up");
    const p1Down = input.value("p1-down") || input.value("p2-down");
    const p1UpEdge = input.pressed("p1-up");
    const p2UpEdge = input.pressed("p2-up");
    const p1DownEdge = input.pressed("p1-down");
    const p2DownEdge = input.pressed("p2-down");
    const edges = {
      up: p1UpEdge || p2UpEdge,
      down: p1DownEdge || p2DownEdge,
      confirm: input.pressed("confirm"),
      back: input.pressed("back"),
      pause: input.pressed("pause"),
    };
    // Read all action edges once; movement edges are available even when a key is not otherwise used.
    const startScreen = s.screen;
    if (["countdown", "playing", "paused"].includes(s.screen) && edges.pause) {
      s =
        s.screen === "paused"
          ? { ...s, screen: s.resumeScreen }
          : {
              ...s,
              screen: "paused",
              resumeScreen: s.screen as "countdown" | "playing",
              menuIndex: 0,
            };
    } else if (s.screen === "paused" && edges.back)
      s = { ...s, screen: s.resumeScreen };
    else if (s.screen === "howto" && (edges.confirm || edges.back))
      s = backToTitle(s);
    else if (s.screen === "matchover" && edges.back) s = backToTitle(s);
    else if (menuLength(s.screen) > 0) {
      if (edges.up) s = moveMenu(s, -1);
      else if (edges.down) s = moveMenu(s, 1);
      else if (edges.confirm) s = choose(s);
      const pointer = input.pointer();
      const samples = input.pointerSamples();
      if (["mouse", "pen"].includes(pointer.device)) {
        const idx = Array.from(
          { length: menuLength(s.screen) },
          (_, i) => i,
        ).find((i) => {
          const r = rectFor(s.screen, i);
          return (
            !!r &&
            pointer.x >= r.x &&
            pointer.x <= r.x + r.w &&
            pointer.y >= r.y &&
            pointer.y <= r.y + r.h
          );
        });
        if (idx !== undefined) s = { ...s, menuIndex: idx };
      }
      const downs = samples.filter((v) => v.primary && v.type === "down");
      const ups = samples.filter((v) => v.primary && v.type === "up");
      const hit = (x: number, y: number): number =>
        Array.from({ length: menuLength(s.screen) }, (_, i) => i).find((i) => {
          const r = rectFor(s.screen, i);
          return (
            !!r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h
          );
        }) ?? -1;
      for (const sample of [
        ...downs,
        ...samples.filter((v) => v.primary && v.type === "move"),
      ]) {
        const i = hit(sample.x, sample.y);
        if (i >= 0) s = { ...s, menuIndex: i };
      }
      if (
        !edges.confirm &&
        downs.length &&
        ups.length &&
        hit(downs[0]!.x, downs[0]!.y) >= 0 &&
        hit(ups[ups.length - 1]!.x, ups[ups.length - 1]!.y) ===
          hit(downs[0]!.x, downs[0]!.y)
      ) {
        s = { ...s, menuIndex: hit(downs[0]!.x, downs[0]!.y) };
        s = choose(s);
      }
    }
    if (
      startScreen === "title" &&
      s.screen !== "title" &&
      s.titleIndex !== state.titleIndex
    )
      s = { ...s, titleIndex: s.titleIndex };
    if (s.screen !== "playing" && s.screen !== "countdown") return s;
    const left = s.paddles.left;
    const right = s.paddles.right;
    const leftVy = left.driven
      ? left.drivenVy
      : (s.mode === "solo"
          ? p1Down - p1Up
          : input.value("p1-down") - input.value("p1-up")) * PADDLE_SPEED;
    let rightVy = right.driven
      ? right.drivenVy
      : input.value("p2-down") * PADDLE_SPEED -
        input.value("p2-up") * PADDLE_SPEED;
    if (!right.driven && s.mode === "solo" && s.ai.movement) {
      let target = AI_HOME_Y;
      let deadzone = AI_HOME_DEADZONE;
      if (s.screen === "playing" && s.ai.tracking && s.ball && s.ball.vx > 0) {
        target = s.ball.y - s.ball.vy * AI_REACT;
        deadzone = AI_DEADZONE;
      }
      const diff = target - right.cy;
      rightVy =
        Math.abs(diff) <= deadzone
          ? 0
          : Math.sign(diff) *
            Math.min(AI_SPEED, Math.abs(diff) / Math.max(dt, 0.000001));
    } else if (!right.driven && s.mode === "solo" && !s.ai.movement)
      rightVy = 0;
    const paddles = {
      left: movePaddle(left, leftVy, dt),
      right: movePaddle(right, rightVy, dt),
    };
    s = { ...s, paddles };
    if (!s.ball) return s;
    let ball = { ...s.ball };
    if (s.screen === "countdown") {
      const holdTimer = ball.holdTimer - dt;
      if (holdTimer <= 0) {
        ball = serve({ ...ball, holdTimer: 0 }, s.receiver);
        s = { ...s, screen: "playing" };
      } else ball = { ...ball, holdTimer };
      ball = {
        ...ball,
        trail: [...ball.trail, { x: ball.x, y: ball.y, t: s.simTime }].filter(
          (t) => s.simTime - t.t <= TRAIL_TIME,
        ),
      };
      return { ...s, ball };
    }
    const advanced = advanceBall(ball, paddles, s.obstacles, dt, s.simTime);
    ball = {
      ...advanced.ball,
      trail: advanced.ball.trail.filter((t) => s.simTime - t.t <= TRAIL_TIME),
    };
    for (const cue of advanced.events) api.audio.play(cue);
    if (advanced.scored) {
      api.audio.play(CUES.score);
      const p1 = s.score.p1 + (ball.x - BALL_R > FIELD_W ? 1 : 0);
      const p2 = s.score.p2 + (ball.x + BALL_R < 0 ? 1 : 0);
      const winner: Side | null =
        p1 >= WIN_SCORE && p1 - p2 >= WIN_LEAD
          ? "left"
          : p2 >= WIN_SCORE && p2 - p1 >= WIN_LEAD
            ? "right"
            : null;
      if (winner)
        return {
          ...s,
          ball,
          score: { p1, p2 },
          winner,
          screen: "matchover",
          menuIndex: 0,
        };
      return {
        ...s,
        ball: park(),
        score: { p1, p2 },
        receiver: ball.x - BALL_R > FIELD_W ? "right" : "left",
        screen: "countdown",
      };
    }
    return { ...s, ball };
  },
  render(state, { ctx }: RenderApi): void {
    const c = ctx;
    c.fillStyle = BACKGROUND;
    c.fillRect(0, 0, FIELD_W, FIELD_H);
    const live =
      state.screen === "playing" ||
      state.screen === "countdown" ||
      state.screen === "paused" ||
      state.screen === "matchover";
    c.save();
    if (!live) c.globalAlpha = 0.38;
    c.strokeStyle = "#26344a";
    c.lineWidth = 2;
    c.setLineDash([10, 14]);
    c.beginPath();
    c.moveTo(NET_X, 0);
    c.lineTo(NET_X, FIELD_H);
    c.stroke();
    c.setLineDash([]);
    for (const o of state.obstacles) {
      c.fillStyle = C.obstacle;
      c.shadowColor = C.obstacle;
      c.shadowBlur = 18;
      roundRect(
        c,
        o.cx - OBSTACLE_W / 2,
        o.cy - OBSTACLE_H / 2,
        OBSTACLE_W,
        OBSTACLE_H,
        10,
      );
      c.fill();
    }
    drawPaddle(c, P1_X0, state.paddles.left.cy, C.cyan);
    drawPaddle(c, P2_X0, state.paddles.right.cy, C.coral);
    if (state.ball) {
      const trail = state.ball.trail;
      for (let i = 1; i < trail.length; i++) {
        c.beginPath();
        c.strokeStyle = `rgba(255,209,102,${0.08 + (0.6 * i) / trail.length})`;
        c.lineWidth = 2 + (7 * i) / trail.length;
        c.lineCap = "round";
        c.moveTo(trail[i - 1]!.x, trail[i - 1]!.y);
        c.lineTo(trail[i]!.x, trail[i]!.y);
        c.stroke();
      }
      c.shadowColor = C.gold;
      c.shadowBlur = 22;
      c.fillStyle = C.gold;
      c.beginPath();
      c.arc(state.ball.x, state.ball.y, BALL_R, 0, Math.PI * 2);
      c.fill();
      c.shadowBlur = 0;
    }
    c.restore();
    if (live) {
      c.textAlign = "center";
      c.fillStyle = C.ink;
      c.font = "700 42px ui-monospace, monospace";
      c.fillText(String(state.score.p1).padStart(2, "0"), 550, 86);
      c.fillText(String(state.score.p2).padStart(2, "0"), 730, 86);
      c.fillStyle = C.dim;
      c.font = "600 13px ui-monospace, monospace";
      c.fillText(
        state.mode === "solo" ? "SOLO // VS THE HOUSE" : "LOCAL VERSUS",
        FIELD_CX,
        115,
      );
    }
    if (state.screen === "title") {
      c.textAlign = "center";
      c.fillStyle = C.ink;
      c.font = "900 100px ui-monospace, monospace";
      c.fillText(TITLE_TEXT, FIELD_CX, 230);
      c.fillStyle = C.cyan;
      c.font = "600 17px ui-monospace, monospace";
      c.fillText("ANGLE. TIMING. SPIN.", FIELD_CX, 275);
      drawMenu(c, state, TITLE_ITEMS);
      c.fillStyle = C.dim;
      c.font = "14px ui-monospace, monospace";
      c.fillText(
        "W / S   MOVE     ENTER   SELECT     P   PAUSE     M   SOUND",
        FIELD_CX,
        650,
      );
    }
    if (state.screen === "howto") {
      panel(c);
      c.textAlign = "center";
      c.fillStyle = C.cyan;
      c.font = "800 40px ui-monospace, monospace";
      c.fillText("HOW TO PLAY", FIELD_CX, 170);
      c.fillStyle = C.ink;
      c.font = "18px ui-monospace, monospace";
      [
        "Move your paddle with W / S. Versus: arrows control player two.",
        "Meet the ball near the edge to choose your launch angle.",
        "Paddle motion adds spin. Spin curves the ball after contact.",
        "Use the violet bars for bank shots and changing angles.",
        "First to 11, win by 2. Press P or Escape to pause.",
      ].forEach((line, i) => c.fillText(line, FIELD_CX, 260 + i * 40));
      drawMenu(c, state, ["BACK TO TITLE"]);
    }
    if (state.screen === "countdown") {
      c.textAlign = "center";
      c.fillStyle = C.ink;
      c.font = "700 22px ui-monospace, monospace";
      c.fillText(
        `SERVE IN ${Math.max(1, Math.ceil(state.ball?.holdTimer ?? 0))}`,
        FIELD_CX,
        180,
      );
    }
    if (state.screen === "paused" || state.screen === "matchover") {
      panel(c);
      c.textAlign = "center";
      c.fillStyle = state.screen === "paused" ? C.gold : C.cyan;
      c.font = "900 42px ui-monospace, monospace";
      c.fillText(
        state.screen === "paused"
          ? "PAUSED"
          : `${state.winner === "left" ? "PLAYER ONE" : "PLAYER TWO"} WINS`,
        FIELD_CX,
        240,
      );
      if (state.screen === "matchover") {
        c.fillStyle = C.ink;
        c.font = "700 26px ui-monospace, monospace";
        c.fillText(`${state.score.p1}   —   ${state.score.p2}`, FIELD_CX, 300);
      }
      drawMenu(
        c,
        state,
        state.screen === "paused" ? PAUSE_ITEMS : MATCHOVER_ITEMS,
      );
    }
    c.textAlign = "left";
    c.fillStyle = C.dim;
    c.font = "12px ui-monospace, monospace";
    c.fillText(state.muted ? "SOUND OFF · M" : "SOUND ON · M", 28, 690);
  },
};

function roundRect(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
}
function drawPaddle(
  c: CanvasRenderingContext2D,
  x: number,
  cy: number,
  color: string,
): void {
  c.fillStyle = color;
  c.shadowColor = color;
  c.shadowBlur = 22;
  roundRect(c, x, cy - PADDLE_H / 2, PADDLE_W, PADDLE_H, 8);
  c.fill();
  c.shadowBlur = 0;
}
function panel(c: CanvasRenderingContext2D): void {
  c.fillStyle = "rgba(8,13,24,.88)";
  roundRect(c, 330, 145, 620, 440, 24);
  c.fill();
  c.strokeStyle = "#26364c";
  c.lineWidth = 2;
  c.stroke();
}
function drawMenu(
  c: CanvasRenderingContext2D,
  state: DeepReadonly<CaromState>,
  items: readonly string[],
): void {
  c.textAlign = "center";
  c.font = "700 20px ui-monospace, monospace";
  items.forEach((item, i) => {
    const r = rectFor(state.screen, i)!;
    const selected = i === state.menuIndex;
    c.fillStyle = selected ? C.ink : C.dim;
    if (selected) {
      c.fillStyle = "rgba(69,229,208,.12)";
      roundRect(c, r.x, r.y, r.w, r.h, 10);
      c.fill();
      c.strokeStyle = C.cyan;
      c.lineWidth = 1;
      c.stroke();
      c.fillStyle = C.cyan;
    } else c.fillStyle = C.dim;
    c.fillText(`${selected ? "›  " : "   "}${item}`, FIELD_CX, r.y + 33);
  });
}
