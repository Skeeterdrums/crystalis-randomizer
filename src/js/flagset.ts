import {UsageError} from './util.js';

const REPEATABLE_FLAGS: Set<string> = new Set(['S']);

interface Preset {
  descr: string;
  flags: string;
  title: string;

  default?: boolean;
}

export const PRESETS: Preset[] = [{
  title: 'Casual',

  descr: `Basic flags for a relatively easy playthrough.`,
  flags: 'Ds Edmrsx Fw Mr Rp Sc Sk Sm Tab',
}, {
  title: 'Intermediate',

  descr: `Slightly more challenge than Casual but still approachable.`,
  flags: 'Ds Edms Fsw Gt Mr Ps Rlpt Sct Skm Tab',

  default: true,
}, {
  title: 'Full Shuffle',

  descr: `Slightly harder than intermediate, with full shuffle and no spoiler log.`,
  flags: 'Em Fsw Gt Mert Ps Rlprt Sckmt Tabmp Ww',
}, {
  title: 'Glitchless',

  descr: `Full shuffle but with no glitches.`,
  flags: 'Em Fcpstw Mert Ps Rlprt Sckmt Tab Ww',
}, {
  // TODO: add 'Ht' for maxing out tower scaling
  title: 'Advanced',

  descr: `A balanced randomization with quite a bit more difficulty.`,
  flags: 'Fsw Gfprt Hbdgw Mert Ps Rloprst Sckt Sm Tabmp Ww',
}, {
  // TODO: add 'Ht'
  title: 'Ludicrous',

  descr: `Pulls out all the stops, may require superhuman feats.`,
  flags: 'Fs Gcfprtw Hbdgmswxz Mert Ps Rloprst Sckmt Tabmp Ww',
}];

// Just the flags, not the whole documentation.
const PRESETS_BY_KEY: {[key: string]: string} = {};
for (const {title, flags} of PRESETS) {
  PRESETS_BY_KEY[`@${title.replace(/ /g, '').toLowerCase()}`] = flags;
}

interface FlagSection {
  flags: Flag[];
  section: string;

  text?: string;
}

interface Flag {
  flag: string;
  name: string;

  hard?: boolean;
  text?: string;
}

