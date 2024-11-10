import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import * as fs from 'fs';
import * as path from 'path';
import { ApiatoService } from '../apiato/apiato.service';

@Injectable()
export class FileService extends ApiatoService<File, any, any> {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>
  ) {
    super(fileRepository, {});
  }

  async saveFile(file: Express.Multer.File): Promise<File> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const uploadDir = path.join(
      __dirname,
      `../../public/${year}/${month}/${day}`,
    );

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${file.originalname.split('.')[0]}-${Date.now()}${path.extname(file.originalname)}`;
    const localPath = path.join(uploadDir, filename);
    const publicPath = `/public/${year}/${month}/${day}/${filename}`;

    console.log(file);

    const newFile = this.fileRepository.create({
      localPath,
      publicPath,
      filename,
    });

    return this.fileRepository.save(newFile);
  }

  async saveFiles(files: Express.Multer.File[]): Promise<File[]> {
    const savedFiles = [];
    for (const file of files) {
      const savedFile = await this.saveFile(file);
      savedFiles.push(savedFile);
    }
    return savedFiles;
  }
}
