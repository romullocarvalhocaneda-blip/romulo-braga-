import Dexie, { Table } from 'dexie';

export interface LibraryFile {
  id?: number;
  name: string;
  category: string;
  blob: Blob;
  type: string;
  createdAt: number;
}

export class MediaDatabase extends Dexie {
  library!: Table<LibraryFile>;

  constructor() {
    super('StudioDB');
    this.version(1).stores({
      library: '++id, name, category'
    });
  }
}

export const db = new MediaDatabase();