export const FLAGS: FlagSection[] = [{
  section: 'Items',
  text: `Items are broken into five pools: <i>key items</i> includes all
      unique items; <i>consumable items</i> includes anything that can be
      dropped; <i>magic</i> is the eight spells; and <i>traps</i> are the
      12 trap chests found in various places. These pools can be shuffled
      together, kept separate, or left unshuffled.`,

  flags: [{
    flag: 'Sk',
    name: 'Shuffle key items',
  }, {
    flag: 'Sm',
    name: 'Shuffle magics',
  }, {
    flag: 'Sc',
    name: 'Shuffle consumables',
  }, {
    flag: 'Sct',
    name: 'Shuffle consumables with traps',
  }, {
    flag: 'Skm',
    name: 'Shuffle key items with magic',
  }, {
    flag: 'Skt',
    name: 'Shuffle key items with traps',
  }, {
    flag: 'Sck',
    hard: true,
    name: 'Shuffle consumables with key items',
  }, {
    flag: 'Scm',
    hard: true,
    name: 'Shuffle consumables with magic',
  }, {
    flag: 'Skmt',
    hard: true,
    name: 'Shuffle key, magic, and traps',
  }, {
    flag: 'Sckm',
    hard: true,
    name: 'Shuffle key, consumables, and magic',
  }, {
    flag: 'Sckt',
    hard: true,
    name: 'Shuffle key, consumables, and traps',
  }, {
    flag: 'Sckmt',
    hard: true,
    name: 'Shuffle all items and traps together',
  }], // TODO: Ss to shuffle shops?
}, {
  section: 'World',
  flags: [{
    flag: 'Wt',
    name: 'Randomize trade-in items',
    text: `Items expected by various NPCs will be shuffled: specifically,
           Statue of Onyx, Kirisa Plant, Love Pendant, Ivory Statue, Fog
           Lamp, and Flute of Lime (for Akahana).  Rage will expect a
           random sword, and Tornel will expect a random bracelet.`,
  }, {
    flag: 'Wu',
    hard: true,
    name: 'Unidentified key items',
    text: `Item names will be generic and effects will be shuffled.  This
           includes keys, flutes, lamps, and statues.`,
  }, {
    flag: 'Ww',
    name: 'Randomize elements to break walls',
    text: `Walls will require a randomized element to break.  Normal rock and
           ice walls will indicate the required element by the color (light
           grey or yellow for wind, blue for fire, bright orange ("embers") for
           water, or dark grey ("steel") for thunder.  The element to break
           these wills is the same throughout an area.  Iron walls require a
           one-off random element, with no visual cue, and two walls in the
           same area may have different requirements.`,
  }],
}, {
  section: 'Monsters',
  text: `Monster stats are always normalized by scaling level.`,

  flags: [{
    flag: 'Mr',
    name: 'Randomize monsters',
    text: `Monster locations are shuffled, with the exception of sea creatures
           and tower robots.`,
  }, {
    flag: 'Me',
    name: 'Shuffle monster weaknesses',
    text: `Monster elemental weaknesses are shuffled.`,
  }, {
    flag: 'Mt',
    hard: true,
    name: 'Shuffle tower robots',
    text: `Tower robots will be shuffled into the normal pool.  At some
           point, normal monsters may be shuffled into the tower as well.`,

  // }, {
  //   flag: 'M!',
  //   name: 'No safety checks',
  //   text: `Normally there are some reasonability limits on the monsters
  //          that can be shuffled (flyers only in larger areas, and at most
  //          one or two; (future: large monsters and flail swingers don't
  //          crowd out small hallways, etc), but these checks can be disabled
  //          for extra craziness and challenge.`,
  // }, {
  //   flag: 'Ms',
  //   hard: true,
  //   name: 'Don\'t scale monster difficulty',
  //   text: `Monster difficulty normally scales with game progression rather
  //          than being hard-coded based on location to ensure that monsters
  //          stay relevant throughout the game.  The current difficulty level
  //          can be seen next to the player's experience level on the right
  //          side of the HUD.  This scaling can be turned off, but it is not
  //          recommended.`,
  }],
}, {
  section: 'Shops',
  text: `Prices are always normalized by scaling level: prices at tool shops
         and inns double every 10 scaling levels, while prices at armor shops
         halve every 12 scaling levels `,

  flags: [{
    flag: 'Ps',
    name: 'Shuffle shop contents',
    text: `This includes normalizing prices via the scaling level, as well as a
           random variance for each shop: base prices may vary ±50% for the same
           item at different; inn prices may vary ±62.5%.`,
  }],
}, {
  section: 'Hard mode',

  flags: [{
    flag: 'Hw',
    hard: true,
    name: 'Battle magic not guaranteed',
    text: `Normally, the logic will guarantee that level 3 sword charges are
           available before fighting the tetrarchs (with the exception of Karmine,
           who only requires level 2).  This disables that check.`,
  }, {
    flag: 'Hb',
    hard: true,
    name: 'Barrier not guaranteed',
    text: `Normally, the logic will guarantee Barrier (or else refresh and shield
           ring) before entering Stxy, the Fortress, or fighting Karmine.  This
           disables that check.`,
  }, {
    flag: 'Hm',
    hard: true,
    name: 'Don\'t buff medical herb or fruit of power',
    text: `Medical Herb is not buffed to heal 64 damage, which is helpful to make
           up for cases where Refresh is unavailable early.  Fruit of Power is not
           buffed to restore 48 MP.`,
  }, {
    flag: 'Hg',
    hard: true,
    name: 'Gas mask not guaranteed',
    text: `The logic will not guarantee gas mask before needing to enter the swamp.
           Gas mask is still guaranteed to kill the insect.`,
  }, {
    flag: 'Hs',
    hard: true,
    name: 'Matching sword not guaranteed',
    text: `Player may be required to fight bosses with the wrong sword, which
           may require using "tink strats" dealing 1 damage per hit.`,
  // }, {
  //   flag: 'Ht',
  //   hard: true,
  //   name: 'Max out scaling level in tower',
  //   text: `Scaling level immediately maxes out upon stepping into tower.`,
  }, {
    flag: 'Hx',
    hard: true,
    name: 'Experience scales slower',
    text: `More grinding will be required to "keep up" with the difficulty.`,
  }, {
    flag: 'Hc',
    hard: true,
    name: 'Charge shots only',
    text: `Stabbing is completely ineffective.  Only charged shots work.`,
  }, {
    flag: 'Hd',
    hard: true,
    name: 'Buff Dyna',
    text: `Makes the Dyna fight a bit more of a challenge.  Side pods will fire
           significantly more.  The safe spot has been removed.  The counter
           attacks pass through barrier.  Side pods can now be killed.`,
  }, {
    flag: 'Hz',
    hard: true,
    name: 'Blackout mode',
    text: `All caves and fortresses are permanently dark.`,
  }, {
    flag: 'Hh',
    hard: true,
    name: 'Hardcore mode',
    text: `Checkpoints and saves are removed.`,
  }],
// }, {
//   section: 'Weapons, armor, and item balance',
//     <div class="checkbox">W: Normalize weapons and armor</div>
//       <div class="flag-body">
//         Sword attack values no longer depend on element, but instead on the
//         number of orb/bracelet upgrades: just the sword is 2; sword plus one
//         upgrade is 4; sword plus both upgrades is 8.  Stab damage is always
//         fixed at 2, rather than effectively doubling the sword's base damage.
//         Enemies no longer have minimum player level requirements.  All sword
//         hits will now do at least one damage (when a hit "pings", exactly one
//         damage is dealt), so no enemy is unkillable.
//         <p>Base armor/shield defense is halved, and capped at twice the player
//         level, so that (a) player level has more impact, and (b) really good
//         armors aren't overpowered in early game.
//       </div>
//       <div class="checkbox">Wp: Nerf power ring</div>
//       <div class="flag-body">
//         TODO - don't necessarily want to require clicking through to get
//         full list of changes, but also want to document in various places
//         and want reasonable defaults.
//       </div>
}, {
  section: 'Tweaks',

  flags: [{
    flag: 'Ta',
    name: 'Automatically equip orbs and bracelets',
    text: `Adds a quality-of-life improvement to automatically equip the
           corresponding orb/bracelet whenever changing swords.`,
  }, {
    flag: 'Tb',
    name: 'Buff bonus items',
    text: `Leather Boots are changed to Speed Boots, which increase player walking
           speed (this allows climbing up the slope to access the Tornado Bracelet
           chest, which is taken into consideration by the logic).  Deo's pendant
           restores MP while moving.  Rabbit boots enable sword charging up to
           level 2 while walking (level 3 still requires being stationary, so as
           to prevent wasting tons of magic).`,
  }, {
    flag: 'Tm',
    name: 'Randomize music',
  }, {
    flag: 'Tp',
    name: 'Randomize sprite palettes',
  }, {
    flag: 'Tw',
    name: 'Randomize wild warp',
    text: `Wild warp will go to Mezame Shrine and 15 other random locations.`,
  }],
}, {
  section: 'Routing',

  flags: [{
    flag: 'Rs',
    name: 'Story Mode',
    text: `Draygon 2 won't spawn unless you have all four swords and have
           defeated all major bosses of the tetrarchy.`,
  }, {
    flag: 'Rt',
    name: 'Sword of Thunder teleports to Shyron',
    text: `Normally when acquiring the thunder sword, the player is instantly
           teleported to Shyron. This flag maintains that behavior regardless of
           where it is found (immediately activating the warp point; talking
           to Asina will teleport back to the start, in case no other means of
           return is available).  Disabling this flag means that the Sword of
           Thunder will act like all other items and not teleport.`,
  }, {
    flag: 'Rd',
    name: 'Require healing dolphin to return fog lamp',
    text: `Normally the fog lamp cannot be returned without healing the dolphin
           to acquire the shell flute (so as not to be stranded).  Continuity
           suggests that actually healing the dolphin should also be required,
           but we've found that this makes the dolphin a lot less useful.  By
           default the fog lamp can be returned before healing the dolphin.  This
           flag adds the extra requirement for better continuity.`,
  }, {
    flag: 'Rp',
    name: 'Wind-waterfall passage',
    text: `Opens a passage between Valley of Wind (lower right side) and
           Lime Tree Valley.`,
  }, {
    flag: 'Rr',
    name: 'Deo requires telepathy',
    text: `Deo's item is additionally blocked on telepathy.`,
  }, {
    flag: 'Rl',
    name: 'No "free lunch" magic',
    text: `Disables "free lunch" magics that only require stepping on a square to
           learn (specifally Barrier and Paralysis).  Instead, Barrier requires
           the seas to be calmed, and Paralysis requires the prison key (which
           can be used at the top of the slope in Waterfall Valley to open the
           path in reverse).  Reverse vampire also requires the windmill to have
           been started.`,
  }, {
    flag: 'Ro',
    name: 'Orbs not required to break walls',
    text: `Walls can be broken and bridges formed with level 1 shots.  Orbs and
           bracelets are no longer considered progression items (except for
           Tornado bracelet for Tornel on Mt Sabre).`,
  }],
}, {
  section: 'Glitches',
  text: `The routing logic can be made aware of the following
      glitches.  If selected, it will assume that the glitch can be
      performed when verifying that a game is winnable.  Enabling
      these glitches tends to increase the randomness of the shuffle,
      since there are more valid options.`,

  flags: [{
    flag: 'Gc',
    hard: true,
    name: 'Sword charge glitch may be required',
    text: `Progression may require using the sword charge glitch to destroy walls or
           form bridges without actually possessing the correct orb.`,
  }, {
    flag: 'Gf',
    name: 'Ghetto flight may be required',
    text: `Progression may require using Rabbit Boots and the dolphin to reach Swan
           before the Angry Sea can be calmed and before Flight is available.`,
  }, {
    flag: 'Gp',
    name: 'Teleport skip may be required',
    text: `Progression may require entering Mt. Sabre North from Cordel Plain
           without the Teleport spell (flying over the river to avoid the
           trigger).`,
  }, {
    flag: 'Gr',
    name: 'Rabbit skip may be required',
    text: `Progression may require entering Mt. Sabre North from Cordel Plain
           without talking to the rabbit in Leaf after the abduction.`,
  }, {
    flag: 'Gt',
    name: 'Statue glitch may be required',
    text: `Progression may require glitching past guards without Change or Paralysis,
           or people turned to stone without a Flute of Lime.`,
  }, {
    flag: 'Gw',
    hard: true,
    name: 'Wild warp may be required',
    text: `Progression may require using "wild warp" (holding A and B on controller 1
           and tapping A on controller 2) to travel to parts of the game that would
           otherwise be unreachable.`,
  }],
}, {
  section: 'Glitch Fixes',
  text: `Alternatively, glitches may be patched out of the game and made unusable.
         These flags are exclusive with the flags that require the glitch.`,

  flags: [{
    flag: 'Fs',
    name: 'Disable shop glitch',
    text: `Items may no longer be purchased for neighboring prices.  This makes
           money actually mean something.  To compensate, gold drops money
           will be scaled up somewhat.`,
  }, {
    flag: 'Fc',
    name: 'Disable sword charge glitch',
    text: `Sword charge glitch will no longer work.  It will be impossible to
           achieve charge levels without having correct inventory.`,
  }, {
    flag: 'Fp',
    name: 'Disable teleport skip',
    text: `Mt Sabre North cannot be entered from Cordel Plans without the
           Teleport spell, even via glitch.`,
  }, {
    flag: 'Fr',
    name: 'Disable rabbit skip',
    text: `Mt Sabre North cannot be entered from Cordel Plans without talking to
           the rabbit in leaf.`,
  }, {
    flag: 'Ft',
    name: 'Disable statue glitch',
    text: `Statues will instead always push downwards, making it impossible to
           glitch through statues for progression.`,
  }, {
    flag: 'Fw',
    name: 'Disable wild warp',
    text: `Wild warp will only teleport back to Mezame shrine (to prevent
           game-breaking soft-locks).`,
  }],
}, {
  section: 'Easy Mode',
  text: `The following options make parts of the game easier.`,
  flags: [{
    flag: 'Ed',
    name: 'Decrease enemy damage',
    text: `Enemy attack power will be significantly decreased in the early game
           (by a factor of 3).  The gap will narrow in the mid-game and eventually
           phase out at scaling level 40.`,
  }, {
    flag: 'Es',
    name: 'Guarantee starting sword',
    text: `The Leaf elder is guaranteed to give a sword.  It will not be
           required to deal with any enemies before finding the first sword.`,
  }, {
    flag: 'Er',
    name: 'Guarantee refresh',
    text: `Guarantees the Refresh spell will be available before fighting Tetrarchs.`,
  }, {
    flag: 'Em',
    name: 'Extra buff medical herb',
    text: `Buff Medical Herb to heal 96 instead of 64 and Fruit of Power to
           restore 64 MP instead of 48.`,
  }, {
    flag: 'Ex',
    name: 'Experience scales faster',
    text: `Less grinding will be required to "keep up" with the game difficulty.`,
  }],
}, {
  section: 'Debug Mode',
  text: `These options are helpful for exploring or debugging.  Note that,
      while they do not directly affect any randomization, they
      <i>do</i> factor into the seed to prevent cheating, and they
      will remove the option to generate a seed for racing.`,
  flags: [{
    flag: 'Ds',
    name: 'Generate a spoiler log',
    text: `Note: <b>this will change the placement of items</b> compared to a
      seed generated without this flag turned on.`
  }, {
    flag: 'Di',
    name: 'Player never dies',
  }], // TODO - quick itemget/teleport options?
}];


