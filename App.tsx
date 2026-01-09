import React, { useState, useRef } from 'react';
import { Ghost, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { generateHorrorScript, generateSceneImage, generateSceneAudio } from './services/geminiService';
import VideoPlayer from './components/VideoPlayer';
import { Scene, GeneratedScript, AppStatus, GenerationProgress, Genre } from './types';

// Genre-specific theme colors
const GENRE_COLORS = {
  horror: { primary: '#DC2626', shadow: 'rgba(220, 38, 38, 0.5)', highlight: '#FF0000' },
  romance: { primary: '#EC4899', shadow: 'rgba(236, 72, 153, 0.5)', highlight: '#FF69B4' },
  poetry: { primary: '#A855F7', shadow: 'rgba(168, 85, 247, 0.5)', highlight: '#DA70D6' },
  motivational: { primary: '#F59E0B', shadow: 'rgba(245, 158, 11, 0.5)', highlight: '#FFA500' },
  normal: { primary: '#3B82F6', shadow: 'rgba(59, 130, 246, 0.5)', highlight: '#60A5FA' }
};

function App() {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [story, setStory] = useState('');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [genre, setGenre] = useState<Genre>('horror');
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [scriptTitle, setScriptTitle] = useState('');
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Audio context persistence
  const audioContextRef = useRef<AudioContext | null>(null);

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
    }
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const handleGenerate = async () => {
    if (!story.trim()) return;

    try {
      initAudioContext();
      setStatus(AppStatus.GENERATING_SCRIPT);
      setErrorMsg('');
      setScenes([]);
      
      let script: GeneratedScript;
      
      // Check if input is JSON
      const trimmedInput = story.trim();
      if (trimmedInput.startsWith('{') && trimmedInput.endsWith('}')) {
        // Parse JSON directly
        setProgress({ current: 0, total: 100, message: 'Parsing JSON script...' });
        try {
          const parsed = JSON.parse(trimmedInput);
          
          // Validate required fields
          if (!parsed.scenes || !Array.isArray(parsed.scenes)) {
            throw new Error('JSON must contain a "scenes" array');
          }
          
          script = {
            title: parsed.title || 'Untitled Horror',
            language: parsed.language || language,
            total_duration: parsed.total_duration || 30,
            scenes: parsed.scenes.map((s: any) => ({
              id: s.id,
              narration: s.narration,
              hinglish_display: s.hinglish_display, // Hinglish UI text
              visual_prompt: s.visual_prompt,
              audio_cue: s.sfx_cue || s.audio_cue || 'drone_low',
              visual_effect: s.visual_effect || 'slow_zoom_in',
              effect_timestamp: s.effect_timestamp || 0.5, // Default to middle of scene
              duration_estimate: s.duration_estimate || 4
            }))
          };
          
          // Auto-detect language from JSON if provided
          if (parsed.language && (parsed.language === 'en' || parsed.language === 'hi')) {
            setLanguage(parsed.language);
          }
          
        } catch (parseError: any) {
          throw new Error(`Invalid JSON: ${parseError.message}`);
        }
      } else {
        // 1. Generate Script from story text
        setProgress({ current: 0, total: 100, message: 'Analyzing your story and breaking it into scenes...' });
        script = await generateHorrorScript(story, genre);
      }
      
      setScriptTitle(script.title);
      
      const initialScenes: Scene[] = script.scenes.map(s => ({
        ...s,
        genre: script.genre || genre, // Set genre for each scene
        // Reset buffers
      }));
      setScenes(initialScenes);

      // 2. Generate Media (Parallel-ish but visualized sequentially for better UX)
      setStatus(AppStatus.GENERATING_IMAGES);
      
      const updatedScenes = [...initialScenes];
      const totalSteps = initialScenes.length * 2; // Image + Audio for each
      let completedSteps = 0;

      for (let i = 0; i < updatedScenes.length; i++) {
        // Add a small delay between scenes to prevent rate limiting / XHR errors
        await new Promise(r => setTimeout(r, 800));
        
        setProgress({ 
            current: Math.round((completedSteps / totalSteps) * 100), 
            total: 100, 
            message: `Creating visuals for scene ${i + 1}...` 
        });
        
        try {
            const base64Image = await generateSceneImage(updatedScenes[i].visual_prompt, genre);
            updatedScenes[i].imageData = base64Image;
        } catch (e: any) {
            console.error(`Failed image gen for scene ${i}`, e);
        }
        completedSteps++;
      }

      // 3. Generate Audio
      for (let i = 0; i < updatedScenes.length; i++) {
        setStatus(AppStatus.GENERATING_AUDIO);
        setProgress({ 
            current: Math.round((completedSteps / totalSteps) * 100), 
            total: 100, 
            message: `Summoning voices for scene ${i + 1}...` 
        });
        
        try {
            if (audioContextRef.current) {
                const { buffer, alignment } = await generateSceneAudio(
                    updatedScenes[i].narration, 
                    audioContextRef.current, 
                    language,
                    genre
                );
                updatedScenes[i].audioBuffer = buffer;
                updatedScenes[i].alignment = alignment;
            }
        } catch (e: any) {
            console.error(`Failed audio for scene ${i}`, e);
        }
        completedSteps++;
      }

      setStatus(AppStatus.READY);
      setProgress(null);
      setScenes(updatedScenes); // Update with all media

    } catch (error: any) {
      setStatus(AppStatus.ERROR);
      setErrorMsg(error.message || "Something went wrong...");
      setProgress(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-10 px-4">
      
      {/* Header */}
      <header className="mb-10 text-center space-y-2">
        <h1 className="text-5xl md:text-6xl font-horror text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)] flex items-center justify-center gap-3">
          <Ghost size={48} className="animate-bounce-slow" />
          SpookShorts AI
        </h1>
        <p className="text-slate-400 max-w-md mx-auto">
          Fully Automated Viral Horror Shorts Generator
        </p>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Left Column: Input & status */}
        <div className="space-y-8">
            
            {/* Input Card */}
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    🎭 Genre
                </label>
                
                {/* Genre Selector */}
                <div className="mb-4">
                    <select
                        value={genre}
                        onChange={(e) => setGenre(e.target.value as Genre)}
                        disabled={status !== AppStatus.IDLE && status !== AppStatus.READY && status !== AppStatus.ERROR}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-900 transition-all"
                    >
                        <option value="horror">👻 Horror</option>
                        <option value="romance">💕 Romance</option>
                        <option value="poetry">📜 Poetry</option>
                        <option value="motivational">🔥 Motivational</option>
                        <option value="normal">🎬 Normal</option>
                    </select>
                </div>
                
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    📖 Your Story
                </label>
                
                {/* Language Selector */}
                <div className="mb-3 flex gap-2">
                    <button
                        onClick={() => setLanguage('en')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            language === 'en' 
                                ? 'bg-red-600 text-white' 
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                    >
                        English
                    </button>
                    <button
                        onClick={() => setLanguage('hi')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            language === 'hi' 
                                ? 'bg-red-600 text-white' 
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                    >
                        हिंदी (Hindi)
                    </button>
                </div>
                
                <textarea
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    placeholder={language === 'en' 
                        ? "Paste your complete story here...\n\nOr paste a JSON script:\n{\n  \"title\": \"Your Story\",\n  \"language\": \"en\",\n  \"genre\": \"horror\",\n  \"scenes\": [...]\n}" 
                        : "अपनी पूरी कहानी यहाँ paste करें...\n\nया JSON script paste करें:\n{\n  \"title\": \"आपकी कहानी\",\n  \"language\": \"hi\",\n  \"genre\": \"horror\",\n  \"scenes\": [...]\n}"}
                    disabled={status !== AppStatus.IDLE && status !== AppStatus.READY && status !== AppStatus.ERROR}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-900 transition-all resize-none font-mono text-sm"
                    rows={8}
                />
                
                <button
                    onClick={handleGenerate}
                    disabled={!story.trim() || (status !== AppStatus.IDLE && status !== AppStatus.READY && status !== AppStatus.ERROR)}
                    className="w-full mt-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
                >
                    {status === AppStatus.IDLE || status === AppStatus.READY || status === AppStatus.ERROR ? (
                        <>
                            <Sparkles size={20} />
                            Create Video
                        </>
                    ) : (
                        <Loader2 size={20} className="animate-spin" />
                    )}
                </button>
                
                <p className="text-xs text-slate-500 text-center mt-2">
                    💡 Paste either a <strong>story</strong> (AI generates scenes) or <strong>JSON</strong> (manual control)
                </p>
            </div>

            {/* Status & Error Display */}
            {status === AppStatus.ERROR && (
                <div className="bg-red-950/30 border border-red-900/50 p-4 rounded-xl flex items-center gap-3 text-red-200">
                    <AlertCircle className="shrink-0" />
                    <p>{errorMsg}</p>
                </div>
            )}

            {(status !== AppStatus.IDLE && status !== AppStatus.READY && status !== AppStatus.ERROR && progress) && (
                 <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto relative">
                        <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
                        <div 
                            className="absolute inset-0 rounded-full border-4 border-red-600 border-t-transparent animate-spin"
                        ></div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white animate-pulse">{progress.message}</h3>
                        <p className="text-slate-500 text-sm mt-1">Please wait, rendering horrors...</p>
                    </div>
                 </div>
            )}

            {/* Script Preview (If generated) */}
            {scenes.length > 0 && (
                <div className="bg-slate-900/30 p-6 rounded-2xl border border-slate-800">
                    <h2 className="text-xl font-bold text-slate-200 mb-4 border-b border-slate-800 pb-2">
                        {scriptTitle || 'Generated Script'}
                    </h2>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {scenes.map((scene, idx) => (
                            <div key={idx} className="flex gap-4 p-3 bg-slate-950/50 rounded-lg border border-slate-800/50 hover:border-red-900/30 transition-colors">
                                <div className="text-red-600 font-horror text-2xl w-8 shrink-0 opacity-50">{idx + 1}</div>
                                <div>
                                    <p className="text-slate-300 italic mb-2">"{scene.narration}"</p>
                                    <p className="text-xs text-slate-500 font-mono border-l-2 border-slate-700 pl-2 line-clamp-2">
                                        [Visual]: {scene.visual_prompt}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>

        {/* Right Column: Player */}
        <div className="sticky top-10 flex flex-col items-center justify-center">
            {scenes.length > 0 ? (
                <div className="space-y-4 w-full">
                   <div className="flex items-center justify-between text-slate-400 text-sm px-2">
                        <span>Preview</span>
                        <span>9:16 Vertical</span>
                   </div>
                   <VideoPlayer 
                        scenes={scenes} 
                        audioContext={audioContextRef.current}
                        genre={genre}
                    />
                    {status === AppStatus.READY && (
                        <div className="text-center text-xs text-slate-500 mt-4">
                           Click <strong>Export Video</strong> to download a .webm file.
                        </div>
                    )}
                </div>
            ) : (
                <div className="w-full max-w-sm mx-auto aspect-[9/16] bg-slate-900 rounded-2xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-600 gap-4 p-8 text-center">
                    <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center">
                        <Ghost size={40} className="opacity-50" />
                    </div>
                    <p>Enter a topic and generate to create your viral short.</p>
                </div>
            )}
        </div>

      </main>
    </div>
  );
}

export default App;