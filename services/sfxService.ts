/**
 * SFX Service - Procedural horror sound generation with Web Audio API
 * Higher volume levels for audibility
 */

export interface SFXConfig {
  volume: number;
  loop: boolean;
}

export class SFXManager {
  private audioContext: AudioContext;
  private sfxBuffers: Map<string, AudioBuffer> = new Map();
  private activeSources: AudioBufferSourceNode[] = [];
  private activeGainNodes: GainNode[] = [];
  private customDestination: AudioNode | null = null;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  connectTo(destination: AudioNode): void {
    this.customDestination = destination;
  }

  disconnect(): void {
    this.customDestination = null;
  }

  /**
   * Load all procedural SFX - generates sounds using Web Audio API
   */
  async loadSFX(): Promise<void> {
    console.log('[SFX] Generating procedural horror sounds...');
    
    // Generate all sounds with moderate volume
    const vol = 0.3; // Base volume for procedural generation
    
    this.sfxBuffers.set('drone_low', this.generateDrone(50, 10, vol));
    this.sfxBuffers.set('heartbeat', this.generateHeartbeat(vol));
    this.sfxBuffers.set('heartbeat_fast', this.generateHeartbeatFast(vol));
    this.sfxBuffers.set('heartbeat_thud', this.generateHeartbeat(vol * 1.2));
    this.sfxBuffers.set('heartbeat_fading', this.generateHeartbeatFading(vol * 0.8));
    this.sfxBuffers.set('heartbeat_reverse', this.generateHeartbeatReverse(vol));
    this.sfxBuffers.set('slow_heartbeat', this.generateSlowHeartbeat(vol));
    
    this.sfxBuffers.set('wind_howling', this.generateWind(vol));
    this.sfxBuffers.set('mountain_wind', this.generateWind(vol * 0.8));
    this.sfxBuffers.set('wind_build_up', this.generateWindBuildUp(vol));
    this.sfxBuffers.set('reverse_wind_suction', this.generateReverseWind(vol));
    this.sfxBuffers.set('low_wind_howl', this.generateLowWindHowl(vol * 0.7));
    
    this.sfxBuffers.set('whisper_hindi', this.generateWhisper(vol * 0.8));
    this.sfxBuffers.set('layered_whispers', this.generateLayeredWhispers(vol * 0.8));
    this.sfxBuffers.set('whisper_hit', this.generateWhisperHit(vol));
    this.sfxBuffers.set('soft_whisper_tail', this.generateSoftWhisperTail(vol * 0.6));
    this.sfxBuffers.set('faint_whisper_frequency', this.generateWhisper(vol * 0.4));
    this.sfxBuffers.set('whispers_chain', this.generateWhispersChain(vol * 0.8));
    this.sfxBuffers.set('distorted_female_voice', this.generateDistortedVoice(vol * 0.8));
    this.sfxBuffers.set('whisper', this.generateWhisper(vol * 0.6));
    
    this.sfxBuffers.set('jumpscare_sting', this.generateSting(vol * 1.2));
    this.sfxBuffers.set('sudden_sting', this.generateSting(vol));
    
    this.sfxBuffers.set('scream_piercing', this.generateScream(vol));
    this.sfxBuffers.set('distant_scream', this.generateDistantScream(vol * 0.8));
    this.sfxBuffers.set('sharp_scream_cut', this.generateSharpScreamCut(vol));
    this.sfxBuffers.set('echoing_scream', this.generateEchoingScream(vol * 0.8));
    
    this.sfxBuffers.set('door_knock', this.generateDoorKnock(vol));
    this.sfxBuffers.set('door_creak', this.generateCreak(vol * 0.8));
    this.sfxBuffers.set('footsteps_slow', this.generateFootsteps(vol * 0.8));
    this.sfxBuffers.set('soft_footsteps', this.generateFootsteps(vol * 0.6));
    this.sfxBuffers.set('wet_leaf_crunch', this.generateWetLeafCrunch(vol * 0.8));
    
    this.sfxBuffers.set('breathing_heavy', this.generateBreathing(vol * 0.8));
    this.sfxBuffers.set('rapid_breathing', this.generateRapidBreathing(vol * 0.8));
    
    this.sfxBuffers.set('child_laugh', this.generateChildLaugh(vol * 0.8));
    this.sfxBuffers.set('soft_child_sob', this.generateSoftChildSob(vol * 0.6));
    
    this.sfxBuffers.set('static_burst', this.generateStaticBurst(vol));
    this.sfxBuffers.set('static_crackle', this.generateStaticBurst(vol * 0.8));
    this.sfxBuffers.set('low_radio_crackle', this.generateStaticBurst(vol * 0.6));
    this.sfxBuffers.set('radio_static_distress', this.generateStaticBurst(vol * 0.8));
    this.sfxBuffers.set('radio_static', this.generateStaticBurst(vol));
    this.sfxBuffers.set('electrical_buzz', this.generateElectricalBuzz(vol * 0.8));
    
    this.sfxBuffers.set('clock_ticking', this.generateClockTicking(vol * 0.8));
    this.sfxBuffers.set('scratching_wood', this.generateScratching(vol * 0.8));
    this.sfxBuffers.set('metal_scrape_hit', this.generateMetalScrape(vol));
    this.sfxBuffers.set('soft_metal_scrape', this.generateMetalScrape(vol * 0.6));
    this.sfxBuffers.set('sand_scratching', this.generateSandScratching(vol * 0.7));
    
    this.sfxBuffers.set('heavy_impact', this.generateHeavyImpact(vol * 1.2));
    this.sfxBuffers.set('metallic_doom_impact', this.generateHeavyImpact(vol * 1.2));
    this.sfxBuffers.set('sharp_dull_hit', this.generateHeavyImpact(vol));
    this.sfxBuffers.set('deep_jumpscare_hit', this.generateHeavyImpact(vol * 1.4));
    this.sfxBuffers.set('deep_click', this.generateDeepClick(vol * 0.8));
    
    this.sfxBuffers.set('payal_sound', this.generatePayal(vol * 0.8));
    this.sfxBuffers.set('dog_barking_distant', this.generateDogBark(vol * 0.6));
    this.sfxBuffers.set('temple_bell_reverse', this.generateReverseBell(vol * 0.8));
    this.sfxBuffers.set('bell_echo', this.generateBellEcho(vol * 0.8));
    
    this.sfxBuffers.set('police_siren', this.generatePoliceSiren(vol * 0.8));
    this.sfxBuffers.set('sword_draw', this.generateSwordDraw(vol));
    this.sfxBuffers.set('fire_crackling', this.generateFireCrackling(vol * 0.8));
    this.sfxBuffers.set('camera_shutter', this.generateCameraShutter(vol));
    this.sfxBuffers.set('camera_click_static', this.generateCameraClickStatic(vol));
    this.sfxBuffers.set('city_ambience', this.generateCityAmbience(vol * 0.6));
    this.sfxBuffers.set('growl_animalistic', this.generateGrowl(vol));
    this.sfxBuffers.set('paper_rustle', this.generatePaperRustle(vol * 0.6));
    this.sfxBuffers.set('writing_scratch', this.generateWritingScratch(vol * 0.6));
    this.sfxBuffers.set('chain_rattle', this.generateChainRattle(vol * 0.8));
    this.sfxBuffers.set('conch_wind', this.generateConchWind(vol * 0.8));
    
    this.sfxBuffers.set('deep_ambient_dread', this.generateDrone(40, 8, vol * 0.8));
    this.sfxBuffers.set('flat_frequency', this.generateFlatFrequency(vol * 0.8));
    this.sfxBuffers.set('deep_swell', this.generateDeepSwell(vol));
    this.sfxBuffers.set('tension', this.generateTension(vol * 0.8));
    this.sfxBuffers.set('deep_sub_bass_rise', this.generateDeepSubBassRise(vol));
    
    console.log(`[SFX] Generated ${this.sfxBuffers.size} sound effects at higher volume`);
  }

