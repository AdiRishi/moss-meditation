import { Easing, FadeIn, FadeInUp, FadeOut, LinearTransition } from "react-native-reanimated";

/**
 * The Moss motion vocabulary. Every duration and curve lives here so sibling
 * screens move like one hand: quiet, unhurried, always answering the touch.
 *
 * Reduced motion means gentler, not gone: movement and stagger drop away,
 * opacity fades stay, because a hard cut is its own kind of loud.
 */

export const durations = {
  /** Press feedback arriving under the finger. */
  pressIn: 110,
  /** Press feedback releasing; the system may glide slightly slower. */
  pressOut: 170,
  /** heroui Button press (one config covers press and release). */
  buttonPress: 150,
  /** Content crossfades: state swaps, selection fills, month pages. */
  crossfade: 200,
  /** The outgoing half of a crossfade — exits step aside faster. */
  crossfadeOut: 150,
  /** Standard screen-content entrance. */
  entrance: 400,
  /** Entrance on rare, unhurried surfaces (launch, welcome, completion). */
  entranceSlow: 450,
  /** Entrance stagger between sibling blocks. */
  stagger: 70,
  /** Element exits (launch mark handing off to the app). */
  exit: 240,
  /** Layout easing to a new position (a banner arriving above a button). */
  glide: 250,
  /** Settling: the wind-down dim, the meditation ring's first draw. */
  settle: 900,
  /** Half of the 2.8s brand breath; the completion ring draws over one exhale. */
  halfBreath: 1400,
} as const;

export const easings = {
  /** Strong ease-out for entrances and anything answering the user. */
  enter: Easing.bezier(0.23, 1, 0.32, 1),
  /** Quick, plain ease-out for feedback and small exits. */
  exit: Easing.out(Easing.quad),
  /** Breath-family ease-in-out for on-screen movement and settling. */
  move: Easing.inOut(Easing.ease),
  /** Ring draws share one deceleration so every ensō closes the same way. */
  draw: Easing.out(Easing.cubic),
} as const;

/** Staggered rise for screen content. Reduced motion: one soft group fade. */
export function enterRise(order: number, reducedMotion: boolean) {
  return reducedMotion
    ? FadeIn.duration(250)
    : FadeInUp.duration(durations.entrance)
        .delay(order * durations.stagger)
        .easing(easings.enter);
}

/** Incoming half of a content crossfade. Opacity-only, so reduced-motion safe. */
export function crossfadeIn(delayMs = 0) {
  return FadeIn.duration(durations.crossfade).delay(delayMs).easing(easings.enter);
}

/** Outgoing half of a content crossfade. */
export function crossfadeOut() {
  return FadeOut.duration(durations.crossfadeOut).easing(easings.exit);
}

/** Ease a view toward its new layout instead of teleporting. */
export function glide(reducedMotion: boolean) {
  return reducedMotion ? undefined : LinearTransition.duration(durations.glide).easing(easings.move);
}

/**
 * Press feedback for heroui Buttons. The library default (300ms) reads mushy;
 * 150ms answers inside the press-feedback budget while keeping the library's
 * own curve and width-compensated scale.
 */
export const buttonPressAnimation = {
  scale: {
    value: 0.97,
    timingConfig: { duration: durations.buttonPress, easing: Easing.out(Easing.ease) },
  },
} as const;