// TODO - flag validation!!!

const exclusiveFlags = (flag: string): RegExp => {
  if (flag.startsWith('S')) {
    return new RegExp(`S.*[${flag.substring(1)}]`);
  }
  return FLAG_CONFLICTS[flag];
}
const FLAG_CONFLICTS: {[key: string]: RegExp} = {
  Hm: /Em/,
  Hx: /Ex/,
  Em: /Hm/,
  Ex: /Hx/,
  Fw: /[GT]w/,
  Gw: /Fw/,
  Tw: /Fw/,
  Ft: /Gt/,
  Gt: /Ft/,
  Fc: /Gc/,
  Gc: /Fc/,
  Fp: /Gp/,
  Gp: /Fp/,
  Fr: /Gr/,
  Gr: /Fr/,
};

export class FlagSet {

  private flags: {[section: string]: string[]};

  constructor(str = 'RtGftTab') {
    if (str.startsWith('@')) {
      const expanded = PRESETS_BY_KEY[str.toLowerCase()];
      if (!expanded) throw new UsageError(`Unknown preset: ${str}`);
      str = expanded;
    }
    this.flags = {};
    // parse the string
    str = str.replace(/[^A-Za-z0-9!]/g, '');
    const re = /([A-Z])([a-z0-9!]+)/g;
    let match;
    while ((match = re.exec(str))) {
      const [, key, value] = match;
      const terms = REPEATABLE_FLAGS.has(key) ? [value] : value;
      for (const term of terms) {
        this.set(key + term, true);
      }
    }
  }

