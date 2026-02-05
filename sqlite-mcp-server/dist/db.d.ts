import Database from 'better-sqlite3';
export declare function getDb(): Database.Database;
export declare function closeDb(): void;
export declare function generateId(prefix?: string): string;
export declare function now(): string;
export declare function toJson(row: any): any;
export declare function queryOne<T>(sql: string, params?: any[]): T | undefined;
export declare function queryAll<T>(sql: string, params?: any[]): T[];
export declare const getOne: typeof queryOne;
export declare const query: typeof queryAll;
export declare function execute(sql: string, params?: any[]): Database.RunResult;
export declare const run: typeof execute;
export declare function transaction<T>(fn: () => T): T;
//# sourceMappingURL=db.d.ts.map