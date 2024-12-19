export interface FolderRequest {
    folderName: string;
    parentId?: string;
}

export interface FileUploadRequest {
    parentId?: string;
    file: Express.Multer.File;
}

export interface GoogleDriveResponse {
    message: string;
    fileId?: string;
    folderId?: string;
    error?: string;
}