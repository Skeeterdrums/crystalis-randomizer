import {Entity} from './entity.js';
import {Location} from './location.js';
import {hex, readLittleEndian, writeLittleEndian} from './util.js';
import {Writer} from './writer.js';
import {Rom} from '../rom.js';

// NOTE: Would be nice to call this Object, but that seems confusing...
export class ObjectData extends Entity {

  used: boolean;
  name: string;

  pointer: number;
  base: number;

  sfx: number;
  data: number[];

  constructor(rom: Rom, id: number) {
    super(rom, id);
    this.used = true;
    this.name = '';
    this.pointer = 0x1ac00 + (id << 1);
    this.base = readLittleEndian(rom.prg, this.pointer) + 0x10000;
    this.sfx = rom.prg[this.base];
    this.data = [];
    let a = this.base + 1;
    let m = 0;
    for (let i = 0; i < 32; i++) {
      if (!(i & 7)) {
        m = rom.prg[a++];
      }
      this.data.push(m & 0x80 ? rom.prg[a++] : 0);
      m <<= 1;
    }
  }

  // Returns a byte array for this entry
  serialize(): number[] {
    const out = [this.sfx];
    for (let i = 0; i < 4; i++) {
      const k = out.length;
      out.push(0);
      for (let j = 0; j < 8; j++) {
        if (this.data[8 * i + j]) {
          out[k] |= (0x80 >>> j);
          out.push(this.data[8 * i + j]);
        }
      }
    }
    return out;
  }

  async write(writer: Writer) {
    const address = await writer.write(this.serialize(), 0x1a000, 0x1bfff,
                                       `Object ${hex(this.id)}`);
    writeLittleEndian(writer.rom, this.pointer, address - 0x10000);
  }

  get(addr: number): number {
    return this.data[(addr - 0x300) >>> 5];
  }

  parents(): ObjectData[] {
    // If this is a projectile that is the parent of some monster,
    // return an array of parents that spawned it.
    return [];
    // return this.rom.monsters.filter(
    //     (m: ObjectData) => m.child &&
    //                        this.rom.adHocSpawns[m.child].objectId === this.id);
  }

  locations(): Location[] {
    // TODO - handle non-monster NPCs.
    return this.rom.locations.filter((l: Location) =>
        l.used && l.spawns.some(spawn =>
            spawn.isMonster() && spawn.monsterId === this.id));
  }

  palettes(includeChildren = false): number[] {
    // NOTE: this gets the wrong result for ice/sand zombies and blobs.
    //  - may just need to guess/assume and experiment?
    //  - zombies (action 0x22) look like should just be 3
    //  - lavamen/blobs (action 0x29) are 2
    //  - wraith shadows (action 0x26) are 3
    if (this.action === 0x22) return [3]; // zombie
    let metaspriteId = this.data[0];
    if (this.action === 0x2a) metaspriteId = this.data[31] | 1;
    if (this.action === 0x29) metaspriteId = 0x6b; // blob
    if (this.action === 0x26) metaspriteId = 0x9c;

    const ms = this.rom.metasprites[metaspriteId];
    const childMs =
        includeChildren && this.child ?
            this.rom.metasprites[
                this.rom.objects[
                    this.rom.adHocSpawns[this.child].objectId].data[0]] :
            null;
    const s = new Set([...ms.palettes(), ...(childMs ? childMs.palettes() : [])]);
    return [...s];
  }

  // 0 for wind, 1 for fire, 2 for water, 3 for thunder
  isVulnerable(element: number) {
    return !(this.elements & (1 << element));
  }

  isShadow() {
    // NOTE: internally the game checks that the metasprite
    // is $a7 (see $350f3), but we'll just hardcode.
    return this.id === 0x7b || this.id === 0x8c;
  }

  get metasprite(): number { return METASPRITE.get(this.data); }
  set metasprite(x: number) { METASPRITE.set(this.data, x); }

  get speed(): number { return SPEED.get(this.data); }
  set speed(x: number) { SPEED.set(this.data, x); }

  get collisionPlane(): number { return COLLISION_PLANE.get(this.data); }
  set collisionPlane(x: number) { COLLISION_PLANE.set(this.data, x); }

  get hitbox(): number { return HITBOX.get(this.data); }
  set hitbox(x: number) { HITBOX.set(this.data, x); }

