import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Scene } from '../types';
import { Play, RotateCcw, Download, Loader2 } from 'lucide-react';

interface VideoPlayerProps {
  scenes: Scene[];
  audioContext: AudioContext | null;
}

// Canvas dimensions for high quality vertical video
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1920;

const VideoPlayer: React.FC<VideoPlayerProps> = ({ scenes, audioContext }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  
  // To store pre-loaded HTMLImageElements
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Audio References
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  
  // Animation References
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const sceneStartTimeRef = useRef<number>(0);

  // Recording References
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

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

  // Main Draw Function
  const drawFrame = useCallback((sceneIndex: number, progress: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !imagesRef.current[sceneIndex]) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 1. Draw Image with Ken Burns Effect (Zoom in)
    // Scale goes from 1.0 to 1.15 over the duration of the scene
    const scale = 1.0 + (progress * 0.15); 
    const img = imagesRef.current[sceneIndex];
    
    if (img.width > 0) {
      const scaledWidth = CANVAS_WIDTH * scale;
      const scaledHeight = CANVAS_HEIGHT * scale;
      const offsetX = (CANVAS_WIDTH - scaledWidth) / 2;
      const offsetY = (CANVAS_HEIGHT - scaledHeight) / 2;

      ctx.save();
      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
      ctx.restore();
    }

    // 2. Dark Gradient Overlay for Text Readability
    const gradient = ctx.createLinearGradient(0, CANVAS_HEIGHT * 0.6, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.8, 'rgba(0,0,0,0.8)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, CANVAS_HEIGHT * 0.5, CANVAS_WIDTH, CANVAS_HEIGHT * 0.5);

    // 3. Draw Text (Captions)
    const text = scenes[sceneIndex].narration;
    ctx.font = 'bold 60px "Creepster", cursive'; // Fallback to cursive if font not loaded
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 10;
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000000';

    // Word Wrap Logic
    const words = text.split(' ');
    let line = '';
    const lines = [];
    const maxWidth = CANVAS_WIDTH - 100;
    const lineHeight = 80;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        lines.push(line);
        line = words[i] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    // Render Lines
    const startY = CANVAS_HEIGHT - 200 - (lines.length * lineHeight);
    lines.forEach((l, i) => {
      ctx.strokeText(l, CANVAS_WIDTH / 2, startY + (i * lineHeight));
      ctx.fillText(l, CANVAS_WIDTH / 2, startY + (i * lineHeight));
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

        const recorder = new MediaRecorder(stream, {
           mimeType: 'video/webm;codecs=vp9'
        });

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) recordedChunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
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
      if (currentIndex >= scenes.length) {
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

      // Routing
      if (record && audioDestinationRef.current) {
        // Route to recorder AND speakers so user can hear it
        source.connect(audioDestinationRef.current);
        source.connect(audioContext.destination); 
      } else {
        // Just speakers
        source.connect(audioContext.destination);
      }

      activeSourceRef.current = source;
      source.start();

      const duration = scene.audioBuffer.duration;
      sceneStartTimeRef.current = performance.now();

      // Animation Loop for this scene
      const animate = () => {
        const now = performance.now();
        const elapsed = (now - sceneStartTimeRef.current) / 1000;
        const progress = Math.min(elapsed / duration, 1); // 0 to 1

        drawFrame(currentIndex, progress);

        if (progress < 1 && isPlaying) {
             rafRef.current = requestAnimationFrame(animate);
        }
      };
      
      // Start Animation
      rafRef.current = requestAnimationFrame(animate);

      // Schedule next
      source.onended = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        currentIndex++;
        // If we stopped manually, don't continue
        // We check a ref or state ideally, but activeSource check helps
        playNext(); 
      };
    };

    playNext();

  }, [audioContext, imagesLoaded, scenes, drawFrame, isPlaying]); // Added isPlaying to deps, though we use ref logic inside commonly

  const handleStop = () => {
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
    setIsPlaying(false);
    setIsRecording(false);
  };

  const handlePlay = () => {
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
        <div className="flex gap-4">
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
                <button 
                    onClick={handleStop}
                    className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-all"
                >
                    <div className="w-5 h-5 bg-white rounded-sm" />
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;