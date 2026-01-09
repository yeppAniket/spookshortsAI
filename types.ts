export interface WordAlignment {
  word: string;
  start: number;  // seconds
  end: number;    // seconds
}

export type Genre = 
  | 'horror'        // Dark, suspenseful, creepy
  | 'romance'       // Love, breakup, emotional
  | 'motivational'  // Inspiring, uplifting, powerful
  | 'poetry'        // Shayari, romantic/sad poetry
  | 'normal';       // Everyday stories, slice of life

export type VisualEffect = 
  // Horror effects
  | 'slow_zoom_in'           // Default: grows 15-20% over scene (creeping closer)
  | 'rapid_shake'            // Jumpscare: violent jitter ±10px (camcorder drop)
  | 'chromatic_aberration'   // Ghost/Entity: RGB split (supernatural interference)
  | 'flash_red'              // Violence/screams: 0.2s red overlay (danger signal)
  | 'vignette_pulse'         // Suspense: pulsing dark corners (tunnel vision)
  | 'static_noise'           // Transitions: TV snow (cursed tape aesthetic)
  | 'grain_dark_overlay'     // Film grain with dark overlay (night footage)
  | 'lens_dirt_fog'          // Dirty lens with fog effect
  | 'slow_zoom_glitch'       // Slow zoom with digital glitch
  | 'wave_distortion_pulse'  // Wave/ripple distortion effect
  | 'audio_mute_flash'       // Visual flash when audio cuts
  | 'dust_particle_freeze'   // Dust particles with freeze frame
  | 'fade_to_black'          // Gradual fade to black
  // Romance/Poetry effects
  | 'soft_blur'              // Soft romantic blur
  | 'warm_glow'              // Warm golden glow overlay
  | 'gentle_fade'            // Gentle fade in/out
  | 'bokeh_hearts'           // Heart-shaped bokeh effect
  | 'dreamy_overlay'         // Dreamy soft overlay
  // Motivational effects
  | 'bright_flare'           // Bright lens flare
  | 'dynamic_zoom'           // Dynamic energetic zoom
  | 'color_boost'            // Enhanced vibrant colors
  | 'light_rays'             // Inspiring light rays
  // Normal/General effects
  | 'natural_pan'            // Natural camera pan
  | 'subtle_movement'        // Subtle natural movement
  | 'clean_cut'              // Clean transition
  | 'none';