  get(category: string): string[] {
    return this.flags[category] || [];
  }

  set(flag: string, value: boolean) {
    // check for incompatible flags...?
    const key = flag[0];
    const term = flag.substring(1); // assert: term is only letters/numbers
    if (!value) {
      // Just delete - that's easy.
      const filtered = (this.flags[key] || []).filter(t => t !== term);
      if (filtered.length) {
        this.flags[key] = filtered;
      } else {
        delete this.flags[key];
      }
      return;
    }
    // Actually add the flag.
    this.removeConflicts(flag);
    const terms = (this.flags[key] || []).filter(t => t !== term);
    terms.push(term);
    terms.sort();
    this.flags[key] = terms;
  }

  check(flag: string): boolean {
    const terms = this.flags[flag[0]];
    return !!(terms && (terms.indexOf(flag.substring(1)) >= 0));
  }

  autoEquipBracelet() { return this.check('Ta'); }
  buffDeosPendant() { return this.check('Tb'); }
  leatherBootsGiveSpeed() { return this.check('Tb'); }
  rabbitBootsChargeWhileWalking() { return this.check('Tb'); }
  randomizeMusic() { return this.check('Tm'); }
  shuffleSpritePalettes() { return this.check('Tp'); }

  shuffleMonsters() { return this.check('Mr'); }
  shuffleShops() { return this.check('Ps'); }
  bargainHunting() { return this.shuffleShops(); }

