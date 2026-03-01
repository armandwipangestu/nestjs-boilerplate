import { randomUUID } from 'crypto';
import { StorageProvider } from '../interfaces/storage.interface';
import * as fs from 'fs';
import * as path from 'path';

export class LocalStorageProvider implements StorageProvider {
  private readonly uploadPath = path.resolve(process.cwd(), 'uploads');

  constructor(
    private readonly host: string,
    private readonly port: number,
  ) {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async upload(
    file: Express.Multer.File,
    folder: string = 'avatars',
  ): Promise<string> {
    const ext = path.extname(file.originalname);
    const fileName = `${randomUUID()}${ext}`;
    const key = `${folder}/${fileName}`;

    const dir = path.join(this.uploadPath, folder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, fileName);
    fs.writeFileSync(filePath, file.buffer);

    return key;
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.uploadPath, key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  getUrl(key: string): string {
    return `http://${this.host}:${this.port}/uploads/${key}`;
  }
}