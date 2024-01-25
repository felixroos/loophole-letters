@external("env", "log")
  export declare function log(s:String): void
//
export abstract class Voice {
  freq: f32;
  gain: f32;
  note: f32;
  t: f32;
  constructor(freq: f32, gain: f32) {
    this.freq = freq;
    this.gain = gain;
  }
  allocate(note: f32, velocity: i32): void {
      //log(`allocate ${note}`)
      const freq = midi2freq(note);
      const gain = (velocity as f32) / 127;
      this.freq = freq;
      this.gain = gain;
      this.note = note;
  }
  free(): void {
      //log(`free ${this.note}`)
      this.gain = 0;
      this.note = -1;
  }
  isFree(): bool {
    return this.gain === 0;  
  }
  playsNote(note: f32): bool {
    return this.note === note;
  }
  step(): void {
    this.t += 1/44100;
  }
  abstract next(): f32;
}
export let midi2freq = (midi: f32): f32 => 2.0 ** ((midi - 69) / 12) * 440;
//
export function saw(f: f32, t: f32): f32 {
  return (((f * t * 1.0) % 1.0) - 0.5) * 1.0;
}
export function sin(f: f32, t: f32): f32 {
  return Math.sin(2 * Math.PI * t * f) as f32;
}
/* export function midiNote(note: f32, velocity: i32): void {
  log(`note: ${note}, velocity: ${velocity}`)
  for (let n = 0; n < numvoices; n++) {
    if (voices[n].playsNote(note) && velocity === 0) {
       voices[n].free();
    } else if (voices[n].isFree() && velocity > 0) {
      log(`allocate ${n}`)
      voices[n].allocate(note, velocity)
      break;
    }
  }
} */

export class SawVoice extends Voice {
  next(): f32 {
    this.step();
    return this.gain * saw(this.freq, this.t)
  }
}
export class SineVoice extends Voice {
  next(): f32 {
    this.step();
    return this.gain * sin(this.freq, this.t)
  }
}

import { DeepBass } from './instruments/bass/deepbass';
export class DeepBassVoice extends Voice {
  voice: DeepBass = new DeepBass();
  next(): f32 {
    this.voice.next();
    this.voice.note = this.note;
    return this.gain * this.voice.signal.left
  }
}
import { BrassyLead } from './instruments/lead/brassy';
export class BrassyLeadVoice extends Voice {
  voice: BrassyLead = new BrassyLead();
  next(): f32 {
    this.voice.next();
    this.voice.note = this.note;
    return this.gain * this.voice.signal.left
  }
}
import { SoftPad } from './instruments/pad/softpad.class';
export class SoftPadVoice extends Voice {
  voice: SoftPad = new SoftPad();
  next(): f32 {
    this.voice.next();
    this.voice.note = this.note;
    return this.gain * this.voice.signal.left
  }
}
import { FlatPad } from './instruments/pad/flatpad.class';
export class FlatPadVoice extends Voice {
  voice: FlatPad = new FlatPad();
  next(): f32 {
    this.voice.next();
    this.voice.note = this.note;
    return this.gain * this.voice.signal.left
  }
}
// This seems broken:
import { Pad } from './instruments/pad.class';
export class PadVoice extends Voice {
  voice: Pad = new Pad();
  next(): f32 {
    this.voice.next();
    this.voice.note = this.note;
    return this.gain * this.voice.signal.left
  }
}

import { Eftang } from './instruments/lead/eftang';
export class EftangVoice extends Voice {
  voice: Eftang = new Eftang();
  next(): f32 {
    this.voice.next();
    this.voice.note = this.note;
    return this.gain * this.voice.signal.left
  }
}

import { SineLead } from './instruments/lead/sinelead';
export class SineLeadVoice extends Voice {
  voice: SineLead = new SineLead();
  next(): f32 {
    this.voice.next();
    this.voice.note = this.note;
    return this.gain * this.voice.signal.left
  }
}

