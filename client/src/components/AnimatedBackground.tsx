/**
 * AnimatedBackground Component
 * 
 * Lightweight looping video that behaves like a GIF:
 * - Autoplay on load
 * - Muted (no sound)
 * - Infinite loop
 * - No controls, no interaction
 * - Seamless animated effect
 * 
 * Technical: MP4 video for performance/quality
 * Visual: Appears as a GIF-like animated element
 */
export default function AnimatedBackground() {
  return (
    <div className="gtc-hero-media relative bg-black overflow-hidden shadow-2xl w-full">
      <video
        src="/assets/videos/Visuel_GTC.mp4"
        className="gtc-hero-media-video w-full h-auto block"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/assets/images/poster-hero.webp"
      />
      <div className="gtc-hero-media-overlay" aria-hidden="true" />
    </div>
  );
}
