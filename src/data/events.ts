export interface EventCard {
  id: string
  name: string
  file: string
  game: string
  region: string
  image: string
}

export const EVENT_CARDS: EventCard[] = [
  { id: 'eon-ticket',       name: 'Eon Ticket',         file: '/cards/EON_TICKET_EN.raw',       game: 'Ruby / Sapphire', region: 'EN', image: '/card-images/eon-ticket.png'      },
  { id: 'celebi',           name: 'Celebi',             file: '/cards/CELEBI_EN.raw',           game: 'Ruby / Sapphire', region: 'EN', image: '/card-images/celebi.png'           },
  { id: 'celebi-unlocked',  name: 'Celebi (Unlocked)',  file: '/cards/CELEBI_UNLOCKED_EN.raw',  game: 'Ruby / Sapphire', region: 'EN', image: '/card-images/celebi-unlocked.png'  },
  { id: 'deoxys',           name: 'Deoxys',             file: '/cards/DEOXYS_EN.raw',           game: 'Ruby / Sapphire', region: 'EN', image: '/card-images/deoxys.png'           },
  { id: 'groudon',          name: 'Groudon',            file: '/cards/GROUDON_EN.raw',          game: 'Ruby / Sapphire', region: 'EN', image: '/card-images/groudon.png'          },
  { id: 'hooh',             name: 'Ho-Oh',              file: '/cards/HOOH_EN.raw',             game: 'Ruby / Sapphire', region: 'EN', image: '/card-images/hooh.png'             },
  { id: 'jirachi',          name: 'Jirachi',            file: '/cards/JIRACHI_EN.raw',          game: 'Ruby / Sapphire', region: 'EN', image: '/card-images/jirachi.png'          },
  { id: 'kyogre',           name: 'Kyogre',             file: '/cards/KYOGRE_EN.raw',           game: 'Ruby / Sapphire', region: 'EN', image: '/card-images/kyogre.png'           },
  { id: 'lugia',            name: 'Lugia',              file: '/cards/LUGIA_EN.raw',            game: 'Ruby / Sapphire', region: 'EN', image: '/card-images/lugia.png'            },
  { id: 'mew',              name: 'Mew',                file: '/cards/MEW_EN.raw',              game: 'Ruby / Sapphire', region: 'EN', image: '/card-images/mew.png'              },
]
