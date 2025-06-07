declare module 'canvas-confetti' {
  interface Options {
    particleCount?: number;
    spread?: number;
    origin?: { x?: number; y?: number };
    angle?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    colors?: string[];
    shapes?: string[];
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
    resize?: boolean;
  }

  interface ConfettiFunction {
    (options?: Options): void;
    reset: () => void;
    create: (canvas: HTMLCanvasElement, options?: { resize?: boolean }) => ConfettiFunction;
  }

  const confetti: ConfettiFunction;
  export default confetti;
}
