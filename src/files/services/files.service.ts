import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as uuid from 'uuid';

@Injectable()
export class FilesService {
  async createFile(file): Promise<string> {
    try {
      const fileName = uuid.v4() + '.mp4';
      const filePath = path.resolve(__dirname, '../..', 'video_storage');
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, {
          recursive: true,
        });
      }
      fs.writeFileSync(path.join(filePath, fileName), file.buffer);
      return fileName;
    } catch (e) {
      throw new HttpException(
        'Ошибка записи',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async updateFile(file, fileName): Promise<string> {
    try {
      const filePath = path.resolve(__dirname, '../..', 'video_storage');
      fs.writeFileSync(path.join(filePath, fileName), file.buffer);
      return fileName;
    } catch (e) {
      throw new HttpException(
        'Ошибка записи',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteVideoFile(fileName): Promise<string> {
    try {
      const filePath = path.resolve(__dirname, '../..', 'video_storage');
      fs.unlinkSync(path.join(filePath, fileName));
      return 'Успешно удалено';
    } catch (e) {
      throw new HttpException(
        'Ошибка удаления',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
