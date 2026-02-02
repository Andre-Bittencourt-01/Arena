export interface IStorageProvider {
    uploadFile(file: Buffer, path: string, mimeType: string): Promise<string>;
    deleteFile(path: string): Promise<void>;
    getSignedUrl(path: string): Promise<string>;
}