  shuffleTowerMonsters() { return this.check('Mt'); }
  shuffleMonsterElements() { return this.check('Me'); }
  shuffleBossElements() { return this.shuffleMonsterElements(); }

  doubleBuffMedicalHerb() { return this.check('Em'); }
  buffMedicalHerb() { return !this.check('Hm'); }
  decreaseEnemyDamage() { return this.check('Ed'); }
  neverDie() { return this.check('Di'); }
  chargeShotsOnly() { return this.check('Hc'); }

  barrierRequiresCalmSea() { return this.check('Rl'); }
  paralysisRequiresPrisonKey() { return this.check('Rl'); }
  sealedCaveRequiresWindmill() { return this.check('Rl'); }
  connectLimeTreeToLeaf() { return this.check('Rp'); }
  storyMode() { return this.check('Rs'); }
  requireHealedDolphinToRide() { return this.check('Rd'); }
  saharaRabbitsRequireTelepathy() { return this.check('Rr'); }
  teleportOnThunderSword() { return this.check('Rt'); }
  orbsOptional() { return this.check('Ro'); }

  randomizeTrades() { return this.check('Wt'); }
  unidentifiedItems() { return this.check('Wu'); }
  randomizeWalls() { return this.check('Ww'); }

  guaranteeSword() { return this.check('Es'); }
  guaranteeSwordMagic() { return !this.check('Hw'); }
  guaranteeMatchingSword() { return !this.check('Hs'); }
  guaranteeGasMask() { return !this.check('Hg'); }
  guaranteeBarrier() { return !this.check('Hb'); }
  guaranteeRefresh() { return this.check('Er'); }

