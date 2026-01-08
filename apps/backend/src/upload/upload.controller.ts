import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { bucket } from '../firebase';
import { v4 as uuidv4 } from 'uuid';
import Sharp from 'sharp';

@Controller('upload')
export class UploadController {
  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    // Check if the file is an image
    if (!file.mimetype.startsWith('image/')) {
      // If not an image, upload as is
      const blob = bucket.file(`${uuidv4()}`);
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      return new Promise((resolve, reject) => {
        blobStream.on('error', (err) => reject(err));
        blobStream.on('finish', async () => {
          await blob.makePublic();
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
          resolve({ url: publicUrl });
        });
        blobStream.end(file.buffer);
      });
    }

    // If it is an image, process it with Sharp
    try {
      const filename = `${uuidv4()}.webp`;
      const processed = await Sharp(file.buffer)
        .resize(1024, 1024, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: 80 })
        .toBuffer();

      const fileRef = bucket.file(filename);
      await fileRef.save(processed, {
        metadata: {
          contentType: 'image/webp'
        }
      });

      await fileRef.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
      return { url: publicUrl };
    } catch (error) {
      throw new Error(`Failed to process image: ${error.message}`);
    }
  }
}
