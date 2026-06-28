export interface EventCard {
  id: string
  name: string
  file: string
  game: string
  region: string
}

export const EVENT_CARDS: EventCard[] = [
  { id: 'eon-ticket',       name: 'Eon Ticket',         file: '/cards/EON_TICKET_EN.raw',       game: 'Ruby / Sapphire', region: 'EN' },
  { id: 'celebi',           name: 'Celebi',             file: '/cards/CELEBI_EN.raw',           game: 'Ruby / Sapphire', region: 'EN' },
  { id: 'celebi-unlocked',  name: 'Celebi (Unlocked)',  file: '/cards/CELEBI_UNLOCKED_EN.raw',  game: 'Ruby / Sapphire', region: 'EN' },
  { id: 'deoxys',           name: 'Deoxys',             file: '/cards/DEOXYS_EN.raw',           game: 'Ruby / Sapphire', region: 'EN' },
  { id: 'groudon',          name: 'Groudon',            file: '/cards/GROUDON_EN.raw',          game: 'Ruby / Sapphire', region: 'EN' },
  { id: 'hooh',             name: 'Ho-Oh',              file: '/cards/HOOH_EN.raw',             game: 'Ruby / Sapphire', region: 'EN' },
  { id: 'jirachi',          name: 'Jirachi',            file: '/cards/JIRACHI_EN.raw',          game: 'Ruby / Sapphire', region: 'EN' },
  { id: 'kyogre',           name: 'Kyogre',             file: '/cards/KYOGRE_EN.raw',           game: 'Ruby / Sapphire', region: 'EN' },
  { id: 'lugia',            name: 'Lugia',              file: '/cards/LUGIA_EN.raw',            game: 'Ruby / Sapphire', region: 'EN' },
  { id: 'mew',              name: 'Mew',                file: '/cards/MEW_EN.raw',              game: 'Ruby / Sapphire', region: 'EN' },
]