import { SawBass } from './instruments/sawbass.class';
export class SawBassVoice extends Voice {
  voice: SawBass = new SawBass();
  next(): f32 {
    this.voice.next();
    this.voice.note = this.note;
    return this.gain * this.voice.signal.left
  }
}
// this is pretty much the same as SawBass?
import { SawBass2 } from './instruments/bass/sawbass2.class';
export class SawBass2Voice extends Voice {
  voice: SawBass2 = new SawBass2();
  next(): f32 {
    this.voice.next();
    this.voice.note = this.note;
    return this.gain * this.voice.signal.left
  }
}

import { SawBass3 } from './instruments/bass/sawbass3';
export class SawBass3Voice extends Voice {
  voice: SawBass3 = new SawBass3();
  next(): f32 {
    this.voice.next();
    this.voice.note = this.note;
    return this.gain * this.voice.signal.left
  }
}
import { Kick2 } from './instruments/drums/kick2.class';
export class Kick2Voice extends Voice {
  voice: Kick2 = new Kick2();
  next(): f32 {
    this.voice.next();
    this.voice.note = this.note;
    return this.gain * this.voice.signal.left
  }
}
import { Rimshot } from './instruments/drums/rimshot.class';
export class RimshotVoice extends Voice {
  voice: Rimshot = new Rimshot();
  next(): f32 {
    this.voice.next();
    this.voice.note = this.note;
    return this.gain * this.voice.signal.left
  }
}
import { Snare2 } from './instruments/drums/snare2.class';
export class Snare2Voice extends Voice {
  voice: Snare2 = new Snare2();
  next(): f32 {
    this.voice.next();
    this.voice.note = this.note;
    return this.gain * this.voice.signal.left
  }
}

import { SubPiano } from './instruments/piano/subpiano';
export class SubPianoVoice extends Voice {
  voice: SubPiano = new SubPiano();
  next(): f32 {
    this.voice.next();
    this.voice.note = this.note;
    return this.gain * this.voice.signal.left
  }
}

import { DriveLead } from './instruments/drivelead.class';
export class DriveLeadVoice extends Voice {
  voice: DriveLead = new DriveLead();
  next(): f32 {
    this.voice.next();
    this.voice.note = this.note;
    return this.gain * this.voice.signal.left
  }
}

import { Hihat } from './instruments/hihat.class';
export class HihatVoice extends Voice {
  voice: Hihat = new Hihat();
  next(): f32 {
    this.voice.next();
    this.voice.note = this.note;
    return this.gain * this.voice.signal.left
  }
}

// TODO: find out how to use this
import { Instrument } from './instruments/instrument.class';
export class InstrumentVoice extends Voice {
  voice: Instrument;
  next(): f32 {
    this.voice.next();
    this.voice.note = this.note;
    return this.gain * this.voice.signal.left
  }
}
import { Kick } from './instruments/kick.class';
export class KickVoice extends Voice {
  voice: Kick = new Kick();
  next(): f32 {
    this.voice.next();
    this.voice.note = this.note;
    return this.gain * this.voice.signal.left
  }
}

import { Snare } from './instruments/snare.class';
export class SnareVoice extends Voice {
  voice: Snare = new Snare();
  next(): f32 {
    this.voice.next();
    this.voice.note = this.note;
    return this.gain * this.voice.signal.left
  }
}
import { SquareLead } from './instruments/squarelead.class';
export class SquareLeadVoice extends Voice {
  voice: SquareLead = new SquareLead();
  next(): f32 {
    this.voice.next();
    this.voice.note = this.note;
    return this.gain * this.voice.signal.left
  }
}
import { Test4KlangString } from './instruments/string1.class';
export class Test4KlangStringVoice extends Voice {
  voice: Test4KlangString = new Test4KlangString();
  next(): f32 {
    this.voice.next();
    this.voice.note = this.note;
    return this.gain * this.voice.signal.left
  }
}
import { TestInstrument } from './instruments/testinstrument.class';
export class TestInstrumentVoice extends Voice {
  voice: TestInstrument = new TestInstrument();
  next(): f32 {
    this.voice.next();
    this.voice.note = this.note;
    return this.gain * this.voice.signal.left
  }
}


export class MySynthVoice extends Voice {
  next(): f32 {
    this.step();
    return this.gain * sin(this.freq, this.t)
  }
}