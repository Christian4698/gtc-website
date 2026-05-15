import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { trackEvent } from '@/lib/conversion';

/**
 * VideoBackground Component
 * Premium animated background video with viewport-based play/pause
 * and custom mute toggle
 */
export default function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  // Intersection Observer: Play/Pause basé sur la visibilité
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {
            // Autoplay peut être bloqué, c'est normal
          });
        } else {
          videoRef.current?.pause();
        }
      },
      { threshold: 0.25 } // Déclenche quand 25% de la vidéo est visible
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    trackEvent('video_mute_toggle', { is_muted: !isMuted });
  };

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-lg overflow-hidden shadow-2xl group"
    >
      {/* Vidéo responsive sans contrôles */}
      <video
        ref={videoRef}
        src="/manus-storage/VisuelGTC-optimized_feef3f80.mp4"
        className="w-full h-auto block"
        autoPlay
        muted={isMuted}
        loop
        playsInline
        poster="https://d2xsxph8kpxj0f.cloudfront.net/310519663413637315/kBiKHbrxPVYSgtRurEjNTe/gtc-hero-premium-4VQyJAEy7K3VoxDJ4e7Qdt.webp"
        onPlay={() => trackEvent('video_play', { video_name: 'gtc_hero_intro', location: 'home_hero' })}
        controlsList="nodownload"
      />

      {/* Bouton mute/unmute custom - Apparaît au hover */}
      <button
        onClick={handleMuteToggle}
        className="absolute bottom-4 right-4 bg-[#1E90FF]/80 hover:bg-[#1E90FF] text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm opacity-0 group-hover:opacity-100 shadow-lg"
        title={isMuted ? 'Activer le son' : 'Désactiver le son'}
        aria-label={isMuted ? 'Unmute video' : 'Mute video'}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
    </div>
  );
}
