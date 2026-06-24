import Dexie, { type Table } from 'dexie';

export type LocalDocument = {
  id: string;
  module: string;
  type: string;
  createdAt: Date;
  data: unknown;
};

class CalculaYaDatabase extends Dexie {
  documents!: Table<LocalDocument, string>;

  constructor() {
    super('CalculaYaDB');

    this.version(1).stores({
      documents: 'id, module, type, createdAt',
    });
  }
}

export const db = new CalculaYaDatabase();
