import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getObjectStorageConfig } from '../../config/storage.config';

type UploadPublicObjectInput = {
  key: string;
  body: Buffer;
  contentType: string;
  cacheControl?: string;
};

@Injectable()
export class ObjectStorageService {
  private readonly config = getObjectStorageConfig();
  private readonly client = this.config.isConfigured
    ? new S3Client({
        region: 'auto',
        endpoint: this.config.endpoint,
        forcePathStyle: true,
        credentials: {
          accessKeyId: this.config.accessKeyId,
          secretAccessKey: this.config.secretAccessKey,
        },
      })
    : null;

  async uploadPublicObject(input: UploadPublicObjectInput) {
    if (!this.client || !this.config.bucketName) {
      throw new InternalServerErrorException(
        'Object storage is not configured.',
      );
    }

    if (!this.config.publicBaseUrl) {
      throw new InternalServerErrorException(
        'R2 public base URL is not configured.',
      );
    }

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.config.bucketName,
          Key: input.key,
          Body: input.body,
          ContentType: input.contentType,
          CacheControl:
            input.cacheControl ?? 'public, max-age=31536000, immutable',
        }),
      );
    } catch (error) {
      throw new InternalServerErrorException('Could not upload asset to R2.');
    }

    return {
      key: input.key,
      publicUrl: this.buildPublicUrl(input.key),
    };
  }

  buildPublicUrl(key: string) {
    if (!this.config.publicBaseUrl) {
      throw new BadRequestException('R2 public base URL is missing.');
    }

    return `${this.config.publicBaseUrl}/${key.replace(/^\/+/, '')}`;
  }
}
