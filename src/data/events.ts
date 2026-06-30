export interface CardInstructions {
  activation: string
  eReaderSetup: string
  cable: string
  compatibleGames: string[]
}

export interface EventCard {
  id: string
  name: string
  file: string
  game: string
  region: string
  image: string
  category: 'rs-event' | 'emerald-event'
  romRevision?: string
  instructions: CardInstructions
}

const EREADER_SETUP =
  'Plug the Nintendo e-Reader into the expansion port (EXT port) of a Game Boy Advance. Connect it to a second GBA — the one running your Pokémon cartridge — using a GBA Link Cable. Power on both units before scanning. The e-Reader GBA does not need a game cartridge inserted.'

const CABLE_STANDARD =
  'One Nintendo e-Reader accessory, two Game Boy Advance (or GBA SP) systems, and one Nintendo GBA Link Cable (AGB-005).'

const MYSTERY_GIFT_UNLOCK =
  'First, unlock Mystery Gift if you have not already: visit any Pokémon Mart, talk to the boy standing at the questionnaire counter, and enter the phrase "LINK TOGETHER WITH ALL." The Mystery Gift option will appear on your Pokémon Center menu.'

const MYSTERY_GIFT_WONDER =
  'At any Pokémon Center, speak to the receptionist and choose "Mystery Gift" → "Wonder Gift." Scan the dotcode strip through the e-Reader slot. Once the transfer is complete, a delivery person inside the Pokémon Center will hand you the item or Pokémon.'

const BEAST_ACTIVATION = (poke: string, extra = '') =>
  `${MYSTERY_GIFT_UNLOCK}\n\n${MYSTERY_GIFT_WONDER}\n\n${poke} will be delivered directly to your party or PC Box.${extra ? '\n\n' + extra : ''}`

const BEAST_REVISION_NOTE =
  'Two ROM revision variants exist. Use "Rev 0" if your cartridge was purchased before mid-2003 (early production run). Use "Rev 1+2" for later cartridges. If unsure, try Rev 0 first — incorrect revision just means the event will not trigger.'

