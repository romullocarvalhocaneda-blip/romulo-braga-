import { useState, useRef, useEffect, useCallback } from 'react';
import { AudioFile } from '../types';

export function useAudioEngine() {
  const [currentTrack, setCurrentTrack] = useState<AudioFile | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [aux1Volume, setAux1Volume] = useState(0.5);
  const [aux2Volume, setAux2Volume] = useState(0.5);
  const [isAux1Enabled, setIsAux1Enabled] = useState(true);
  const [isAux2Enabled, setIsAux2Enabled] = useState(true);
  
  const mainAudioRef = useRef<HTMLAudioElement | null>(null);
  const aux1AudioRef = useRef<HTMLAudioElement | null>(null);
  const aux2AudioRef = useRef<HTMLAudioElement | null>(null);
  const padsAudioRefs = useRef<Map<string | number, HTMLAudioElement>>(new Map());

  // Web Audio for Mic
  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const micGainNodeRef = useRef<GainNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const delayGainRef = useRef<GainNode | null>(null);

  const [micVolume, setMicVolume] = useState(0.8);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [isPlaybackEnabled, setIsPlaybackEnabled] = useState(true);
  const [isEchoEnabled, setIsEchoEnabled] = useState(false);
  const [activePadIds, setActivePadIds] = useState<Set<string | number>>(new Set());

  // Helper to ensure AudioContext and elements are ready
  const resumeAudio = useCallback(async () => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    // Some browsers require a play() call on any element to unlock audio
    if (mainAudioRef.current) {
      const p = mainAudioRef.current.play();
      if (p) p.then(() => mainAudioRef.current?.pause()).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handleInteraction = () => {
      resumeAudio();
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [resumeAudio]);

  useEffect(() => {
    mainAudioRef.current = new Audio();
    aux1AudioRef.current = new Audio();
    aux2AudioRef.current = new Audio();
    
    const onEnded = () => {
      setIsPlaying(false);
      window.dispatchEvent(new CustomEvent('track-ended'));
    };

    const onError = (e: any) => {
      const target = e.target as HTMLAudioElement;
      console.error("Audio Engine Error:", {
        error: e,
        src: target?.src,
        networkState: target?.networkState,
        readyState: target?.readyState
      });
      setIsPlaying(false);
      
      // Dispatch a more descriptive error
      window.dispatchEvent(new CustomEvent('track-error', { 
        detail: { 
          name: currentTrack?.name || 'Mídia externa', 
          url: target?.src,
          message: 'Não foi possível carregar o áudio. Verifique se o link ainda está ativo.'
        } 
      }));
    };

    mainAudioRef.current.addEventListener('timeupdate', () => setCurrentTime(mainAudioRef.current?.currentTime || 0));
    mainAudioRef.current.addEventListener('loadedmetadata', () => {
      setDuration(mainAudioRef.current?.duration || 0);
    });
    mainAudioRef.current.addEventListener('ended', onEnded);
    mainAudioRef.current.addEventListener('error', onError);

    return () => {
      mainAudioRef.current?.pause();
      aux1AudioRef.current?.pause();
      aux2AudioRef.current?.pause();
      if (micStreamRef.current) micStreamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  useEffect(() => {
    if (mainAudioRef.current) mainAudioRef.current.volume = isPlaybackEnabled ? volume : 0;
    if (aux1AudioRef.current) aux1AudioRef.current.volume = isAux1Enabled ? aux1Volume : 0;
    if (aux2AudioRef.current) aux2AudioRef.current.volume = isAux2Enabled ? aux2Volume : 0;
  }, [volume, aux1Volume, aux2Volume, isPlaybackEnabled, isAux1Enabled, isAux2Enabled]);

  useEffect(() => {
    if (micGainNodeRef.current) {
      micGainNodeRef.current.gain.value = isMicEnabled ? micVolume : 0;
    }
  }, [micVolume, isMicEnabled]);

  useEffect(() => {
    if (delayGainRef.current) {
      delayGainRef.current.gain.value = isEchoEnabled ? 0.4 : 0;
    }
  }, [isEchoEnabled]);

  const initMic = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      
      const ctx = audioContextRef.current;
      micSourceRef.current = ctx.createMediaStreamSource(stream);
      micGainNodeRef.current = ctx.createGain();
      
      delayNodeRef.current = ctx.createDelay();
      delayNodeRef.current.delayTime.value = 0.3;
      delayGainRef.current = ctx.createGain();
      delayGainRef.current.gain.value = isEchoEnabled ? 0.4 : 0;

      micSourceRef.current.connect(micGainNodeRef.current);
      micGainNodeRef.current.connect(delayNodeRef.current);
      delayNodeRef.current.connect(delayGainRef.current);
      delayGainRef.current.connect(micGainNodeRef.current);
      micGainNodeRef.current.connect(ctx.destination);
      
      setIsMicEnabled(true);
    } catch (err: any) {
      console.error("Erro ao acessar microfone:", err);
      setIsMicEnabled(false);
      window.dispatchEvent(new CustomEvent('mic-error', { 
        detail: { message: err.name === 'NotAllowedError' ? 'Permissão negada' : err.message } 
      }));
    }
  };

  const toggleMic = () => {
    if (!isMicEnabled && !micStreamRef.current) {
      initMic();
    } else {
      setIsMicEnabled(!isMicEnabled);
    }
  };

  const playAux = useCallback((index: 1 | 2, url: string) => {
    const audio = index === 1 ? aux1AudioRef.current : aux2AudioRef.current;
    if (audio) {
      audio.src = url;
      audio.load();
      audio.play().catch(console.error);
    }
  }, []);

  const playTrack = useCallback((track: AudioFile) => {
    console.log("Playing track:", track.name, track.url);
    if (!mainAudioRef.current || !track.url) {
      console.warn("No audio element or track URL available");
      return;
    }
    
    if (currentTrack?.url !== track.url) {
      mainAudioRef.current.src = track.url;
      mainAudioRef.current.load();
      setCurrentTrack(track);
    }
    
    mainAudioRef.current.play()
      .then(() => {
        setIsPlaying(true);
        console.log("Playback started successfully");
      })
      .catch(err => {
        console.error("Playback failed start:", err);
        setIsPlaying(false);
        // Dispatch an error event so the UI can react
        window.dispatchEvent(new CustomEvent('track-error', { detail: { name: track.name, error: err.message } }));
      });
  }, [currentTrack]);

  const pauseTrack = useCallback(() => {
    mainAudioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (!mainAudioRef.current) return;
    
    if (isPlaying) {
      pauseTrack();
    } else {
      if (currentTrack) {
        mainAudioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(err => {
            console.error("Manual play failed:", err);
            setIsPlaying(false);
            window.dispatchEvent(new CustomEvent('track-error', { detail: { name: currentTrack.name, error: err.message } }));
          });
      }
    }
  }, [isPlaying, currentTrack, pauseTrack]);

  const seek = useCallback((time: number) => {
    if (mainAudioRef.current) mainAudioRef.current.currentTime = time;
  }, []);

  const playPad = useCallback((padId: string | number, url: string, loop: boolean = false) => {
    let audio = padsAudioRefs.current.get(padId);
    if (!audio) {
      audio = new Audio(url);
      audio.addEventListener('error', (e) => {
        console.error(`Pad Error (${padId}):`, url);
        window.dispatchEvent(new CustomEvent('track-error', { 
          detail: { name: `Pad ${padId}`, url, message: 'Falha ao carregar Pad.' } 
        }));
        setActivePadIds(prev => {
          const next = new Set(prev);
          next.delete(padId);
          return next;
        });
      });
      audio.addEventListener('ended', () => {
        if (!audio?.loop) {
          setActivePadIds(prev => {
            const next = new Set(prev);
            next.delete(padId);
            return next;
          });
        }
      });
      padsAudioRefs.current.set(padId, audio);
    } else {
      if (audio.src !== url) {
        audio.src = url;
      }
      audio.currentTime = 0;
    }

    audio.loop = loop;
    audio.play().then(() => {
      setActivePadIds(prev => new Set(prev).add(padId));
    }).catch(err => {
      console.error("Pad Play failed:", err);
    });
  }, []);

  const stopPad = useCallback((padId: string | number) => {
    const audio = padsAudioRefs.current.get(padId);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setActivePadIds(prev => {
        const next = new Set(prev);
        next.delete(padId);
        return next;
      });
    }
  }, []);

  return {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    setVolume,
    aux1Volume,
    setAux1Volume,
    aux2Volume,
    setAux2Volume,
    playTrack,
    pauseTrack,
    togglePlay,
    seek,
    playPad,
    stopPad,
    activePadIds,
    micVolume,
    setMicVolume,
    isMicEnabled,
    toggleMic,
    isPlaybackEnabled,
    setIsPlaybackEnabled,
    isEchoEnabled,
    setIsEchoEnabled,
    isAux1Enabled,
    setIsAux1Enabled,
    isAux2Enabled,
    setIsAux2Enabled,
    playAux
  };
}
