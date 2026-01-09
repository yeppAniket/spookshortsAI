import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Scene } from '../types';
import { Play, RotateCcw, Download, Loader2, Pause, Square } from 'lucide-react';
import { SFXManager } from '../services/sfxService';

interface VideoPlayerProps {
  scenes: Scene[];
  audioContext: AudioContext | null;
  genre?: 'horror' | 'romance' | 'motivational' | 'poetry' | 'normal';
}

// Genre-specific colors
const GENRE_COLORS = {
  horror: '#FF0000',
  romance: '#FF69B4',
  poetry: '#DA70D6',
  motivational: '#FFA500',
  normal: '#60A5FA'
};

// Genre-specific fonts
const GENRE_FONTS = {
  horror: 'bold 60px "Creepster", cursive',
  romance: 'italic 58px "Dancing Script", cursive',
  poetry: 'italic 56px "Playfair Display", serif',
  motivational: 'bold 64px "Montserrat", sans-serif',
  normal: 'normal 60px "Roboto", sans-serif'
};

// Genre-specific background music files
const GENRE_MUSIC = {
  romance: '/romance-bg.mp3',
  poetry: '/romance-bg.mp3',  // Same as romance for now
  motivational: null,  // No music yet
  normal: null,  // No music yet
  horror: null  // No music for horror
};

// Canvas dimensions for high quality vertical video
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1920;

