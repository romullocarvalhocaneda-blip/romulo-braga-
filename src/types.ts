export interface AudioFile {
  id: string;
  name: string;
  url: string;
  duration?: number;
  type: 'music' | 'fx';
}

export interface SoundPad {
  id: string | number;
  label: string;
  file?: AudioFile;
  color?: string;
}

export interface PlaylistEntry extends AudioFile {
  order: number;
}
