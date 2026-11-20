import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads/temp',
    filename: (req, file, callback) => {
      const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
      callback(null, uniqueName);
    },
  }),
  fileFilter: (req, file, callback) => {
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('Tipo de arquivo não permitido'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
};