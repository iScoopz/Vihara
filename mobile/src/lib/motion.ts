import { FadeInDown, FadeInRight } from 'react-native-reanimated';

/** Staggered list entrance: a short drop-in that guides the eye down the list once. */
export function enterDown(index: number, reduce: boolean) {
  if (reduce) return undefined;
  return FadeInDown.delay(Math.min(index, 8) * 55)
    .springify()
    .damping(18)
    .stiffness(180);
}

export function enterRight(index: number, reduce: boolean) {
  if (reduce) return undefined;
  return FadeInRight.delay(Math.min(index, 6) * 70)
    .springify()
    .damping(18)
    .stiffness(170);
}
