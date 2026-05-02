
export interface PresetSound {
  id: string;
  label: string;
  url: string;
  category: 'show' | 'memes' | 'radio';
}

export const PRESET_SOUNDS: PresetSound[] = [
  // SHOW / APLAUSOS
  {
    id: 'p-apl-1',
    label: 'APLAUSO 1',
    url: 'https://actions.google.com/sounds/v1/human/audience_applause.ogg',
    category: 'show'
  },
  {
    id: 'p-apl-2',
    label: 'APLAUSO 2',
    url: 'https://actions.google.com/sounds/v1/human/applause.ogg',
    category: 'show'
  },
  {
    id: 'p-ris-1',
    label: 'RISADA 1',
    url: 'https://actions.google.com/sounds/v1/human/laugh.ogg',
    category: 'show'
  },
  {
    id: 'p-ris-2',
    label: 'RISADA 2',
    url: 'https://actions.google.com/sounds/v1/human/laughter_short.ogg',
    category: 'show'
  },
  // MEMES
  {
    id: 'p-meme-1',
    label: 'UEPA!',
    url: 'https://raw.githubusercontent.com/ravideveloper/ratinho-soundboard/master/app/src/main/res/raw/uepa.mp3',
    category: 'memes'
  },
  {
    id: 'p-meme-2',
    label: 'CAVALO!',
    url: 'https://raw.githubusercontent.com/ravideveloper/ratinho-soundboard/master/app/src/main/res/raw/cavalo.mp3',
    category: 'memes'
  },
  {
    id: 'p-meme-3',
    label: 'RATINHOOO',
    url: 'https://raw.githubusercontent.com/ravideveloper/ratinho-soundboard/master/app/src/main/res/raw/ratinho.mp3',
    category: 'memes'
  },
  {
    id: 'p-meme-4',
    label: 'PARE!',
    url: 'https://raw.githubusercontent.com/ravideveloper/ratinho-soundboard/master/app/src/main/res/raw/pare.mp3',
    category: 'memes'
  },
  {
    id: 'p-meme-5',
    label: 'IRRRAA!',
    url: 'https://raw.githubusercontent.com/ravideveloper/ratinho-soundboard/master/app/src/main/res/raw/irra.mp3',
    category: 'memes'
  },
  // RADIO FX
  {
    id: 'p-fx-1',
    label: 'ALERTA',
    url: 'https://actions.google.com/sounds/v1/emergency/emergency_siren_short.ogg',
    category: 'radio'
  },
  {
    id: 'p-fx-2',
    label: 'EXPLOSÃO',
    url: 'https://actions.google.com/sounds/v1/science_fiction/explosion_with_reverb.ogg',
    category: 'radio'
  },
  {
    id: 'p-fx-3',
    label: 'SIRENE',
    url: 'https://actions.google.com/sounds/v1/emergency/ambulance_siren_distant.ogg',
    category: 'radio'
  }
];
