export interface StorageProvider {
  upload(file: Express.Multer.File, folder?: string): Promise<string>;

  delete(key: string): Promise<void>;

  getUrl(key: string): string;
}
