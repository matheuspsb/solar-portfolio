import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { browserFrameScheduler } from '@/hooks/frame-scheduler';
import type { FrameScheduler } from '@/hooks/frame-scheduler';
import { getStepSounds } from '../audio/step-sounds';
import type { SoundName } from '../audio/sound-specs';
import { MAX_DEVICE_PIXEL_RATIO } from '../engine/constants';
import { getPixelScale } from '../engine/play-field';
import type { FireMode } from '../engine/shots';
import { getHudSnapshot, isSameHudSnapshot } from '../hud/hud-snapshot';
import type { HudSnapshot } from '../hud/hud-snapshot';
import { drawGame } from '../render/draw-game';
import type { RunResult } from '../results/run-result';
import { applySessionCommand } from '../session/apply-command';
import { getKeyboardDirection, interpretKey, normalizeKey, trackKey } from '../session/keyboard';
import type { SessionCommand } from '../session/keyboard';
import { aimFromPointer, startDrag } from '../session/pointer-aim';
import { aimSession, createSession, resizeSession } from '../session/session';
import { advanceGame, createGameState } from './advance-game';
import type { GameState } from './advance-game';

const MILLISECONDS_PER_SECOND = 1000;
const SCROLLING_KEYS = new Set(['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'space']);
const ACTIVATION_KEYS = new Set(['enter', 'space']);

type UseGameSessionOptions = {
  mode: FireMode;
  previousBest: number;
  reducedMotion: boolean;
  onFinish: (result: RunResult) => void;
  onQuit: () => void;
  onToggleSound: () => void;
  onSound: (name: SoundName) => void;
  scheduler?: FrameScheduler;
};

type GameSessionApi = {
  stageRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  hud: HudSnapshot | null;
  sendCommand: (command: SessionCommand) => void;
};

export function useGameSession({
  mode,
  previousBest,
  reducedMotion,
  onFinish,
  onQuit,
  onToggleSound,
  onSound,
  scheduler = browserFrameScheduler,
}: UseGameSessionOptions): GameSessionApi {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState | null>(null);
  const [hud, setHud] = useState<HudSnapshot | null>(null);

  const readReducedMotion = useEffectEvent(() => reducedMotion);
  const playSound = useEffectEvent((name: SoundName) => onSound(name));
  const finish = useEffectEvent((result: RunResult) => onFinish(result));
  const readPreviousBest = useEffectEvent(() => previousBest);

  const sendCommand = (command: SessionCommand) => {
    if (command === 'quit') {
      onQuit();
      return;
    }
    if (command === 'toggleSound') {
      onToggleSound();
      return;
    }
    const state = stateRef.current;
    if (state === null) return;
    stateRef.current = { ...state, session: applySessionCommand(state.session, command) };
  };
  const runCommand = useEffectEvent(sendCommand);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!stage || !canvas || !context) return;

    const fontFamily = getComputedStyle(canvas).fontFamily;
    let pixelRatio = 1;
    let pressedKeys: ReadonlySet<string> = new Set();
    let hasReportedFinish = false;
    let lastHud: HudSnapshot | null = null;
    let shotCount = 0;

    stateRef.current = null;

    const measure = () => {
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      if (width === 0 || height === 0) return;
      pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      const field = { width, height };
      const state = stateRef.current;
      stateRef.current =
        state === null
          ? createGameState(createSession({ field, mode, previousBest: readPreviousBest() }))
          : { ...state, session: resizeSession(state.session, field) };
    };

    const render = (state: GameState) => {
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      drawGame(
        context,
        { ...state, random: Math.random },
        {
          width: state.session.field.width,
          height: state.session.field.height,
          pixelScale: getPixelScale(state.session.field.width),
          fontFamily,
        },
      );
    };

    const syncHud = (state: GameState) => {
      const next = getHudSnapshot(state.session);
      if (lastHud !== null && isSameHudSnapshot(lastHud, next)) return;
      lastHud = next;
      setHud(next);
    };

    const reportFinish = (state: GameState) => {
      const { result } = state.session;
      const isFinished = state.session.phase === 'finished' && result !== null;
      if (!isFinished) {
        hasReportedFinish = false;
        return;
      }
      if (hasReportedFinish) return;
      hasReportedFinish = true;
      finish(result);
    };

    let lastFrameMs = scheduler.now();
    let handle = 0;
    const tick = (nowMs: number) => {
      const deltaSeconds = (nowMs - lastFrameMs) / MILLISECONDS_PER_SECOND;
      lastFrameMs = nowMs;
      const state = stateRef.current;
      if (state !== null) {
        const advanced = advanceGame({
          state,
          deltaSeconds,
          direction: getKeyboardDirection(pressedKeys),
          random: Math.random,
          reducedMotion: readReducedMotion(),
        });
        stateRef.current = advanced.state;
        const stepSounds = getStepSounds({
          before: state.session,
          after: advanced.state.session,
          events: advanced.events,
          shotCount,
        });
        shotCount = stepSounds.shotCount;
        stepSounds.sounds.forEach(playSound);
        render(advanced.state);
        syncHud(advanced.state);
        reportFinish(advanced.state);
      }
      handle = scheduler.request(tick);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const phase = stateRef.current?.session.phase;
      if (phase === undefined) return;
      const key = normalizeKey(event.key);
      pressedKeys = trackKey(pressedKeys, event.key, true);
      const isButtonTarget = event.target instanceof HTMLButtonElement;
      if (SCROLLING_KEYS.has(key) && !isButtonTarget) event.preventDefault();
      const command = interpretKey({ key: event.key, phase });
      if (command === null || event.repeat) return;
      if (ACTIVATION_KEYS.has(key) && isButtonTarget) return;
      event.preventDefault();
      runCommand(command);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      pressedKeys = trackKey(pressedKeys, event.key, false);
    };

    const releaseKeys = () => {
      pressedKeys = new Set();
    };

    const pauseWhenHidden = () => {
      if (document.hidden) runCommand('pause');
      releaseKeys();
    };

    let drag: { x: number; y: number } | null = null;

    const getPointerPoint = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    };

    const aimAt = (event: PointerEvent) => {
      const state = stateRef.current;
      if (state === null) return;
      const target = aimFromPointer({
        pointerType: event.pointerType,
        point: getPointerPoint(event),
        drag,
      });
      if (target === null) return;
      stateRef.current = { ...state, session: aimSession(state.session, target) };
    };

    const handlePointerDown = (event: PointerEvent) => {
      const state = stateRef.current;
      if (state !== null && event.pointerType !== 'mouse') {
        drag = startDrag(state.session.drone, getPointerPoint(event));
        canvas.setPointerCapture(event.pointerId);
      }
      aimAt(event);
    };

    const endDrag = () => {
      drag = null;
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(stage);
    handle = scheduler.request(tick);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', pauseWhenHidden);
    document.addEventListener('visibilitychange', pauseWhenHidden);
    canvas.addEventListener('pointermove', aimAt);
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);

    return () => {
      scheduler.cancel(handle);
      resizeObserver.disconnect();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', pauseWhenHidden);
      document.removeEventListener('visibilitychange', pauseWhenHidden);
      canvas.removeEventListener('pointermove', aimAt);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerup', endDrag);
      canvas.removeEventListener('pointercancel', endDrag);
      stateRef.current = null;
    };
  }, [mode, scheduler]);

  return { stageRef, canvasRef, hud, sendCommand };
}
