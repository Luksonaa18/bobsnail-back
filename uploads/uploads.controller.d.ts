import type { File as MulterFile } from 'multer';
export declare class UploadController {
    uploadFile(file: MulterFile): {
        imageUrl: string;
    };
}
