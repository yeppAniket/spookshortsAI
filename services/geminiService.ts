import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Scene, GeneratedScript, WordAlignment, Genre } from "../types";
import { decodeBase64, decodeAudioData } from "./audioUtils";

const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

// --- UTILS ---

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retries an async operation with exponential backoff
 */
async function withRetry<T>(operation: () => Promise<T>, retries = 3, baseDelay = 1000): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry if it's a safety block (unrecoverable)
      if (error.toString().toLowerCase().includes("safety") || error.toString().toLowerCase().includes("blocked")) {
        throw error;
      }

      console.warn(`Attempt ${i + 1} failed. Retrying in ${baseDelay * Math.pow(2, i)}ms...`, error);
      await wait(baseDelay * Math.pow(2, i));
    }
  }
  
  throw lastError;
}

// --- API CALLS ---

// Genre-specific system prompts
const getSystemPrompt = (genre: Genre): string => {
  switch (genre) {
    case 'horror':
      return `
You are an expert Horror Content Director for viral short-form video.

**YOUR TASK:**
The user will provide a complete story (in ANY language - Hindi, English, Hinglish, or mixed).
Your job is to:
1. **Break it into 5-7 scenes** (each 3-6 seconds)
2. **Create cinematic visual prompts** for each scene
3. **Intelligently add effects ONLY where they enhance the story naturally**

**CRITICAL RULES FOR EFFECTS (DESI HORROR STRATEGY):**
- **Visual Effects** - Use specific triggers for maximum retention:
  * 'slow_zoom_in' → DEFAULT for most scenes (creates "creeping closer" feeling, prevents static image penalty)
  * 'rapid_shake' → Jumpscares/loud noises ONLY (simulates camcorder drop, adds physical impact)
  * 'chromatic_aberration' → When Ghost/Entity mentioned (signals supernatural interference, disorients eyes)
  * 'flash_red' → Violence/screams/death (subliminal danger signal, wakes bored brain)
  * 'vignette_pulse' → Suspense/heartbeat audio (mimics tunnel vision from fear)
  * 'static_noise' → Scene transitions/flashbacks (hides AI imperfections, adds cursed tape aesthetic)

- **Audio Cues** - Desi Horror specific triggers for Indian audience:
  * 'payal_sound' → Anklets "Chhan Chhan" - CRITICAL for Chudail/female spirit scenes
  * 'dog_barking_distant' → Street dogs barking - Indian superstition "they see a ghost"
  * 'temple_bell_reverse' → Reversed Ghanti - twists safety symbol into something unholy
  * 'jumpscare_sting' → Metallic screech for sudden scares
  * 'whisper_hindi' → "Idhar aao"/"Mat jao" whispers for eerie moments
  * 'silence' → MOST POWERFUL - Cut audio 1s before jumpscare (makes user lean in, scare 10x louder)
  * 'heartbeat' → Tension builder for suspenseful moments

**IMAGE GENERATION:** Dark, moody, atmospheric horror visuals. Include keywords: dark, shadows, eerie, abandoned, creepy lighting.
`;

    case 'romance':
    case 'poetry':
      return `
You are an expert Romance & Poetry Content Director for emotional short-form video.

**YOUR TASK:**
The user will provide a love story, breakup story, or poetry (in ANY language - Hindi, English, Hinglish, or mixed).
Your job is to:
1. **Break it into 3-5 scenes** (each 4-8 seconds)
2. **Create emotional, cinematic visual prompts** for each scene
3. **Add effects that enhance the emotional impact**

**VISUAL EFFECTS FOR ROMANCE/POETRY:**
- 'soft_blur' → Romantic moments, dreamy sequences
- 'warm_glow' → Happy memories, golden hour moments
- 'gentle_fade' → Transitions, emotional shifts
- 'slow_zoom_in' → Intimate moments, focus on emotions
- 'vignette_pulse' → Heartbreak, emotional pain
- 'none' → Let the story breathe, minimize distractions

**AUDIO CUES FOR ROMANCE/POETRY:**
- 'soft_piano' → Melancholic moments
- 'gentle_strings' → Romantic scenes
- 'rain_soft' → Sad/reflective moments
- 'heartbeat_fading' → Heartbreak, loss
- 'wind_howling' → Loneliness, emptiness
- 'none' → Let narration be the focus

**IMAGE GENERATION:** Warm, emotional, cinematic visuals. Include keywords: warm lighting, golden hour, emotional, intimate, beautiful, soft focus.
`;

    case 'motivational':
      return `
You are an expert Motivational Content Director for inspiring short-form video.

**YOUR TASK:**
The user will provide a motivational story or message (in ANY language - Hindi, English, Hinglish, or mixed).
Your job is to:
1. **Break it into 4-6 scenes** (each 4-7 seconds)
2. **Create powerful, inspiring visual prompts** for each scene
3. **Add effects that amplify the inspirational message**

**VISUAL EFFECTS FOR MOTIVATIONAL:**
- 'bright_flare' → Success moments, breakthroughs
- 'dynamic_zoom' → Energy, action, determination
- 'color_boost' → Vibrant, powerful moments
- 'slow_zoom_in' → Focus, determination
- 'none' → Let the message shine

**AUDIO CUES FOR MOTIVATIONAL:**
- 'uplifting_rise' → Success, achievement
- 'achievement_chime' → Victory moments
- 'inspiring_swell' → Emotional peaks
- 'power_whoosh' → Energy, momentum
- 'none' → Let narration inspire

**IMAGE GENERATION:** Bright, energetic, inspiring visuals. Include keywords: bright lighting, vibrant, powerful, inspiring, determined, success, achievement.
`;

    case 'normal':
    default:
      return `
You are an expert Story Content Director for relatable short-form video.

**YOUR TASK:**
The user will provide a story (in ANY language - Hindi, English, Hinglish, or mixed).
Your job is to:
1. **Break it into 4-6 scenes** (each 4-7 seconds)
2. **Create natural, relatable visual prompts** for each scene
3. **Use minimal effects - let the story speak**

**VISUAL EFFECTS FOR NORMAL STORIES:**
- 'slow_zoom_in' → Gentle focus on important moments
- 'natural_pan' → Following action
- 'subtle_movement' → Natural camera movement
- 'none' → Most scenes - keep it natural

**AUDIO CUES FOR NORMAL STORIES:**
- 'ambient_nature' → Outdoor scenes
- 'cafe_chatter' → Indoor social settings
- 'city_ambience' → Urban settings
- 'traffic_distant' → Street scenes
- 'none' → Most scenes - let narration lead

**IMAGE GENERATION:** Natural, relatable, everyday visuals. Include keywords: natural lighting, realistic, relatable, everyday life, candid.
`;
  }
};

