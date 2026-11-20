"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerConfig = void 0;
const multer_1 = require("multer");
const uuid_1 = require("uuid");
const path = require("path");
exports.multerConfig = {
    storage: (0, multer_1.diskStorage)({
        destination: './uploads/temp',
        filename: (req, file, callback) => {
            const uniqueName = `${(0, uuid_1.v4)()}${path.extname(file.originalname)}`;
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
        }
        else {
            callback(new Error('Tipo de arquivo não permitido'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
};
//# sourceMappingURL=multer.config.js.map