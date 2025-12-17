import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }

    async uploadBase64(base64String: string) : Promise<string> {
        try {
            const result = await cloudinary.uploader.upload(base64String, {
                folder: 'alerta-cidadao',
                resource_type: 'image',
            });

            return result.secure_url;
        } catch (error) {
            console.log("complete error: ", error);
            throw new Error(`Error to upload image: ${JSON.stringify(error)}`);
        }
    }
}
