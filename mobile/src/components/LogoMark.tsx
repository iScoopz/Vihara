import Svg, { Circle, ClipPath, Defs, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

/** The lotus-and-rising-sun seal (assets/images/logo-mark.svg) as a native vector. */
export function LogoMark({ size = 72 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 1024 1024">
      <Defs>
        <RadialGradient id="lmSun" cx="50%" cy="38%" r="62%">
          <Stop offset="0" stopColor="#fff1c4" />
          <Stop offset="0.45" stopColor="#f2c15a" />
          <Stop offset="1" stopColor="#cf8a26" />
        </RadialGradient>
        <RadialGradient id="lmGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#f2c15a" stopOpacity="0.45" />
          <Stop offset="1" stopColor="#f2c15a" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="lmPetal" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#3b2257" />
          <Stop offset="1" stopColor="#1c0f2c" />
        </LinearGradient>
        <ClipPath id="lmAbove">
          <Rect x="0" y="0" width="1024" height="700" />
        </ClipPath>
      </Defs>
      <Circle cx="512" cy="520" r="360" fill="url(#lmGlow)" />
      <Circle cx="512" cy="540" r="236" fill="url(#lmSun)" clipPath="url(#lmAbove)" />
      <G stroke="#f2c15a" strokeWidth={12} strokeLinejoin="round" fill="url(#lmPetal)">
        <Path d="M512 742 C 400 690, 300 600, 236 486 C 352 500, 452 576, 512 742 Z" />
        <Path d="M512 742 C 624 690, 724 600, 788 486 C 672 500, 572 576, 512 742 Z" />
        <Path d="M512 742 C 420 660, 372 540, 384 404 C 456 470, 506 590, 512 742 Z" />
        <Path d="M512 742 C 604 660, 652 540, 640 404 C 568 470, 518 590, 512 742 Z" />
        <Path d="M512 742 C 448 640, 446 492, 512 352 C 578 492, 576 640, 512 742 Z" />
      </G>
      <G stroke="#f2c15a" strokeLinecap="round" fill="none">
        <Path d="M300 792 C 400 772, 624 772, 724 792" strokeWidth={14} />
        <Path d="M372 846 C 452 830, 572 830, 652 846" strokeWidth={10} strokeOpacity={0.7} />
      </G>
    </Svg>
  );
}
