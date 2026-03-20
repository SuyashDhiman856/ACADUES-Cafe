import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UploadService {

  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!,
    );
  }

  async uploadMenuImage(file: Express.Multer.File): Promise<string> {

    const fileName = `${uuid()}-${file.originalname}`;

    const { error } = await this.supabase.storage
      .from('menu-dishes-images')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) throw new Error(error.message);

    const { data } = this.supabase.storage
      .from('menu-dishes-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

}