  disableSwordChargeGlitch() { return this.check('Fc'); }
  disableTeleportSkip() { return this.check('Fp'); }
  disableRabbitSkip() { return this.check('Fr'); }
  disableShopGlitch() { return this.check('Fs'); }
  disableStatueGlitch() { return this.check('Ft'); }

  assumeSwordChargeGlitch() { return this.check('Gc'); }
  assumeGhettoFlight() { return this.check('Gf'); }
  assumeTeleportSkip() { return this.check('Gp'); }
  assumeRabbitSkip() { return this.check('Gr'); }
  assumeStatueGlitch() { return this.check('Gt'); }
  assumeTriggerGlitch() { return false; } // TODO - only works on land?
  assumeWildWarp() { return this.check('Gw'); }

  nerfWildWarp() { return this.check('Fw'); }
  allowWildWarp() { return !this.nerfWildWarp(); }
  randomizeWildWarp() { return this.check('Tw'); }

  blackoutMode() { return this.check('Hz'); }
  hardcoreMode() { return this.check('Hh'); }
  buffDyna() { return this.check('Hd'); }

  expScalingFactor() {
    return this.check('Hx') ? 0.25 : this.check('Ex') ? 2.5 : 1;
  }

  // The following didn't end up getting used.

  // allows(flag) {
  //   const re = exclusiveFlags(flag);
  //   if (!re) return true;
  //   for (const key in this.flags) {
  //     if (this.flags[key].find(t => re.test(key + t))) return false;
  //   }
  //   return true;
  // }

  // merge(that) {
  //   this.flags = that.flags;
  // }

  private removeConflicts(flag: string) {
    // NOTE: this is somewhat redundant with set(flag, false)
    const re = exclusiveFlags(flag);
    if (!re) return;
    for (const key in this.flags) {
      if (!this.flags.hasOwnProperty(key)) continue;
      const terms = this.flags[key].filter(t => !re.test(key + t));
      if (terms.length) {
        this.flags[key] = terms;
      } else {
        delete this.flags[key];
      }
    }
  }

  private toStringKey(key: string) {
    if (REPEATABLE_FLAGS.has(key)) {
      return [...this.flags[key]].sort().map(v => key + v).join(' ');
    }
    return key + [...this.flags[key]].sort().join('');
  }

  toString() {
    const keys = Object.keys(this.flags);
    keys.sort();
    return keys.map(k => this.toStringKey(k)).join(' ');
  }
}
