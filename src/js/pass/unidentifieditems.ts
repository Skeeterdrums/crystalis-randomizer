import {FlagSet} from '../flagset.js';
import {Random} from '../random.js';
import {Rom} from '../rom.js';

const KEY_NAMES = [
  'Curious Key',
  'Bronze Key',
  'Silver Key',
  'Ancient Key',
  'Small Key',
  'Shiny Key',
  'Mysterious Key',
  'Magic Key',
];
const FLUTE_NAMES = [
  'Wooden Flute',
  'Horn of Plenty',
  'Ocarina',
  'Pan Pipes',
  'Bugle',
  'Bagpipes',
  'Kazoo',
  'Magic Whistle',
  'Dog Whistle',
  'Recorder',
];
const LAMP_NAMES = [
  'Bronze Lamp',
  'Magic Lamp',
  'Dull Lamp',
  'Shimmering Lamp',
  'Oil Lamp',
  'Broken Lamp',
];
const STATUE_NAMES = [
  'Rusty Statue',
  'Forbidden Statue',
  'Golden Idol',
  'Strange Statue',
  'Glass Statue',
  'Burt Figurine',
  'Draygon Figurine',
  'Karmine Figurine',
  'Mado Figurine',
  'Sabera Figurine',
  'Kelbesque Figurine',
  'Copper Statue',
  'White Statue',
  'Invisible Statue',
  'Mattrick Figurine',
  'Dragondarch Statue',
  'Overswarm Statue',
];


export function unidentifiedItems(rom: Rom, flags: FlagSet, random: Random) {
  if (!flags.unidentifiedItems()) return;
  const items = (...ids: number[]) => ids.map(id => rom.items[id]);
  const keys = items(0x32, 0x33, 0x34);
  const flutes = items(0x27, 0x28, 0x31, 0x36);
  const lamps = items(0x35, 0x39);
  const statues = items(0x25, /* opel 0x26, */ 0x38, 0x3a, 0x3d);

  for (const [list, [...names]] of [[keys, KEY_NAMES],
                                    [flutes, FLUTE_NAMES],
                                    [lamps, LAMP_NAMES],
                                    [statues, STATUE_NAMES]] as const) {
    // palettes are :03 bit of item.itemDataValue
    random.shuffle(names);
    const palettes = random.shuffle([0, 1, 2, 3]);
    for (const item of list) {
      item.menuName = item.messageName = names.pop()!;
      item.palette = palettes.pop()!;
    }
  }
}
