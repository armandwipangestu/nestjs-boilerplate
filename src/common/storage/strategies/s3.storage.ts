import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { StorageProvider } from '../interfaces/storage.interface';
import { randomUUID } from 'crypto';
import * as path from 'path';

interface S3Options {
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region?: string;
  endpoint?: string;
}

export class S3StorageProvider implements StorageProvider {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly endpoint?: string;

  constructor(options: S3Options) {
    this.region = options.region ?? 'us-east-1';
    this.bucket = options.bucket;
    this.endpoint = options.endpoint;

    const isCustomEndpoint = !!options.endpoint;

    this.client = new S3Client({
      region: this.region,
      ...(isCustomEndpoint && {
        endpoint: options.endpoint,
        forcePathStyle: true,
      }),
      credentials: {
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey,
      },
    });
  }

  async upload(
    file: Express.Multer.File,
    folder: string = 'avatars',
  ): Promise<string> {
    const ext = path.extname(file.originalname);
    const fileName = `${randomUUID()}${ext}`;
    const key = `${folder}/${fileName}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return key;
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  getUrl(key: string): string {
    if (this.endpoint) {
      return `${this.endpoint}/${this.bucket}/${key}`;
    }

    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }
}