// 1. Generate the Script
export const generateHorrorScript = async (userStory: string, genre: Genre = 'horror'): Promise<GeneratedScript> => {
  return withRetry(async () => {
    const SYSTEM_PROMPT = getSystemPrompt(genre);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${SYSTEM_PROMPT}\n\n**USER'S STORY:**\n${userStory}\n\nBreak this story into scenes with intelligent effect placement. Output ONLY valid JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  narration: { type: Type.STRING },
                  hinglish_display: { type: Type.STRING },
                  visual_prompt: { type: Type.STRING },
                  visual_effect: { type: Type.STRING },
                  audio_cue: { type: Type.STRING },
                  effect_timestamp: { type: Type.NUMBER }
                },
                required: ["id", "narration", "visual_prompt", "visual_effect", "audio_cue", "effect_timestamp"]
              }
            }
          },
          required: ["title", "scenes"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No script generated");
    }

    const script = JSON.parse(response.text) as GeneratedScript;
    script.genre = genre; // Add genre to the script
    return script;
  });
};

// 2. Generate Image for a Scene (Using Pollinations.ai - Free API)
export const generateSceneImage = async (visualPrompt: string, genre: Genre = 'horror'): Promise<string> => {
  return withRetry(async () => {
    // Genre-specific enhancement prompts
    let enhancedPrompt = 'vertical 9:16 aspect ratio, hyper-realistic 8k, cinematic lighting, unreal engine 5 render, detailed textures. ';
    
    switch (genre) {
      case 'horror':
        enhancedPrompt += `horror movie scene, dark atmosphere, volumetric fog, eerie shadows, ominous lighting. ${visualPrompt}`;
        break;
      case 'romance':
      case 'poetry':
        enhancedPrompt += `romantic cinematic scene, warm golden hour lighting, soft focus, bokeh effect, dreamy atmosphere, emotional. ${visualPrompt}`;
        break;
      case 'motivational':
        enhancedPrompt += `inspiring motivational scene, bright vibrant lighting, powerful composition, dynamic energy, uplifting atmosphere. ${visualPrompt}`;
        break;
      case 'normal':
      default:
        enhancedPrompt += `natural realistic scene, natural lighting, candid moment, relatable everyday life. ${visualPrompt}`;
        break;
    }
    
    // Pollinations.ai free API - URL encoding the prompt
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1080&height=1920&nologo=true&enhance=true`;
    
    // Fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to generate image: ${response.statusText}`);
    }
    
    // Convert to base64
    const blob = await response.blob();
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove the data:image/xxx;base64, prefix
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    return base64;
  });
};

/**
 * Speed up audio buffer by resampling
 */
