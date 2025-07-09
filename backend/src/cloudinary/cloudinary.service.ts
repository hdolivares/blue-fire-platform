import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
  uploadImage(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream((error, result) => {
        if (error) return reject(error);
        // Add this check to make sure the result is not undefined
        if (!result) return reject(new Error("Cloudinary upload failed."));
        resolve(result);
      });
      toStream(file.buffer).pipe(upload);
    });
  }
}