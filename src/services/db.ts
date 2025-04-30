import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface TodoItem {
    id?: number;
    text: string;
    datetime: string;
    listId: number;
}

interface TodoList {
    id?: number;
    name: string;
    items: TodoItem[];
}

interface TodoDB extends DBSchema {
    lists: {
        key: number;
        value: TodoList;
    };
    items: {
        key: number;
        value: TodoItem;
        indexes: { 'by-listId': number };
    };
}

class DatabaseService {
    private db: Promise<IDBPDatabase<TodoDB>>;

    constructor() {
        this.db = openDB<TodoDB>('todo-db', 1, {
            upgrade(db) {
                const listsStore = db.createObjectStore('lists', { keyPath: 'id', autoIncrement: true });
                const itemsStore = db.createObjectStore('items', { keyPath: 'id', autoIncrement: true });
                itemsStore.createIndex('by-listId', 'listId');
            },
        });
    }

    // Lists
    async createList(name: string): Promise<number> {
        const db = await this.db;
        const list: TodoList = { name, items: [] };
        return db.add('lists', list);
    }

    async getLists(): Promise<TodoList[]> {
        const db = await this.db;
        return db.getAll('lists');
    }

    async getList(id: number): Promise<TodoList | undefined> {
        const db = await this.db;
        return db.get('lists', id);
    }

    async updateList(list: TodoList): Promise<void> {
        const db = await this.db;
        await db.put('lists', list);
    }

    async deleteList(id: number): Promise<void> {
        const db = await this.db;
        const tx = db.transaction(['lists', 'items'], 'readwrite');
        await tx.objectStore('items').index('by-listId').openCursor(id).then(function cursorIterate(cursor) {
            if (!cursor) return;
            cursor.delete();
            return cursor.continue();
        });
        await tx.objectStore('lists').delete(id);
        await tx.done;
    }

    // Items
    async addItem(item: Omit<TodoItem, 'id'>): Promise<number> {
        const db = await this.db;
        return db.add('items', item);
    }

    async getItems(listId: number): Promise<TodoItem[]> {
        const db = await this.db;
        return db.getAllFromIndex('items', 'by-listId', listId);
    }

    async updateItem(item: TodoItem): Promise<void> {
        const db = await this.db;
        await db.put('items', item);
    }

    async deleteItem(id: number): Promise<void> {
        const db = await this.db;
        await db.delete('items', id);
    }
}

export const db = new DatabaseService(); 