function speedUpAudio(
  buffer: AudioBuffer, 
  audioContext: AudioContext, 
  speedFactor: number
): { buffer: AudioBuffer } {
  const newLength = Math.floor(buffer.length / speedFactor);
  const newBuffer = audioContext.createBuffer(
    buffer.numberOfChannels,
    newLength,
    buffer.sampleRate
  );

  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const oldData = buffer.getChannelData(channel);
    const newData = newBuffer.getChannelData(channel);
    
    for (let i = 0; i < newLength; i++) {
      const oldIndex = i * speedFactor;
      const index0 = Math.floor(oldIndex);
      const index1 = Math.min(index0 + 1, oldData.length - 1);
      const fraction = oldIndex - index0;
      
      // Linear interpolation
      newData[i] = oldData[index0] * (1 - fraction) + oldData[index1] * fraction;
    }
  }

  return { buffer: newBuffer };
}

// 3. Generate Audio for a Scene (Using ElevenLabs with alignment data)
export const generateSceneAudio = async (
  text: string, 
  audioContext: AudioContext, 
  language: 'en' | 'hi' = 'en',
  genre: Genre = 'horror'
): Promise<{ buffer: AudioBuffer; alignment: WordAlignment[] }> => {
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';
  
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key is required. Please add it to your .env.local file.');
  }
  
  // Select voice based on language and genre
  let voiceId: string;
  let modelId: string;
  
  if (language === 'hi') {
    // Hindi voices
    if (genre === 'horror') {
      voiceId = '700ZU5xlNrISx4g6Nrlb';  // Viraj - deep suspenseful
      modelId = 'eleven_multilingual_v2';
    } else {
      // Romance, Poetry, Motivational, Normal
      voiceId = 'JTPrASXyK62cF3L7w8hv';  // Hindi voice for non-horror genres
      modelId = 'eleven_multilingual_v2';
    }
  } else {
    // English voice (same for all genres for now)
    voiceId = 'pqHfZKP75CvOlQylNhV4'; // Bill - English deep voice
    modelId = 'eleven_turbo_v2_5';
  }
  
  // Genre-specific voice settings with consistent pacing
  let voiceSettings: any;
  
  switch (genre) {
    case 'horror':
      voiceSettings = {
        stability: 0.75,
        similarity_boost: 0.85,
        style: 0.35,
        use_speaker_boost: true
      };
      break;
    case 'romance':
    case 'poetry':
      voiceSettings = {
        stability: 0.75,  // Slower, more controlled pacing
        similarity_boost: 0.85,
        style: 0.5,  // Emotional but controlled
        use_speaker_boost: true
      };
      break;
    case 'motivational':
      voiceSettings = {
        stability: 0.75,  // Slower, more controlled pacing
        similarity_boost: 0.85,
        style: 0.6,  // Energetic but controlled
        use_speaker_boost: true
      };
      break;
    case 'normal':
    default:
      voiceSettings = {
        stability: 0.75,  // Slower, more controlled pacing
        similarity_boost: 0.85,
        style: 0.4,
        use_speaker_boost: true
      };
      break;
  }
  
  // Request alignment data along with audio
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY
    },
    body: JSON.stringify({
      text: text,
      model_id: modelId,
      output_format: 'mp3_44100_128',
      voice_settings: voiceSettings
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  
  // Decode audio from base64
  const audioData = atob(data.audio_base64);
  const audioArray = new Uint8Array(audioData.length);
  for (let i = 0; i < audioData.length; i++) {
    audioArray[i] = audioData.charCodeAt(i);
  }
  
  const audioBuffer = await audioContext.decodeAudioData(audioArray.buffer);
  
  // Parse alignment data to word-level timestamps
  const alignment: WordAlignment[] = parseAlignment(data.alignment, text);
  
  return { buffer: audioBuffer, alignment };
};

/**
 * Parse ElevenLabs character-level alignment to word-level
 */
function parseAlignment(alignment: any, text: string): WordAlignment[] {
  if (!alignment || !alignment.character_start_times_seconds) {
    // Fallback: estimate word timings if alignment not available
    return estimateWordTimings(text);
  }
  
  const words: WordAlignment[] = [];
  const characters = alignment.characters || [];
  const startTimes = alignment.character_start_times_seconds || [];
  const endTimes = alignment.character_end_times_seconds || [];
  
  let currentWord = '';
  let wordStart = 0;
  
  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];
    
    if (char === ' ' || i === characters.length - 1) {
      if (i === characters.length - 1 && char !== ' ') {
        currentWord += char;
      }
      
      if (currentWord.trim()) {
        words.push({
          word: currentWord.trim(),
          start: wordStart,
          end: endTimes[i] || startTimes[i]
        });
      }
      
      currentWord = '';
      wordStart = startTimes[i + 1] || endTimes[i];
    } else {
      if (currentWord === '') {
        wordStart = startTimes[i];
      }
      currentWord += char;
    }
  }
  
  return words;
}

/**
 * Fallback: Estimate word timings if alignment data not available
 */
function estimateWordTimings(text: string): WordAlignment[] {
  const words = text.split(' ').filter(w => w.trim());
  const avgWordDuration = 0.4; // Average 0.4 seconds per word
  
  return words.map((word, index) => ({
    word: word,
    start: index * avgWordDuration,
    end: (index + 1) * avgWordDuration
  }));
}