const VideoPlayer: React.FC<VideoPlayerProps> = ({ scenes, audioContext, genre = 'horror' }) => {
  const highlightColor = GENRE_COLORS[genre] || GENRE_COLORS.horror;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  
  // To store pre-loaded HTMLImageElements
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Audio References
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  
  // SFX Manager Reference
  const sfxManagerRef = useRef<SFXManager | null>(null);
  
  // Background Music References
  const bgMusicBufferRef = useRef<AudioBuffer | null>(null);
  const bgMusicSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const bgMusicGainRef = useRef<GainNode | null>(null);
  
  // Animation References
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const sceneStartTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const shouldContinueRef = useRef<boolean>(false);

  // Recording References
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Initialize SFX Manager and load sounds
  useEffect(() => {
    if (audioContext && !sfxManagerRef.current) {
      sfxManagerRef.current = new SFXManager(audioContext);
      sfxManagerRef.current.loadSFX().then(() => {
        console.log('[SFX] Manager initialized and sounds loaded');
      }).catch(err => {
        console.error('[SFX] Failed to load sounds:', err);
      });
    }
  }, [audioContext]);

  // Load background music for romance/poetry
  useEffect(() => {
    const musicFile = GENRE_MUSIC[genre as keyof typeof GENRE_MUSIC];
    if (audioContext && musicFile && !bgMusicBufferRef.current) {
      fetch(musicFile)
        .then(res => res.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(buffer => {
          bgMusicBufferRef.current = buffer;
          console.log(`[BG Music] Loaded background music for ${genre}`);
        })
        .catch(err => console.error('[BG Music] Failed to load:', err));
    }
  }, [audioContext, genre]);

  // Load images into memory for canvas drawing
  useEffect(() => {
    let isMounted = true;
    const loadImages = async () => {
      setImagesLoaded(false);
      const loadedImages: HTMLImageElement[] = [];
      
      for (const scene of scenes) {
        if (scene.imageData) {
          const img = new Image();
          img.src = `data:image/jpeg;base64,${scene.imageData}`;
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve; // Continue even if one fails
          });
          loadedImages.push(img);
        } else {
          // Placeholder if missing
          loadedImages.push(new Image()); 
        }
      }
      
      if (isMounted) {
        imagesRef.current = loadedImages;
        setImagesLoaded(true);
        // Draw first frame
        drawFrame(0, 0); 
      }
    };

    if (scenes.length > 0) {
      loadImages();
    }

    return () => { isMounted = false; };
  }, [scenes]);

  // Visual Effect Helper Functions
  const applyVisualEffect = (ctx: CanvasRenderingContext2D, effect: string, elapsed: number) => {
    // Effects applied BEFORE image drawing (transform effects)
    if (effect === 'chromatic_aberration') {
      // Slight RGB channel offset
      ctx.globalCompositeOperation = 'lighter';
    }
  };

  const applyPostImageEffect = (ctx: CanvasRenderingContext2D, effect: string, elapsed: number) => {
    // Effects applied AFTER image drawing (overlay effects)
    const intensity = Math.max(0, 1 - elapsed * 2); // Fade out over 500ms

    if (effect === 'flash_red') {
      // Convert hex to RGB for genre-specific flash
      const rgb = highlightColor === '#FF0000' ? '255, 0, 0' : 
                  highlightColor === '#FF69B4' ? '255, 105, 180' :
                  highlightColor === '#DA70D6' ? '218, 112, 214' :
                  highlightColor === '#FFA500' ? '255, 165, 0' : '96, 165, 250';
      ctx.fillStyle = `rgba(${rgb}, ${intensity * 0.5})`;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else if (effect === 'vignette_pulse') {
      const gradient = ctx.createRadialGradient(
        CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 200,
        CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.8
      );
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity * 0.7})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else if (effect === 'static_noise') {
      // TV snow / film grain overlay for cursed tape aesthetic
      const imageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        if (Math.random() < intensity * 0.15) {
          const noise = Math.random() * 255;
          data[i] = noise;
          data[i + 1] = noise;
          data[i + 2] = noise;
        }
      }
      ctx.putImageData(imageData, 0, 0);
    } else if (effect === 'chromatic_aberration') {
      // RGB split effect - signals supernatural interference
      const offset = Math.floor(intensity * 20);
      
      // Get original image
      const originalImage = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Create offset versions for R and B channels
      ctx.globalCompositeOperation = 'screen';
      
      // Red channel shifted right
      ctx.fillStyle = `rgba(255, 0, 0, ${intensity * 0.5})`;
      ctx.fillRect(offset, 0, CANVAS_WIDTH - offset, CANVAS_HEIGHT);
      
      // Blue channel shifted left  
      ctx.fillStyle = `rgba(0, 0, 255, ${intensity * 0.5})`;
      ctx.fillRect(-offset, 0, CANVAS_WIDTH + offset, CANVAS_HEIGHT);
      
      ctx.globalCompositeOperation = 'source-over';
    }
  };

  // Main Draw Function
  const drawFrame = useCallback((sceneIndex: number, progress: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !imagesRef.current[sceneIndex]) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scene = scenes[sceneIndex];
    const duration = scene.audioBuffer?.duration || 1;
    
    // Calculate actual elapsed time more accurately
    const now = performance.now();
    const actualElapsed = (now - sceneStartTimeRef.current) / 1000;
    const currentTime = Math.min(actualElapsed, duration); // Clamp to duration
    
    // Check if we should apply visual effect (skip if 'none')
    const effectActive = scene.effect_timestamp && 
                        scene.visual_effect && 
                        scene.visual_effect !== 'none' &&
                        currentTime >= scene.effect_timestamp && 
                        currentTime <= scene.effect_timestamp + 0.5; // Effect lasts 500ms

    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Save context for effects
    ctx.save();

    // Apply visual effects BEFORE drawing image
    if (effectActive && scene.visual_effect) {
      applyVisualEffect(ctx, scene.visual_effect, currentTime - scene.effect_timestamp!);
    }

    // 1. Draw Image with Ken Burns Effect (or effect-specific transform)
    let scale = 1.0 + (progress * 0.15); // Default slow zoom
    
    // Override scale for specific effects
    if (effectActive) {
      if (scene.visual_effect === 'rapid_shake') {
        const shakeX = (Math.random() - 0.5) * 30;
        const shakeY = (Math.random() - 0.5) * 30;
        ctx.translate(shakeX, shakeY);
      } else if (scene.visual_effect === 'slow_zoom_in') {
        scale = 1.0 + (progress * 0.3); // Faster zoom during effect
      }
    }
    
    const img = imagesRef.current[sceneIndex];
    
    if (img.width > 0) {
      const scaledWidth = CANVAS_WIDTH * scale;
      const scaledHeight = CANVAS_HEIGHT * scale;
      const offsetX = (CANVAS_WIDTH - scaledWidth) / 2;
      const offsetY = (CANVAS_HEIGHT - scaledHeight) / 2;

      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
    }

    ctx.restore();

    // Apply POST-IMAGE effects
    if (effectActive && scene.visual_effect) {
      applyPostImageEffect(ctx, scene.visual_effect, currentTime - scene.effect_timestamp!);
    }

    // 2. Dark Gradient Overlay for Text Readability
    const gradient = ctx.createLinearGradient(0, CANVAS_HEIGHT * 0.6, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.8, 'rgba(0,0,0,0.8)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, CANVAS_HEIGHT * 0.5, CANVAS_WIDTH, CANVAS_HEIGHT * 0.5);

    // 3. Draw Dynamic Captions (Word-by-Word Highlighting)
    // Use hinglish_display for UI if available (when narration is Hindi)
    const displayText = scene.hinglish_display || scene.narration;
    const text = displayText;
    const alignment = scene.alignment || [];
    
    ctx.font = GENRE_FONTS[genre] || GENRE_FONTS.horror;
    ctx.textAlign = 'center';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000000';
    ctx.shadowBlur = 10;
    
    // Find current word being spoken (using currentTime from above)
    let currentWordIndex = -1;
    if (alignment.length > 0) {
      currentWordIndex = alignment.findIndex(w => currentTime >= w.start && currentTime <= w.end);
      if (currentWordIndex === -1 && currentTime > alignment[alignment.length - 1].end) {
        currentWordIndex = alignment.length; // All words spoken
      }
    }

    // Word Wrap Logic with word-level highlighting
    const words = text.split(' ');
    let line = '';
    const lines: { text: string; words: { word: string; index: number }[] }[] = [];
    const maxWidth = CANVAS_WIDTH - 100;
    const lineHeight = 80;
    let wordIndex = 0;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        lines.push({ text: line, words: [] });
        line = words[i] + ' ';
      } else {
        line = testLine;
      }
    }
    if (line.trim()) {
      lines.push({ text: line, words: [] });
    }

    // Render Lines with Dynamic Highlighting
    const startY = CANVAS_HEIGHT - 200 - (lines.length * lineHeight);
    
    // Split words among lines for individual rendering
    wordIndex = 0;
    lines.forEach((lineObj, lineIdx) => {
      const lineWords = lineObj.text.trim().split(' ');
      let xOffset = CANVAS_WIDTH / 2 - (ctx.measureText(lineObj.text).width / 2);
      
      lineWords.forEach((word, wordIdx) => {
        const wordWidth = ctx.measureText(word + ' ').width;
        const y = startY + (lineIdx * lineHeight);
        
        // Determine color based on timing
        if (currentWordIndex !== -1 && wordIndex === currentWordIndex) {
          // Current word - genre-specific highlight with glow
          ctx.fillStyle = highlightColor;
          ctx.shadowColor = highlightColor;
          ctx.shadowBlur = 20;
        } else if (currentWordIndex !== -1 && wordIndex < currentWordIndex) {
          // Past words - dimmed white
          ctx.fillStyle = '#AAAAAA';
          ctx.shadowColor = 'black';
          ctx.shadowBlur = 10;
        } else {
          // Future words - bright white
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = 'black';
          ctx.shadowBlur = 10;
        }
        
        // Draw word
        ctx.strokeText(word, xOffset + wordWidth / 2, y);
        ctx.fillText(word, xOffset + wordWidth / 2, y);
        
        xOffset += wordWidth;
        wordIndex++;
      });
    });

  }, [scenes]);


  // Play Sequence Logic
  const playSequence = useCallback(async (startIdx: number, record: boolean) => {
    if (!audioContext || !imagesLoaded) return;
    
    // Resume context
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    setIsPlaying(true);
    shouldContinueRef.current = true;
    
    // Start background music for genres with music
    const musicFile = GENRE_MUSIC[genre as keyof typeof GENRE_MUSIC];
    if (musicFile && bgMusicBufferRef.current && startIdx === 0) {
      // Stop any previous background music
      if (bgMusicSourceRef.current) {
        bgMusicSourceRef.current.stop();
      }
      
      // Create gain node for background music
      if (!bgMusicGainRef.current) {
        bgMusicGainRef.current = audioContext.createGain();
        bgMusicGainRef.current.gain.value = 0.15; // Low volume (15%)
      }
      
      // Create and play background music
      bgMusicSourceRef.current = audioContext.createBufferSource();
      bgMusicSourceRef.current.buffer = bgMusicBufferRef.current;
      bgMusicSourceRef.current.loop = true;
      bgMusicSourceRef.current.connect(bgMusicGainRef.current);
      bgMusicGainRef.current.connect(audioContext.destination);
      bgMusicSourceRef.current.start(0);
      console.log(`[BG Music] Started background music for ${genre} at 15% volume`);
    }
    
    // Start SFX layer (ambient horror sounds at 30% volume)
    if (sfxManagerRef.current && startIdx === 0) {
      // Stop any previous SFX
      sfxManagerRef.current.stopAll();
      
      // Start new ambient drone (only for horror)
      if (genre === 'horror') {
        sfxManagerRef.current.playRandomDrone(0.15);
        console.log('[SFX] Started ambient drone');
      }
    }
    
    if (record) {
      setIsRecording(true);
      recordedChunksRef.current = [];
      
      // Setup MediaRecorder
      const canvas = canvasRef.current;
      if (canvas) {
        // Create a mixed stream: Canvas Video + Audio Context Dest
        const stream = canvas.captureStream(30); // 30 FPS
        
        // Setup Audio Destination for Recording
        audioDestinationRef.current = audioContext.createMediaStreamDestination();
        const audioTrack = audioDestinationRef.current.stream.getAudioTracks()[0];
        stream.addTrack(audioTrack);
        
        // Connect SFX to recording destination
        if (sfxManagerRef.current) {
          sfxManagerRef.current.connectTo(audioDestinationRef.current);
        }
        
        // Connect background music to recording destination
        const musicFile = GENRE_MUSIC[genre as keyof typeof GENRE_MUSIC];
        if (bgMusicGainRef.current && musicFile) {
          bgMusicGainRef.current.connect(audioDestinationRef.current);
        }

        const recorder = new MediaRecorder(stream, {
           mimeType: 'video/webm;codecs=vp9'
        });

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) recordedChunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
          // Disconnect SFX from recorder
          if (sfxManagerRef.current) {
            sfxManagerRef.current.disconnect();
          }
          
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `spookshorts-export-${Date.now()}.webm`;
          a.click();
          URL.revokeObjectURL(url);
          setIsRecording(false);
          setIsPlaying(false);
        };

        mediaRecorderRef.current = recorder;
        recorder.start();
      }
    }

    let currentIndex = startIdx;
    
    const playNext = () => {
      if (currentIndex >= scenes.length || !shouldContinueRef.current) {
        // Finished
        if (record && mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
        } else {
          setIsPlaying(false);
          setCurrentSceneIndex(0);
          drawFrame(0, 0); // Reset visual
        }
        return;
      }

      setCurrentSceneIndex(currentIndex);
      const scene = scenes[currentIndex];

      if (!scene.audioBuffer) {
        // Skip if no audio (shouldn't happen)
        currentIndex++;
        playNext();
        return;
      }

      const source = audioContext.createBufferSource();
      source.buffer = scene.audioBuffer;

      // Create gain node for voice volume control
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 1.0; // Voice narration volume (100%)
      source.connect(gainNode);

      // Routing
      if (record && audioDestinationRef.current) {
        // Route to recorder AND speakers so user can hear it
        gainNode.connect(audioDestinationRef.current);
        gainNode.connect(audioContext.destination);
      } else {
        // Just speakers
        gainNode.connect(audioContext.destination);
      }

      activeSourceRef.current = source;
      source.start();

      const duration = scene.audioBuffer.duration;
      sceneStartTimeRef.current = performance.now();
      
      // Track if audio cue has been triggered
      let audioCueTriggered = false;

      // Animation Loop for this scene
      const animate = () => {
        if (!shouldContinueRef.current) return;
        
        const now = performance.now();
        const elapsed = (now - sceneStartTimeRef.current) / 1000;
        const progress = Math.min(elapsed / duration, 1); // 0 to 1

        // Trigger audio cue 100ms BEFORE visual effect (skip if 'none')
        if (!audioCueTriggered && scene.audio_cue && scene.audio_cue !== 'none' && scene.effect_timestamp) {
          const triggerTime = scene.effect_timestamp - 0.1; // 100ms before effect
          if (elapsed >= triggerTime && sfxManagerRef.current) {
            sfxManagerRef.current.playCue(scene.audio_cue, 0.1);
            audioCueTriggered = true;
            console.log(`[SFX] Triggered audio cue: ${scene.audio_cue}`);
          }
        }

        drawFrame(currentIndex, progress);

        // Continue animation until audio ends (elapsed < duration)
        if (elapsed < duration) {
             rafRef.current = requestAnimationFrame(animate);
        }
      };
      
      // Start Animation
      rafRef.current = requestAnimationFrame(animate);

      // Schedule next
      source.onended = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        currentIndex++;
        // Continue to next scene
        playNext(); 
      };
    };

    playNext();

  }, [audioContext, imagesLoaded, scenes, drawFrame]); // Added isPlaying to deps, though we use ref logic inside commonly

  const handleStop = () => {
    shouldContinueRef.current = false;
    
    if (activeSourceRef.current) {
      activeSourceRef.current.stop();
      activeSourceRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    // Stop all SFX
    if (sfxManagerRef.current) {
      sfxManagerRef.current.stopAll();
      console.log('[SFX] Stopped all effects');
    }
    
    // Stop background music
    if (bgMusicSourceRef.current) {
      bgMusicSourceRef.current.stop();
      bgMusicSourceRef.current = null;
      console.log('[BG Music] Stopped background music');
    }
    
    setIsPlaying(false);
    setIsPaused(false);
    setIsRecording(false);
    setCurrentSceneIndex(0);
    drawFrame(0, 0); // Reset to first frame
  };

  const handlePause = () => {
    if (!audioContext) return;
    
    if (isPaused) {
      // Resume
      shouldContinueRef.current = true;
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      setIsPaused(false);
      
      // Resume animation
      const resumeTime = performance.now();
      pauseTimeRef.current = 0;
      
      const animate = () => {
        if (!shouldContinueRef.current) return;
        
        const now = performance.now();
        const elapsed = (now - sceneStartTimeRef.current) / 1000;
        const scene = scenes[currentSceneIndex];
        const duration = scene.audioBuffer?.duration || 1;
        const progress = Math.min(elapsed / duration, 1);

        drawFrame(currentSceneIndex, progress);

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        }
      };
      
      rafRef.current = requestAnimationFrame(animate);
    } else {
      // Pause
      shouldContinueRef.current = false;
      if (audioContext.state === 'running') {
        audioContext.suspend();
      }
      setIsPaused(true);
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      pauseTimeRef.current = performance.now();
    }
  };

  const handlePlay = () => {
    setIsPaused(false);
    shouldContinueRef.current = true;
    playSequence(0, false);
  };

  const handleDownload = () => {
    handleStop(); // Ensure clean slate
    // Give a small timeout to clear buffers
    setTimeout(() => {
        playSequence(0, true);
    }, 100);
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
      {/* 9:16 Aspect Ratio Container - We use the Canvas now */}
      <div className="relative aspect-[9/16] bg-black group">
         <canvas 
            ref={canvasRef} 
            width={CANVAS_WIDTH} 
            height={CANVAS_HEIGHT}
            className="w-full h-full object-contain"
         />
         
         {!imagesLoaded && (
             <div className="absolute inset-0 flex items-center justify-center bg-slate-950 text-slate-500">
                <Loader2 className="animate-spin mr-2" /> Loading Assets...
             </div>
         )}

         {isRecording && (
            <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs animate-pulse font-bold shadow-lg">
                REC • Generating Video...
            </div>
         )}
      </div>

      {/* Controls */}
      <div className="p-4 flex items-center justify-between bg-slate-900 border-t border-slate-800">
        <div className="text-xs text-slate-400">
            {isRecording ? "Please wait..." : `Scene ${currentSceneIndex + 1} / ${scenes.length}`}
        </div>
        <div className="flex gap-3">
            {!isPlaying ? (
                <>
                    <button 
                        onClick={handlePlay}
                        disabled={!imagesLoaded}
                        className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-all disabled:opacity-50"
                        title="Preview"
                    >
                        <Play size={24} fill="currentColor" />
                    </button>
                    <button 
                        onClick={handleDownload}
                        disabled={!imagesLoaded}
                        className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all transform hover:scale-105 shadow-lg shadow-red-900/50 flex items-center gap-2 px-6"
                        title="Download Video"
                    >
                        <Download size={20} />
                        <span className="font-bold text-sm">EXPORT VIDEO</span>
                    </button>
                </>
            ) : (
                <>
                    <button 
                        onClick={handlePause}
                        disabled={isRecording}
                        className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-all disabled:opacity-50"
                        title={isPaused ? "Resume" : "Pause"}
                    >
                        {isPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} />}
                    </button>
                    <button 
                        onClick={handleStop}
                        disabled={isRecording}
                        className="p-3 bg-red-800 hover:bg-red-700 text-white rounded-full transition-all disabled:opacity-50"
                        title="Stop"
                    >
                        <Square size={20} fill="currentColor" />
                    </button>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;