export type AudioCue = 
  | 'drone_low'              // Background rumble (40-60Hz) at 30% volume
  | 'payal_sound'            // Anklets "Chhan Chhan" - signals Chudail/female spirit
  | 'dog_barking_distant'    // Indian street dogs - "they see a ghost"
  | 'temple_bell_reverse'    // Reversed Ghanti - twisted symbol of safety
  | 'jumpscare_sting'        // Metallic screech/violin stab
  | 'whisper_hindi'          // "Idhar aao" / "Mat jao" whispers
  | 'silence'                // Cut all audio for 1s before jumpscare
  | 'heartbeat'              // Tension builder
  | 'heartbeat_fast'         // Rapid panicked heartbeat
  | 'door_knock'             // Slow, ominous knocking
  | 'door_creak'             // Rusty door opening
  | 'footsteps_slow'         // Heavy footsteps approaching
  | 'wind_howling'           // Eerie wind sound
  | 'breathing_heavy'        // Panicked breathing
  | 'child_laugh'            // Creepy child giggle
  | 'static_burst'           // TV/radio interference
  | 'clock_ticking'          // Tense clock ticking
  | 'scratching_wood'        // Nails scratching on wood/wall
  | 'scream_piercing'        // High-pitched scream
  | 'sword_draw'             // Sword unsheathing metallic sound
  | 'fire_crackling'         // Fire burning and crackling
  | 'camera_shutter'         // Camera click/flash
  | 'city_ambience'          // Night city background sounds
  | 'heavy_impact'           // Heavy thud/impact sound
  | 'police_siren'           // Distant police siren
  | 'electrical_buzz'        // Flickering light/electrical hum
  | 'growl_animalistic'      // Low demonic growl
  | 'mountain_wind'          // Cold Himalayan wind howling
  | 'paper_rustle'           // Old documents/pages turning
  | 'soft_footsteps'         // Slow approaching footsteps
  | 'layered_whispers'       // Multiple overlapping whispers
  | 'distant_scream'         // Far away scream
  | 'bell_echo'              // Temple bell with long reverb
  | 'whisper_hit'            // Sudden close whisper
  | 'conch_wind'             // Conch shell mixed with wind
  | 'heartbeat_fading'       // Heartbeat that fades out
  | 'deep_click'             // Deep unnatural click/crack sound
  | 'writing_scratch'        // Pen scratching on paper with reverb
  | 'whispers_chain'         // Layered whispers with metallic chain rattling
  | 'chain_rattle'           // Iron chain movement
  | 'sudden_sting'           // Sharp metallic sting
  | 'metallic_doom_impact'   // Heavy metallic impact with reverb
  | 'wind_build_up'          // Wind gradually increasing in intensity
  | 'faint_whisper_frequency' // Very faint layered whispers
  | 'sharp_scream_cut'       // Scream that cuts off abruptly
  | 'radio_static_distress'  // Radio static with distress signals
  | 'heartbeat_reverse'      // Heartbeat played backwards
  | 'deep_jumpscare_hit'     // Deep bass jumpscare impact
  | 'deep_ambient_dread'     // Deep ominous ambient drone
  | 'low_radio_crackle'      // Low frequency radio interference
  | 'sharp_dull_hit'         // Sudden dull impact sound
  | 'static_crackle'         // Electronic static crackle
  | 'slow_heartbeat'         // Slow tension heartbeat
  | 'echoing_scream'         // Distant echoing scream
  | 'wet_leaf_crunch'        // Wet leaves crunching underfoot
  | 'soft_child_sob'         // Child crying softly (creepy)
  | 'heartbeat_thud'         // Heavy single heartbeat thud
  | 'metal_scrape_hit'       // Metal scraping impact
  | 'rapid_breathing'        // Fast panicked breathing
  | 'soft_whisper_tail'      // Whisper with long fading tail
  | 'reverse_heartbeat'      // Backward heartbeat (unsettling)
  | 'soft_metal_scrape'      // Soft metallic scraping sound
  | 'flat_frequency'         // Monotone flat frequency drone
  | 'reverse_wind_suction'   // Wind sound played in reverse
  | 'deep_swell'             // Deep swelling ambient sound
  | 'distorted_female_voice' // Distorted female voice/whisper
  | 'radio_static'           // Radio static interference
  | 'low_wind_howl'          // Low frequency wind howling at beach
  | 'sand_scratching'        // Sand being scratched/dragged
  | 'deep_sub_bass_rise'     // Deep sub-bass rising tension
  | 'silence_cut'            // Complete audio cutoff effect
  | 'camera_click_static'    // Camera shutter with static burst
  // Romance/Poetry sounds
  | 'soft_piano'             // Soft piano notes
  | 'gentle_strings'         // Gentle string melody
  | 'rain_soft'              // Soft rain ambience
  | 'birds_chirping'         // Morning birds
  | 'acoustic_guitar'        // Soft acoustic guitar
  // Motivational sounds
  | 'uplifting_rise'         // Uplifting rising tone
  | 'achievement_chime'      // Success/achievement sound
  | 'power_whoosh'           // Powerful whoosh
  | 'inspiring_swell'        // Inspiring orchestral swell
  // Normal sounds
  | 'ambient_nature'         // Natural outdoor ambience
  | 'cafe_chatter'           // Cafe background noise
  | 'traffic_distant'        // Distant traffic sounds
  | 'none';

export interface Scene {
  id: number;
  narration: string;
  hinglish_display?: string; // Hinglish text for UI display (when narration is Hindi)
  visual_prompt: string;
  imageData?: string; // base64
  audioBuffer?: AudioBuffer;
  alignment?: WordAlignment[]; // Word-level timestamps for captions
  visual_effect?: VisualEffect; // ONE major visual effect per scene
  audio_cue?: AudioCue; // Audio effect cue (plays 100ms before visual)
  effect_timestamp?: number; // When to trigger effect (seconds into scene)
  genre?: Genre; // Genre for this scene (inherited from script)
}

export interface GeneratedScript {
  title: string;
  scenes: Scene[];
  genre?: Genre; // Overall genre of the script
}

export enum AppStatus {
  IDLE = 'IDLE',
  GENERATING_SCRIPT = 'GENERATING_SCRIPT',
  GENERATING_IMAGES = 'GENERATING_IMAGES',
  GENERATING_AUDIO = 'GENERATING_AUDIO',
  READY = 'READY',
  ERROR = 'ERROR'
}

export interface GenerationProgress {
  current: number;
  total: number;
  message: string;
}