export const EVENT_CARDS: EventCard[] = [
  // ─── Ruby / Sapphire Events ───────────────────────────────────────────────
  {
    id: 'eon-ticket',
    name: 'Eon Ticket',
    file: '/cards/EON_TICKET_EN.raw',
    game: 'Ruby / Sapphire',
    region: 'EN',
    image: '/card-images/eon-ticket.png',
    category: 'rs-event',
    instructions: {
      activation:
        `${MYSTERY_GIFT_UNLOCK}\n\n${MYSTERY_GIFT_WONDER}\n\nAfter receiving the Eon Ticket, board the S.S. Tidal at Lilycove City or Slateport City and choose "Southern Island" as your destination. There you can encounter the Lati twin not chosen at the start of your game (Latios in Ruby, Latias in Sapphire).`,
      eReaderSetup: EREADER_SETUP,
      cable: CABLE_STANDARD,
      compatibleGames: ['Pokémon Ruby', 'Pokémon Sapphire'],
    },
  },
  {
    id: 'celebi',
    name: 'Celebi',
    file: '/cards/CELEBI_EN.raw',
    game: 'Ruby / Sapphire',
    region: 'EN',
    image: '/card-images/celebi.png',
    category: 'rs-event',
    instructions: {
      activation:
        `${MYSTERY_GIFT_UNLOCK}\n\n${MYSTERY_GIFT_WONDER}\n\nCelebi will be placed in your PC Box. This variant has certain restrictions that may affect Battle Tower participation. Use the "Celebi (Unlocked)" card to receive a fully unrestricted Celebi.`,
      eReaderSetup: EREADER_SETUP,
      cable: CABLE_STANDARD,
      compatibleGames: ['Pokémon Ruby', 'Pokémon Sapphire'],
    },
  },
  {
    id: 'celebi-unlocked',
    name: 'Celebi (Unlocked)',
    file: '/cards/CELEBI_UNLOCKED_EN.raw',
    game: 'Ruby / Sapphire',
    region: 'EN',
    image: '/card-images/celebi-unlocked.png',
    category: 'rs-event',
    instructions: {
      activation:
        `${MYSTERY_GIFT_UNLOCK}\n\n${MYSTERY_GIFT_WONDER}\n\nCelebi will be placed in your PC Box, fully unlocked with no Battle Tower restrictions. This is the recommended variant for most players.`,
      eReaderSetup: EREADER_SETUP,
      cable: CABLE_STANDARD,
      compatibleGames: ['Pokémon Ruby', 'Pokémon Sapphire'],
    },
  },
  {
    id: 'deoxys',
    name: 'Deoxys',
    file: '/cards/DEOXYS_EN.raw',
    game: 'Ruby / Sapphire',
    region: 'EN',
    image: '/card-images/deoxys.png',
    category: 'rs-event',
    instructions: {
      activation:
        `${MYSTERY_GIFT_UNLOCK}\n\n${MYSTERY_GIFT_WONDER}\n\nDeoxys will be delivered to your party or PC Box after the scan. In Ruby/Sapphire, Deoxys appears in its Normal Forme.`,
      eReaderSetup: EREADER_SETUP,
      cable: CABLE_STANDARD,
      compatibleGames: ['Pokémon Ruby', 'Pokémon Sapphire'],
    },
  },
  {
    id: 'groudon',
    name: 'Groudon',
    file: '/cards/GROUDON_EN.raw',
    game: 'Ruby / Sapphire',
    region: 'EN',
    image: '/card-images/groudon.png',
    category: 'rs-event',
    instructions: {
      activation:
        `${MYSTERY_GIFT_UNLOCK}\n\n${MYSTERY_GIFT_WONDER}\n\nGroudon will be placed in your PC Box after the scan.`,
      eReaderSetup: EREADER_SETUP,
      cable: CABLE_STANDARD,
      compatibleGames: ['Pokémon Ruby', 'Pokémon Sapphire'],
    },
  },
  {
    id: 'hooh',
    name: 'Ho-Oh',
    file: '/cards/HOOH_EN.raw',
    game: 'Ruby / Sapphire',
    region: 'EN',
    image: '/card-images/hooh.png',
    category: 'rs-event',
    instructions: {
      activation:
        `${MYSTERY_GIFT_UNLOCK}\n\n${MYSTERY_GIFT_WONDER}\n\nHo-Oh will be placed in your PC Box after the scan.`,
      eReaderSetup: EREADER_SETUP,
      cable: CABLE_STANDARD,
      compatibleGames: ['Pokémon Ruby', 'Pokémon Sapphire'],
    },
  },
  {
    id: 'jirachi',
    name: 'Jirachi',
    file: '/cards/JIRACHI_EN.raw',
    game: 'Ruby / Sapphire',
    region: 'EN',
    image: '/card-images/jirachi.png',
    category: 'rs-event',
    instructions: {
      activation:
        `${MYSTERY_GIFT_UNLOCK}\n\n${MYSTERY_GIFT_WONDER}\n\nJirachi will be delivered to your PC Box after the scan.`,
      eReaderSetup: EREADER_SETUP,
      cable: CABLE_STANDARD,
      compatibleGames: ['Pokémon Ruby', 'Pokémon Sapphire'],
    },
  },
  {
    id: 'kyogre',
    name: 'Kyogre',
    file: '/cards/KYOGRE_EN.raw',
    game: 'Ruby / Sapphire',
    region: 'EN',
    image: '/card-images/kyogre.png',
    category: 'rs-event',
    instructions: {
      activation:
        `${MYSTERY_GIFT_UNLOCK}\n\n${MYSTERY_GIFT_WONDER}\n\nKyogre will be placed in your PC Box after the scan.`,
      eReaderSetup: EREADER_SETUP,
      cable: CABLE_STANDARD,
      compatibleGames: ['Pokémon Ruby', 'Pokémon Sapphire'],
    },
  },
  {
    id: 'lugia',
    name: 'Lugia',
    file: '/cards/LUGIA_EN.raw',
    game: 'Ruby / Sapphire',
    region: 'EN',
    image: '/card-images/lugia.png',
    category: 'rs-event',
    instructions: {
      activation:
        `${MYSTERY_GIFT_UNLOCK}\n\n${MYSTERY_GIFT_WONDER}\n\nLugia will be placed in your PC Box after the scan.`,
      eReaderSetup: EREADER_SETUP,
      cable: CABLE_STANDARD,
      compatibleGames: ['Pokémon Ruby', 'Pokémon Sapphire'],
    },
  },
  {
    id: 'mew',
    name: 'Mew',
    file: '/cards/MEW_EN.raw',
    game: 'Ruby / Sapphire',
    region: 'EN',
    image: '/card-images/mew.png',
    category: 'rs-event',
    instructions: {
      activation:
        `${MYSTERY_GIFT_UNLOCK}\n\n${MYSTERY_GIFT_WONDER}\n\nMew will be placed in your PC Box after the scan.`,
      eReaderSetup: EREADER_SETUP,
      cable: CABLE_STANDARD,
      compatibleGames: ['Pokémon Ruby', 'Pokémon Sapphire'],
    },
  },

  // ─── Legendary Beasts — Ruby ─────────────────────────────────────────────
  {
    id: 'entei-ruby-r0',
    name: 'Entei',
    file: '/cards/ENTEI_RUBY_R0_EN.raw',
    game: 'Ruby',
    region: 'EN',
    image: '/card-images/entei.png',
    category: 'rs-event',
    romRevision: 'Rev 0',
    instructions: {
      activation: BEAST_ACTIVATION('Entei', BEAST_REVISION_NOTE),
      eReaderSetup: EREADER_SETUP,
      cable: CABLE_STANDARD,
      compatibleGames: ['Pokémon Ruby (Rev 0)'],
    },
  },
  {
    id: 'entei-ruby-r12',
    name: 'Entei',
    file: '/cards/ENTEI_RUBY_R12_EN.raw',
    game: 'Ruby',
    region: 'EN',
    image: '/card-images/entei.png',
    category: 'rs-event',
    romRevision: 'Rev 1+2',
    instructions: {
      activation: BEAST_ACTIVATION('Entei', BEAST_REVISION_NOTE),
      eReaderSetup: EREADER_SETUP,
      cable: CABLE_STANDARD,
      compatibleGames: ['Pokémon Ruby (Rev 1 & 2)'],
    },
  },
  {
    id: 'raikou-ruby-r0',
    name: 'Raikou',
    file: '/cards/RAIKOU_RUBY_R0_EN.raw',
    game: 'Ruby',
    region: 'EN',
    image: '/card-images/raikou.png',
    category: 'rs-event',
    romRevision: 'Rev 0',
    instructions: {
      activation: BEAST_ACTIVATION('Raikou', BEAST_REVISION_NOTE),
      eReaderSetup: EREADER_SETUP,
      cable: CABLE_STANDARD,
      compatibleGames: ['Pokémon Ruby (Rev 0)'],
    },
  },
  {
    id: 'raikou-ruby-r12',
    name: 'Raikou',
    file: '/cards/RAIKOU_RUBY_R12_EN.raw',
    game: 'Ruby',
    region: 'EN',
    image: '/card-images/raikou.png',
    category: 'rs-event',
    romRevision: 'Rev 1+2',
    instructions: {
      activation: BEAST_ACTIVATION('Raikou', BEAST_REVISION_NOTE),
      eReaderSetup: EREADER_SETUP,
      cable: CABLE_STANDARD,
      compatibleGames: ['Pokémon Ruby (Rev 1 & 2)'],
    },
  },
  {
    id: 'suicune-ruby-r0',
    name: 'Suicune',
    file: '/cards/SUICUNE_RUBY_R0_EN.raw',
    game: 'Ruby',
    region: 'EN',
    image: '/card-images/suicune.png',
    category: 'rs-event',
    romRevision: 'Rev 0',
    instructions: {
      activation: BEAST_ACTIVATION('Suicune', BEAST_REVISION_NOTE),
      eReaderSetup: EREADER_SETUP,
      cable: CABLE_STANDARD,
      compatibleGames: ['Pokémon Ruby (Rev 0)'],
    },
  },
  {
    id: 'suicune-ruby-r12',
    name: 'Suicune',
    file: '/cards/SUICUNE_RUBY_R12_EN.raw',
    game: 'Ruby',
    region: 'EN',
    image: '/card-images/suicune.png',
    category: 'rs-event',
    romRevision: 'Rev 1+2',
    instructions: {
      activation: BEAST_ACTIVATION('Suicune', BEAST_REVISION_NOTE),
      eReaderSetup: EREADER_SETUP,
      cable: CABLE_STANDARD,
      compatibleGames: ['Pokémon Ruby (Rev 1 & 2)'],
    },
  },

  // ─── Legendary Beasts — Sapphire ─────────────────────────────────────────
  {
    id: 'entei-saph-r0',
    name: 'Entei',
    file: '/cards/ENTEI_SAPH_R0_EN.raw',
    game: 'Sapphire',
    region: 'EN',
    image: '/card-images/entei.png',
    category: 'rs-event',
    romRevision: 'Rev 0',
    instructions: {
      activation: BEAST_ACTIVATION('Entei', BEAST_REVISION_NOTE),
      eReaderSetup: EREADER_SETUP,
      cable: CABLE_STANDARD,
      compatibleGames: ['Pokémon Sapphire (Rev 0)'],
    },
  },
  {
    id: 'entei-saph-r12',
    name: 'Entei',
    file: '/cards/ENTEI_SAPH_R12_EN.raw',
    game: 'Sapphire',
    region: 'EN',
    image: '/card-images/entei.png',
    category: 'rs-event',
    romRevision: 'Rev 1+2',
    instructions: {
      activation: BEAST_ACTIVATION('Entei', BEAST_REVISION_NOTE),
      eReaderSetup: EREADER_SETUP,
      cable: CABLE_STANDARD,
      compatibleGames: ['Pokémon Sapphire (Rev 1 & 2)'],
    },
  },
  {
    id: 'raikou-saph-r0',
    name: 'Raikou',
    file: '/cards/RAIKOU_SAPH_R0_EN.raw',
    game: 'Sapphire',
    region: 'EN',
    image: '/card-images/raikou.png',
    category: 'rs-event',
    romRevision: 'Rev 0',
    instructions: {
      activation: BEAST_ACTIVATION('Raikou', BEAST_REVISION_NOTE),
      eReaderSetup: EREADER_SETUP,
      cable: CABLE_STANDARD,
      compatibleGames: ['Pokémon Sapphire (Rev 0)'],
    },
  },
  {
    id: 'raikou-saph-r12',
    name: 'Raikou',
    file: '/cards/RAIKOU_SAPH_R12_EN.raw',
    game: 'Sapphire',
    region: 'EN',
    image: '/card-images/raikou.png',
    category: 'rs-event',
    romRevision: 'Rev 1+2',
    instructions: {
      activation: BEAST_ACTIVATION('Raikou', BEAST_REVISION_NOTE),
      eReaderSetup: EREADER_SETUP,
      cable: CABLE_STANDARD,
      compatibleGames: ['Pokémon Sapphire (Rev 1 & 2)'],
    },
  },
  {
    id: 'suicune-saph-r0',
    name: 'Suicune',
    file: '/cards/SUICUNE_SAPH_R0_EN.raw',
    game: 'Sapphire',
    region: 'EN',
    image: '/card-images/suicune.png',
    category: 'rs-event',
    romRevision: 'Rev 0',
    instructions: {
      activation: BEAST_ACTIVATION('Suicune', BEAST_REVISION_NOTE),
      eReaderSetup: EREADER_SETUP,
      cable: CABLE_STANDARD,
      compatibleGames: ['Pokémon Sapphire (Rev 0)'],
    },
  },
  {
    id: 'suicune-saph-r12',
    name: 'Suicune',
    file: '/cards/SUICUNE_SAPH_R12_EN.raw',
    game: 'Sapphire',
    region: 'EN',
    image: '/card-images/suicune.png',
    category: 'rs-event',
    romRevision: 'Rev 1+2',
    instructions: {
      activation: BEAST_ACTIVATION('Suicune', BEAST_REVISION_NOTE),
      eReaderSetup: EREADER_SETUP,
      cable: CABLE_STANDARD,
      compatibleGames: ['Pokémon Sapphire (Rev 1 & 2)'],
    },
  },

  // ─── Emerald Events ───────────────────────────────────────────────────────
  {
    id: 'celebi-emr',
    name: 'Celebi',
    file: '/cards/CELEBI_EMR_EN.raw',
    game: 'Emerald',
    region: 'EN',
    image: '/card-images/celebi.png',
    category: 'emerald-event',
    instructions: {
      activation:
        `${MYSTERY_GIFT_UNLOCK}\n\n${MYSTERY_GIFT_WONDER}\n\nCelebi will be placed in your PC Box. Note: This variant is locked and may cause issues if used in the Battle Tower. Use "Celebi (Unlocked)" to avoid those restrictions.`,
      eReaderSetup: EREADER_SETUP,
      cable: CABLE_STANDARD,
      compatibleGames: ['Pokémon Emerald'],
    },
  },
  {
    id: 'celebi-unlocked-emr',
    name: 'Celebi (Unlocked)',
    file: '/cards/CELEBI_UNLOCKED_EMR_EN.raw',
    game: 'Emerald',
    region: 'EN',
    image: '/card-images/celebi-unlocked.png',
    category: 'emerald-event',
    instructions: {
      activation:
        `${MYSTERY_GIFT_UNLOCK}\n\n${MYSTERY_GIFT_WONDER}\n\nCelebi will be placed in your PC Box, fully unlocked with no Battle Tower or Battle Frontier restrictions. Recommended for most players.`,
      eReaderSetup: EREADER_SETUP,
      cable: CABLE_STANDARD,
      compatibleGames: ['Pokémon Emerald'],
    },
  },
  {
    id: 'eusine-reward-emr',
    name: 'Eusine Reward',
    file: '/cards/EUSINE_REWARD_EMR_EN.raw',
    game: 'Emerald',
    region: 'EN',
    image: '/card-images/eusine-reward.png',
    category: 'emerald-event',
    instructions: {
      activation:
        `${MYSTERY_GIFT_UNLOCK}\n\n${MYSTERY_GIFT_WONDER}\n\nAfter scanning, fly to Sootopolis City and speak to Eusine. He will reward you with access to Southern Island, where you can encounter the Lati twin not chosen at the start of your game. Board the S.S. Tidal at Lilycove or Slateport and select "Southern Island."`,
      eReaderSetup: EREADER_SETUP,
      cable: CABLE_STANDARD,
      compatibleGames: ['Pokémon Emerald'],
    },
  },
  {
    id: 'entei-emr',
    name: 'Entei',
    file: '/cards/ENTEI_EMR_EN.raw',
    game: 'Emerald',
    region: 'EN',
    image: '/card-images/entei.png',
    category: 'emerald-event',
    instructions: {
      activation: BEAST_ACTIVATION('Entei'),
      eReaderSetup: EREADER_SETUP,
      cable: CABLE_STANDARD,
      compatibleGames: ['Pokémon Emerald'],
    },
  },
  {
    id: 'raikou-emr',
    name: 'Raikou',
    file: '/cards/RAIKOU_EMR_EN.raw',
    game: 'Emerald',
    region: 'EN',
    image: '/card-images/raikou.png',
    category: 'emerald-event',
    instructions: {
      activation: BEAST_ACTIVATION('Raikou'),
      eReaderSetup: EREADER_SETUP,
      cable: CABLE_STANDARD,
      compatibleGames: ['Pokémon Emerald'],
    },
  },
  {
    id: 'suicune-emr',
    name: 'Suicune',
    file: '/cards/SUICUNE_EMR_EN.raw',
    game: 'Emerald',
    region: 'EN',
    image: '/card-images/suicune.png',
    category: 'emerald-event',
    instructions: {
      activation: BEAST_ACTIVATION('Suicune'),
      eReaderSetup: EREADER_SETUP,
      cable: CABLE_STANDARD,
      compatibleGames: ['Pokémon Emerald'],
    },
  },
  {
    id: 'jirachi-emr',
    name: 'Jirachi',
    file: '/cards/JIRACHI_EMR_EN.raw',
    game: 'Emerald',
    region: 'EN',
    image: '/card-images/jirachi.png',
    category: 'emerald-event',
    instructions: {
      activation:
        `${MYSTERY_GIFT_UNLOCK}\n\n${MYSTERY_GIFT_WONDER}\n\nJirachi will be placed in your PC Box after the scan. No Battle Frontier restrictions on this variant.`,
      eReaderSetup: EREADER_SETUP,
      cable: CABLE_STANDARD,
      compatibleGames: ['Pokémon Emerald'],
    },
  },
]