  // ===== SOUND GENERATORS (continued in next part due to length) =====
  
  private generateDrone(frequency: number, duration: number, volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const drone = Math.sin(2 * Math.PI * frequency * t);
        const variation = Math.sin(2 * Math.PI * (frequency * 0.5) * t) * 0.3;
        data[i] = (drone + variation) * volume;
      }
    }
    return buffer;
  }

  private generateHeartbeat(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 2;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < sampleRate * 0.15; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 20);
        data[i] = Math.sin(2 * Math.PI * 80 * t) * envelope * volume;
      }

      const offset = Math.floor(sampleRate * 0.3);
      for (let i = 0; i < sampleRate * 0.2; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 15);
        const idx = offset + i;
        if (idx < data.length) {
          data[idx] = Math.sin(2 * Math.PI * 60 * t) * envelope * volume;
        }
      }
    }
    return buffer;
  }

  private generateHeartbeatFast(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 1.2;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < sampleRate * 0.1; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 25);
        data[i] = Math.sin(2 * Math.PI * 90 * t) * envelope * volume;
      }

      const offset = Math.floor(sampleRate * 0.2);
      for (let i = 0; i < sampleRate * 0.15; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 20);
        const idx = offset + i;
        if (idx < data.length) {
          data[idx] = Math.sin(2 * Math.PI * 70 * t) * envelope * volume;
        }
      }
    }
    return buffer;
  }

  private generateHeartbeatFading(volume: number): AudioBuffer {
    const buffer = this.generateHeartbeat(volume);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const fadeOut = 1 - (i / data.length) * 0.8;
      data[i] *= fadeOut;
      buffer.getChannelData(1)[i] *= fadeOut;
    }
    return buffer;
  }

  private generateHeartbeatReverse(volume: number): AudioBuffer {
    const buffer = this.generateHeartbeat(volume);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      const reversed = new Float32Array(data.length);
      for (let i = 0; i < data.length; i++) {
        reversed[i] = data[data.length - 1 - i];
      }
      data.set(reversed);
    }
    return buffer;
  }

  private generateSlowHeartbeat(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 3;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < sampleRate * 0.2; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 15);
        data[i] = Math.sin(2 * Math.PI * 70 * t) * envelope * volume;
      }

      const offset = Math.floor(sampleRate * 0.5);
      for (let i = 0; i < sampleRate * 0.25; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 12);
        const idx = offset + i;
        if (idx < data.length) {
          data[idx] = Math.sin(2 * Math.PI * 55 * t) * envelope * volume;
        }
      }
    }
    return buffer;
  }

  private generateWind(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 4;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const noise = (Math.random() * 2 - 1);
        const lowFreq = Math.sin(2 * Math.PI * 100 * t) * 0.4;
        const modulation = Math.sin(t * 2) * 0.5 + 0.5;
        data[i] = (noise * 0.7 + lowFreq) * modulation * volume;
      }
    }
    return buffer;
  }

  private generateWindBuildUp(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 5;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const progress = t / duration;
        const noise = (Math.random() * 2 - 1);
        const intensity = progress * progress;
        data[i] = noise * intensity * volume;
      }
    }
    return buffer;
  }

  private generateReverseWind(volume: number): AudioBuffer {
    const buffer = this.generateWind(volume);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      const reversed = new Float32Array(data.length);
      for (let i = 0; i < data.length; i++) {
        reversed[i] = data[data.length - 1 - i];
      }
      data.set(reversed);
    }
    return buffer;
  }

  private generateWhisper(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 4;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const noise = (Math.random() * 2 - 1);
        const t = i / sampleRate;
        const filter = Math.sin(2 * Math.PI * 200 * t) * 0.5;
        data[i] = noise * filter * volume;
      }
    }
    return buffer;
  }

  private generateLayeredWhispers(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 5;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const whisper1 = (Math.random() * 2 - 1) * Math.sin(2 * Math.PI * 180 * t);
        const whisper2 = (Math.random() * 2 - 1) * Math.sin(2 * Math.PI * 220 * t);
        const whisper3 = (Math.random() * 2 - 1) * Math.sin(2 * Math.PI * 260 * t);
        data[i] = (whisper1 + whisper2 + whisper3) * 0.35 * volume;
      }
    }
    return buffer;
  }

  private generateWhisperHit(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 1;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const noise = (Math.random() * 2 - 1);
        const envelope = Math.exp(-t * 5);
        data[i] = noise * envelope * volume;
      }
    }
    return buffer;
  }

  private generateSoftWhisperTail(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 3;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const noise = (Math.random() * 2 - 1);
        const fade = Math.exp(-t * 1.2);
        const whisperFreq = 2000 + Math.sin(t * 5) * 500;
        const filter = Math.sin(2 * Math.PI * whisperFreq * t);
        data[i] = noise * filter * fade * volume * 0.6;
      }
    }
    return buffer;
  }

  private generateWhispersChain(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 4;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const whisper = (Math.random() * 2 - 1) * Math.sin(2 * Math.PI * 200 * t) * 0.4;
        const metallic = Math.sin(2 * Math.PI * 800 * t) * Math.sin(t * 10) * 0.3;
        data[i] = (whisper + metallic) * volume;
      }
    }
    return buffer;
  }

  private generateDistortedVoice(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 2;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const voiceFreq = 150 + Math.sin(t * 3) * 80;
        const voice = Math.sin(2 * Math.PI * voiceFreq * t);
        const distortion = Math.sin(2 * Math.PI * voiceFreq * 2.5 * t) * 0.4;
        const noise = (Math.random() * 2 - 1) * 0.2;
        data[i] = (voice + distortion + noise) * volume * 0.7;
      }
    }
    return buffer;
  }

  private generateSting(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.3;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const freq = 1200 + t * 800;
        const envelope = Math.exp(-t * 10);
        const sting = Math.sin(2 * Math.PI * freq * t);
        const noise = (Math.random() * 2 - 1) * 0.3;
        data[i] = (sting + noise) * envelope * volume;
      }
    }
    return buffer;
  }

  private generateScream(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 1.5;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const freq = 800 + Math.sin(t * 25) * 400;
        const scream = Math.sin(2 * Math.PI * freq * t);
        const noise = (Math.random() * 2 - 1) * 0.4;
        const envelope = Math.sin((t / duration) * Math.PI);
        data[i] = (scream + noise) * envelope * volume;
      }
    }
    return buffer;
  }

  private generateDistantScream(volume: number): AudioBuffer {
    const buffer = this.generateScream(volume * 0.5);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      const withReverb = new Float32Array(data.length);
      for (let i = 0; i < data.length; i++) {
        withReverb[i] = data[i];
        const delay1 = i - Math.floor(0.1 * buffer.sampleRate);
        const delay2 = i - Math.floor(0.2 * buffer.sampleRate);
        if (delay1 >= 0) withReverb[i] += data[delay1] * 0.3;
        if (delay2 >= 0) withReverb[i] += data[delay2] * 0.15;
      }
      data.set(withReverb);
    }
    return buffer;
  }

  private generateSharpScreamCut(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.8;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        if (t < 0.7) {
          const freq = 900 + Math.sin(t * 30) * 350;
          data[i] = Math.sin(2 * Math.PI * freq * t) * volume;
        } else {
          data[i] = 0;
        }
      }
    }
    return buffer;
  }

  private generateEchoingScream(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 3;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const freq = 900 + Math.sin(t * 20) * 350;
        const scream = Math.sin(2 * Math.PI * freq * t) * 0.3;
        const echo1 = Math.sin(2 * Math.PI * freq * (t - 0.3)) * 0.15;
        const echo2 = Math.sin(2 * Math.PI * freq * (t - 0.6)) * 0.08;
        const envelope = t < 0.8 ? Math.sin((t / 0.8) * Math.PI) : Math.exp(-(t - 0.8) * 3);
        data[i] = (scream + echo1 + echo2) * envelope * volume;
      }
    }
    return buffer;
  }

  private generateDoorKnock(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 3;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      const knockTimes = [0.2, 0.4, 0.6, 1.5, 1.7, 1.9];
      
      for (const knockTime of knockTimes) {
        const startIdx = Math.floor(knockTime * sampleRate);
        for (let i = 0; i < sampleRate * 0.1; i++) {
          const idx = startIdx + i;
          if (idx < data.length) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 30);
            data[idx] += Math.sin(2 * Math.PI * 150 * t) * envelope * volume;
          }
        }
      }
    }
    return buffer;
  }

  private generateCreak(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 2;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const freq = 200 + t * 100;
        const creak = Math.sin(2 * Math.PI * freq * t);
        const noise = (Math.random() * 2 - 1) * 0.3;
        data[i] = (creak * 0.6 + noise) * volume;
      }
    }
    return buffer;
  }

  private generateFootsteps(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 4;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let step = 0; step < 6; step++) {
        const stepTime = step * 0.6;
        const startIdx = Math.floor(stepTime * sampleRate);
        for (let i = 0; i < sampleRate * 0.15; i++) {
          const idx = startIdx + i;
          if (idx < data.length) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 20);
            const noise = (Math.random() * 2 - 1) * 0.7;
            const thump = Math.sin(2 * Math.PI * 100 * t) * 0.3;
            data[idx] += (noise + thump) * envelope * volume;
          }
        }
      }
    }
    return buffer;
  }

  private generateWetLeafCrunch(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 2;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const crunchBase = (Math.random() * 2 - 1) * 0.4;
        const wetFilter = Math.sin(2 * Math.PI * 200 * t) * 0.15;
        const step = Math.floor(t * 5) % 2 === 0 ? 1 : 0.3;
        const stepTime = (t * 5) % 1;
        const envelope = Math.exp(-stepTime * 8) * step;
        data[i] = (crunchBase + wetFilter) * envelope * volume;
      }
    }
    return buffer;
  }

  private generateBreathing(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 4;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const breathCycle = (t * 2) % 1;
        const breath = Math.sin(breathCycle * Math.PI);
        const noise = (Math.random() * 2 - 1) * 0.5;
        data[i] = noise * breath * volume;
      }
    }
    return buffer;
  }

  private generateRapidBreathing(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 3;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const breathCycle = (t * 5) % 1;
        const breathPhase = breathCycle < 0.4 ? breathCycle / 0.4 : (breathCycle - 0.4) / 0.6;
        const airNoise = (Math.random() * 2 - 1) * 0.3;
        const breathEnv = Math.sin(breathPhase * Math.PI) * 0.8;
        data[i] = airNoise * breathEnv * volume;
      }
    }
    return buffer;
  }

  private generateChildLaugh(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 2;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const freq = 600 + Math.sin(t * 15) * 150;
        const laugh = Math.sin(2 * Math.PI * freq * t);
        const giggle = Math.abs(Math.sin(t * 8)) > 0.6 ? 1 : 0.2;
        data[i] = laugh * giggle * volume;
      }
    }
    return buffer;
  }

  private generateSoftChildSob(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 4;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const cryFreq = 600 + Math.sin(t * 8) * 150;
        const cry = Math.sin(2 * Math.PI * cryFreq * t) * 0.25;
        const breathPattern = Math.abs(Math.sin(t * 2.5)) * 0.5 + 0.5;
        const sobPattern = Math.sin(t * 3) > 0 ? 1 : 0.3;
        data[i] = cry * breathPattern * sobPattern * volume * 0.6;
      }
    }
    return buffer;
  }

  private generateStaticBurst(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 1;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        data[i] = (Math.random() * 2 - 1) * volume;
      }
    }
    return buffer;
  }

  private generateElectricalBuzz(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 3;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const buzz = Math.sin(2 * Math.PI * 120 * t);
        const flicker = Math.random() > 0.7 ? 1 : 0.3;
        const noise = (Math.random() * 2 - 1) * 0.2;
        data[i] = (buzz * flicker + noise) * volume;
      }
    }
    return buffer;
  }

  private generateClockTicking(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 4;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let tick = 0; tick < 8; tick++) {
        const tickTime = tick * 0.5;
        const startIdx = Math.floor(tickTime * sampleRate);
        for (let i = 0; i < sampleRate * 0.02; i++) {
          const idx = startIdx + i;
          if (idx < data.length) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 100);
            data[idx] += Math.sin(2 * Math.PI * 2000 * t) * envelope * volume;
          }
        }
      }
    }
    return buffer;
  }

  private generateScratching(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 3;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const noise = (Math.random() * 2 - 1);
        const scratch = Math.sin(2 * Math.PI * (400 + t * 200) * t);
        const pattern = Math.abs(Math.sin(t * 5)) > 0.5 ? 1 : 0.2;
        data[i] = (noise * 0.6 + scratch * 0.4) * pattern * volume;
      }
    }
    return buffer;
  }

  private generateMetalScrape(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 1.5;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const base = Math.sin(2 * Math.PI * 280 * t) * 0.3;
        const harm1 = Math.sin(2 * Math.PI * 560 * t) * 0.2;
        const scrape = (Math.random() * 2 - 1) * 0.25 * Math.sin(t * 30);
        const envelope = Math.exp(-t * 3);
        data[i] = (base + harm1 + scrape) * envelope * volume;
      }
    }
    return buffer;
  }

  private generateHeavyImpact(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 1;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 8);
        const impact = Math.sin(2 * Math.PI * 40 * t);
        const noise = (Math.random() * 2 - 1) * 0.5;
        data[i] = (impact + noise) * envelope * volume;
      }
    }
    return buffer;
  }

  private generateDeepClick(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.2;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 50);
        data[i] = Math.sin(2 * Math.PI * 80 * t) * envelope * volume;
      }
    }
    return buffer;
  }

  private generatePayal(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 2;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let jingle = 0; jingle < 8; jingle++) {
        const jingleTime = jingle * 0.25;
        const startIdx = Math.floor(jingleTime * sampleRate);
        for (let i = 0; i < sampleRate * 0.2; i++) {
          const idx = startIdx + i;
          if (idx < data.length) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 15);
            const bell1 = Math.sin(2 * Math.PI * 1200 * t);
            const bell2 = Math.sin(2 * Math.PI * 1800 * t);
            data[idx] += (bell1 + bell2) * envelope * volume * 0.5;
          }
        }
      }
    }
    return buffer;
  }

  private generateDogBark(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 3;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      const barkTimes = [0.5, 1.2, 2.1];
      
      for (const barkTime of barkTimes) {
        const startIdx = Math.floor(barkTime * sampleRate);
        for (let i = 0; i < sampleRate * 0.3; i++) {
          const idx = startIdx + i;
          if (idx < data.length) {
            const t = i / sampleRate;
            const freq = 200 + Math.sin(t * 50) * 100;
            const bark = Math.sin(2 * Math.PI * freq * t);
            const envelope = Math.exp(-t * 10);
            data[idx] += bark * envelope * volume * 0.3;
          }
        }
      }
    }
    return buffer;
  }

  private generateReverseBell(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 3;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = (buffer.length - i) / sampleRate;
        const bell = Math.sin(2 * Math.PI * 800 * t);
        const harmonics = Math.sin(2 * Math.PI * 1600 * t) * 0.3;
        const envelope = Math.exp(-t * 1.5);
        data[i] = (bell + harmonics) * envelope * volume;
      }
    }
    return buffer;
  }

  private generateBellEcho(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 4;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const bell = Math.sin(2 * Math.PI * 800 * t);
        const echo1 = Math.sin(2 * Math.PI * 800 * (t - 0.5)) * 0.4;
        const echo2 = Math.sin(2 * Math.PI * 800 * (t - 1.0)) * 0.2;
        const envelope = Math.exp(-t * 1);
        data[i] = (bell + echo1 + echo2) * envelope * volume;
      }
    }
    return buffer;
  }

  private generatePoliceSiren(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 4;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const freq = 600 + Math.sin(t * 4) * 200;
        const siren = Math.sin(2 * Math.PI * freq * t);
        data[i] = siren * volume * 0.4;
      }
    }
    return buffer;
  }

  private generateSwordDraw(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 1;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const sweep = 400 + t * 1000;
        const metallic = Math.sin(2 * Math.PI * sweep * t);
        const noise = (Math.random() * 2 - 1) * 0.3;
        data[i] = (metallic * 0.7 + noise) * volume;
      }
    }
    return buffer;
  }

  private generateFireCrackling(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 4;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const noise = (Math.random() * 2 - 1);
        const crackle = Math.random() > 0.95 ? Math.random() * 2 : 0;
        data[i] = (noise * 0.3 + crackle) * volume;
      }
    }
    return buffer;
  }

  private generateCameraShutter(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.3;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const click = Math.exp(-t * 50);
        const mechanical = Math.sin(2 * Math.PI * 200 * t) * click;
        data[i] = mechanical * volume;
      }
    }
    return buffer;
  }

  private generateCityAmbience(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 6;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const traffic = Math.sin(2 * Math.PI * 80 * t) * 0.2;
        const noise = (Math.random() * 2 - 1) * 0.15;
        const distant = Math.sin(2 * Math.PI * 150 * t) * Math.sin(t * 0.5) * 0.1;
        data[i] = (traffic + noise + distant) * volume;
      }
    }
    return buffer;
  }

  private generateGrowl(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 2;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const growlFreq = 60 + Math.sin(t * 5) * 20;
        const growl = Math.sin(2 * Math.PI * growlFreq * t);
        const texture = (Math.random() * 2 - 1) * 0.4;
        data[i] = (growl * 0.6 + texture) * volume;
      }
    }
    return buffer;
  }

  private generatePaperRustle(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 2;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const rustle = (Math.random() * 2 - 1);
        const crinkle = Math.sin(2 * Math.PI * (800 + Math.random() * 400) * t) * 0.3;
        const pattern = Math.abs(Math.sin(t * 3)) > 0.4 ? 1 : 0.2;
        data[i] = (rustle * 0.5 + crinkle) * pattern * volume;
      }
    }
    return buffer;
  }

  private generateWritingScratch(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 3;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const scratch = Math.sin(2 * Math.PI * (600 + t * 100) * t);
        const paper = (Math.random() * 2 - 1) * 0.2;
        const writing = Math.abs(Math.sin(t * 10)) > 0.5 ? 1 : 0.1;
        data[i] = (scratch * 0.4 + paper) * writing * volume;
      }
    }
    return buffer;
  }

  private generateChainRattle(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 2;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let rattle = 0; rattle < 10; rattle++) {
        const rattleTime = rattle * 0.2;
        const startIdx = Math.floor(rattleTime * sampleRate);
        for (let i = 0; i < sampleRate * 0.15; i++) {
          const idx = startIdx + i;
          if (idx < data.length) {
            const t = i / sampleRate;
            const metallic = Math.sin(2 * Math.PI * 800 * t) + Math.sin(2 * Math.PI * 1200 * t);
            const envelope = Math.exp(-t * 20);
            data[idx] += metallic * envelope * volume * 0.5;
          }
        }
      }
    }
    return buffer;
  }

  private generateConchWind(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 4;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const wind = (Math.random() * 2 - 1) * 0.3;
        const conch = Math.sin(2 * Math.PI * 120 * t) * 0.4;
        const resonance = Math.sin(2 * Math.PI * 240 * t) * 0.2;
        data[i] = (wind + conch + resonance) * volume;
      }
    }
    return buffer;
  }

  private generateFlatFrequency(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 4;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        data[i] = Math.sin(2 * Math.PI * 220 * t) * volume * 0.6;
      }
    }
    return buffer;
  }

  private generateDeepSwell(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 5;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const progress = t / duration;
        const swell = Math.sin(progress * Math.PI);
        const deep = Math.sin(2 * Math.PI * 45 * t);
        data[i] = deep * swell * volume;
      }
    }
    return buffer;
  }

  private generateTension(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 6;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const freq = 100 + (t / duration) * 200;
        const envelope = (t / duration) * 0.6;
        data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * volume;
      }
    }
    return buffer;
  }

  private generateLowWindHowl(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 5;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const lowFreq = Math.sin(2 * Math.PI * 60 * t) * 0.4;
        const midFreq = Math.sin(2 * Math.PI * 120 * t) * 0.3;
        const noise = (Math.random() * 2 - 1) * 0.4;
        const modulation = Math.sin(t * 1.5) * 0.5 + 0.5;
        data[i] = (lowFreq + midFreq + noise) * modulation * volume;
      }
    }
    return buffer;
  }

  private generateSandScratching(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 4;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const grainNoise = (Math.random() * 2 - 1) * 0.6;
        const scratchFreq = 300 + Math.sin(t * 8) * 100;
        const scratch = Math.sin(2 * Math.PI * scratchFreq * t) * 0.25;
        const dragPattern = Math.abs(Math.sin(t * 3)) > 0.4 ? 1 : 0.3;
        data[i] = (grainNoise * 0.7 + scratch) * dragPattern * volume;
      }
    }
    return buffer;
  }

  private generateDeepSubBassRise(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 6;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const progress = t / duration;
        const subBass = Math.sin(2 * Math.PI * 30 * t) * 0.5;
        const riser = Math.sin(2 * Math.PI * (40 + progress * 80) * t) * 0.4;
        const envelope = progress;
        data[i] = (subBass + riser) * envelope * volume;
      }
    }
    return buffer;
  }

  private generateCameraClickStatic(volume: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.8;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      // Camera click (first 0.1s)
      for (let i = 0; i < sampleRate * 0.1; i++) {
        const t = i / sampleRate;
        const click = Math.exp(-t * 50);
        const mechanical = Math.sin(2 * Math.PI * 200 * t) * click;
        data[i] = mechanical * volume;
      }
      
      // Static burst (remaining time)
      const staticStart = Math.floor(sampleRate * 0.1);
      for (let i = staticStart; i < buffer.length; i++) {
        const t = (i - staticStart) / sampleRate;
        const staticNoise = (Math.random() * 2 - 1);
        const fadeOut = Math.exp(-t * 3);
        data[i] = staticNoise * fadeOut * volume * 0.7;
      }
    }
    return buffer;
  }

  // ===== PLAYBACK METHODS =====

  playRandomDrone(volume: number = 0.2): AudioBufferSourceNode | null {
    const buffer = this.sfxBuffers.get('drone_low');
    if (!buffer) return null;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    source.loop = true;
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    if (this.customDestination) {
      gainNode.connect(this.customDestination);
    }

    source.start();
    this.activeSources.push(source);
    this.activeGainNodes.push(gainNode);

    return source;
  }

  playCue(cueName: string, volume: number = 0.3): AudioBufferSourceNode | null {
    if (cueName === 'silence') {
      this.fadeOutAll(0.1);
      setTimeout(() => {}, 1000);
      console.log('[SFX] Silence effect triggered (1s)');
      return null;
    }

    const buffer = this.sfxBuffers.get(cueName);

    if (!buffer) {
      console.warn('Audio cue not loaded:', cueName);
      return null;
    }

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    source.loop = false;
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    if (this.customDestination) {
      gainNode.connect(this.customDestination);
    }

    source.start();
    
    source.onended = () => {
      const srcIndex = this.activeSources.indexOf(source);
      const gainIndex = this.activeGainNodes.indexOf(gainNode);
      if (srcIndex > -1) this.activeSources.splice(srcIndex, 1);
      if (gainIndex > -1) this.activeGainNodes.splice(gainIndex, 1);
    };

    this.activeSources.push(source);
    this.activeGainNodes.push(gainNode);

    return source;
  }

  playHeartbeat(volume: number = 0.25): AudioBufferSourceNode | null {
    const buffer = this.sfxBuffers.get('heartbeat');

    if (!buffer) {
      console.warn('Heartbeat SFX not loaded');
      return null;
    }

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    source.loop = true;
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    if (this.customDestination) {
      gainNode.connect(this.customDestination);
    }

    source.start();
    this.activeSources.push(source);
    this.activeGainNodes.push(gainNode);

    return source;
  }

  stopAll(): void {
    this.activeSources.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Source already stopped
      }
    });
    this.activeGainNodes.forEach(gain => {
      try {
        gain.disconnect();
      } catch (e) {
        // Already disconnected
      }
    });
    this.activeSources = [];
    this.activeGainNodes = [];
  }

  fadeOutAll(duration: number = 1): void {
    const now = this.audioContext.currentTime;
    this.activeGainNodes.forEach(gainNode => {
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.linearRampToValueAtTime(0, now + duration);
    });

    setTimeout(() => this.stopAll(), duration * 1000);
  }
}
