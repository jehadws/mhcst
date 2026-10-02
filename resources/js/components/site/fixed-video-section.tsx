import { useSite } from '@/context/site-context';
import { useEffect, useRef, useState, type RefObject } from 'react';

type VideoControlsProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  captionsSrc?: string;
};

function PauseIcon() {
  return <span aria-hidden="true" className="h-3.5 w-2.5 border-x-2 border-current" />;
}

function PlayIcon() {
  return <span aria-hidden="true" className="ml-0.5 h-0 w-0 border-y-[7px] border-l-[10px] border-y-transparent border-l-current" />;
}

function CaptionsIcon() {
  return (
    <span aria-hidden="true" className="font-sans text-[10px] leading-none font-bold tracking-[-0.04em]">
      CC
    </span>
  );
}

function VideoControls({ videoRef, captionsSrc }: VideoControlsProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [captionsVisible, setCaptionsVisible] = useState(false);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      void video.play();
      setIsPaused(false);
    } else {
      video.pause();
      setIsPaused(true);
    }
  }

  function toggleCaptions() {
    const track = videoRef.current?.textTracks[0];
    if (!track) return;

    const nextMode = track.mode === 'showing' ? 'hidden' : 'showing';
    track.mode = nextMode;
    setCaptionsVisible(nextMode === 'showing');
  }

  return (
    <div className="absolute inset-x-auto end-6 bottom-6 z-10 flex gap-3 max-md:end-4 max-md:bottom-4">
      <button
        type="button"
        className="grid size-10 place-items-center rounded-full border border-white/20 bg-black/60 p-0 text-white transition-colors duration-150 hover:bg-black/[.78] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white motion-reduce:transition-none motion-reduce:hover:bg-black/60 max-md:size-10"
        aria-label={isPaused ? 'Play video' : 'Pause video'}
        aria-pressed={isPaused}
        onClick={togglePlayback}
      >
        {isPaused ? <PlayIcon /> : <PauseIcon />}
      </button>
      {captionsSrc ? (
        <button
          type="button"
          className="grid size-10 place-items-center rounded-full border border-white/20 bg-black/60 p-0 text-white transition-colors duration-150 hover:bg-black/[.78] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white motion-reduce:transition-none motion-reduce:hover:bg-black/60 max-md:size-10"
          aria-label={captionsVisible ? 'Hide captions' : 'Show captions'}
          aria-pressed={captionsVisible}
          onClick={toggleCaptions}
        >
          <CaptionsIcon />
        </button>
      ) : null}
    </div>
  );
}

interface FixedVideoSectionProps {
  src: string;
  poster: string;
  captionsSrc?: string;
}

export function FixedVideoSection({ src, poster, captionsSrc }: FixedVideoSectionProps) {
  const { t } = useSite();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const userPausedRef = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches) video.pause();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          video.pause();
          return;
        }
        if (!userPausedRef.current && !reducedMotion.matches) void video.play();
      },
      { threshold: 0.01 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-hero relative isolate h-[80svh] min-h-[80svh] w-full overflow-visible [clip-path:inset(0)] max-md:h-[60svh] max-md:min-h-[60svh] max-md:overflow-hidden"
      aria-label={t.videoSection.label}
    >
      <div className="pointer-events-none fixed inset-0 z-0 h-[100lvh] w-full max-md:absolute max-md:h-full">
        <video
          ref={videoRef}
          className="block size-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster}
          aria-hidden="true"
          onPause={() => {
            if (videoRef.current && document.activeElement?.tagName === 'BUTTON') userPausedRef.current = true;
          }}
        >
          <source src={src} type="video/mp4" />
          {captionsSrc ? <track kind="captions" src={captionsSrc} /> : null}
        </video>
      </div>
      <VideoControls videoRef={videoRef} captionsSrc={captionsSrc} />
    </section>
  );
}