  get hp(): number { return HP.get(this.data); }
  set hp(x: number) { HP.set(this.data, x); }

  get atk(): number { return ATK.get(this.data); }
  set atk(x: number) { ATK.set(this.data, x); }

  get def(): number { return DEF.get(this.data); }
  set def(x: number) { DEF.set(this.data, x); }

  get level(): number { return LEVEL.get(this.data); }
  set level(x: number) { LEVEL.set(this.data, x); }

  get poison(): boolean { return !!POISON.get(this.data); }
  set poison(x: boolean) { POISON.set(this.data, x ? 1 : 0); }

  get child(): number { return CHILD.get(this.data); }
  set child(x: number) { CHILD.set(this.data, x); }

  get terrainSusceptibility(): number { return TERRAIN_SUSCEPTIBILITY.get(this.data); }
  set terrainSusceptibility(x: number) { TERRAIN_SUSCEPTIBILITY.set(this.data, x); }

  get immobile(): boolean { return !!IMMOBILE.get(this.data); }
  set immobile(x: boolean) { IMMOBILE.set(this.data, x ? 1 : 0); }

  get action(): number { return ACTION.get(this.data); }
  set action(x: number) { ACTION.set(this.data, x); }

  get replacement(): number { return REPLACEMENT.get(this.data); }
  set replacement(x: number) { REPLACEMENT.set(this.data, x); }

  get goldDrop(): number { return GOLD_DROP.get(this.data); }
  set goldDrop(x: number) { GOLD_DROP.set(this.data, x); }

  get elements(): number { return ELEMENTS.get(this.data); }
  set elements(x: number) { ELEMENTS.set(this.data, x); }

  /** Unprocessed experience reward ($520,x). */
  get expReward(): number { return EXP_REWARD.get(this.data); }
  set expReward(x: number) { EXP_REWARD.set(this.data, x); }

  get attackType(): number { return ATTACK_TYPE.get(this.data); }
  set attackType(x: number) { ATTACK_TYPE.set(this.data, x); }

  get statusEffect(): number { return STATUS_EFFECT.get(this.data); }
  set statusEffect(x: number) { STATUS_EFFECT.set(this.data, x); }
}

function prop(...spec: [number, number?, number?][]) {
  return new Stat(...spec);
}

class Stat {
  readonly spec: [number, number?, number?][];

  constructor(...spec: [number, number?, number?][]) {
    this.spec = spec;
  }

  get(data: number[]) {
    let value = 0;
    for (const [addr, mask = 0xff, shift = 0] of this.spec) {
      const index = (addr - 0x300) >>> 5;
      const lsh = shift < 0 ? -shift : 0;
      const rsh = shift < 0 ? 0 : shift;
      value |= ((data[index] & mask) >>> rsh) << lsh;
    }
    return value;
  }

  set(data: number[], value: number) {
    for (const [addr, mask = 0xff, shift = 0] of this.spec) {
      const index = (addr - 0x300) >>> 5;
      const lsh = shift < 0 ? -shift : 0;
      const rsh = shift < 0 ? 0 : shift;
      const v = (value >>> lsh) << rsh & mask;
      data[index] = data[index] & ~mask | v;
    }
  }
}

const METASPRITE = prop([0x300]);
const SPEED = prop([0x340, 0xf]);
const COLLISION_PLANE = prop([0x3a0, 0xf0, 4]);
const HITBOX = prop([0x420, 0x40, 2], [0x3a0, 0x0f]);
const HP = prop([0x3c0]);
const ATK = prop([0x3e0]);
const DEF = prop([0x400]);
const LEVEL = prop([0x420, 0x1f]);
const POISON = prop([0x420, 0x80, 7]);
const CHILD = prop([0x440]); // ad-hoc spawn index
const TERRAIN_SUSCEPTIBILITY = prop([0x460]);
const IMMOBILE = prop([0x4a0, 0x80, 7]); // will not be knocked back
const ACTION = prop([0x4a0, 0x7f]);
const REPLACEMENT = prop([0x4c0]);
const GOLD_DROP = prop([0x500, 0xf0, 4]);
const ELEMENTS = prop([0x500, 0xf]);
const EXP_REWARD = prop([0x520]);
const ATTACK_TYPE = prop([0x540]);
const STATUS_EFFECT = prop([0x560, 0xf]);
