export interface IRepository<T> {
    create(data: Partial<T>): Promise<T>;
    findById(id: string): Promise<T | null>;
    findAll(filter?: Partial<T>): Promise<T[]>;
    update(id: string, data: Partial<T>): Promise<T>;
    delete(id: string): Promise<void>;
}
