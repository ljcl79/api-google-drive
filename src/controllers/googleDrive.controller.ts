import { Request, Response } from 'express';
import { GoogleDriveService } from '../services/googleDrive.service';
import { FolderRequest, GoogleDriveResponse } from '../types/google-drive.types';
import fs from 'fs';

export class GoogleDriveController {
    private service: GoogleDriveService;

    constructor() {
        this.service = new GoogleDriveService();
    }

    createFolder = async (req: Request, res: Response<GoogleDriveResponse>) => {
        try {
            const folderRequest: FolderRequest = req.body;
            const folderId = await this.service.createFolder(folderRequest);
            res.status(200).json({ message: 'Carpeta creada', folderId });
        } catch (error: any) {
            res.status(500).json({ message: 'Error al crear carpeta', error: error.message });
        }
    };

    uploadFile = async (req: Request, res: Response<GoogleDriveResponse>) => {
        try {
            if (!req.file) {
                throw new Error('No se proporcionó ningún archivo');
            }

            const fileId = await this.service.uploadFile({
                file: req.file,
                parentId: req.body.parentId,
            });

            res.status(200).json({ message: 'Archivo subido', fileId });
        } catch (error: any) {
            res.status(500).json({ message: 'Error al subir archivo', error: error.message });
        }
    };

    downloadFile = async (req: Request, res: Response) => {
        try {
            const { fileId } = req.params;
            const filePath = await this.service.downloadFile(fileId);

            res.download(filePath, () => {
                // Eliminar archivo local después de la descarga
                fs.unlinkSync(filePath);
            });
        } catch (error: any) {
            res.status(500).json({ message: 'Error al descargar archivo', error: error.message });
        }
    };

    listSubFolders = async (req: Request, res: Response) => {
        try {
            const { parentId } = req.params;

            if (!parentId) {
                throw new Error('Se requiere el ID del padre');
            }

            const subFolders = await this.service.listSubFolders(parentId);
            res.status(200).json({ message: 'Subcarpetas listadas', subFolders });
        } catch (error: any) {
            res.status(500).json({ message: 'Error al listar subcarpetas', error: error.message });
        }
    };

    checkIfFolderExists = async (req: Request, res: Response) => {
        try {

            const folderRequest: FolderRequest = req.body;

            if (!folderRequest.folderName || !folderRequest.parentId) {
                throw new Error('Se requiere el nombre de la carpeta y el ID del padre');
            }

            const folderId = await this.service.checkIfFolderExists(folderRequest);

            if (folderId) {
                res.status(200).json({ message: 'La carpeta existe', folderId });
            } else {
                res.status(404).json({ message: 'La carpeta no existe' });
            }
        } catch (error: any) {
            res.status(500).json({ message: 'Error al verificar si la carpeta existe', error: error.message });
        }
    };

    checkFolderCreateIfNotExist = async (req: Request, res: Response<GoogleDriveResponse>) => {
        try {
            const { folderPath } = req.body;

            if (!folderPath || typeof folderPath !== 'string') {
                throw new Error('La ruta de la carpeta es obligatoria y debe ser una cadena de texto.');
            }

            const pathSegments = folderPath.split('/').filter(Boolean); // Divide el path y elimina segmentos vacíos
            let parentId = 'root'; // Empieza desde la raíz
            let currentId = '';

            for (const segment of pathSegments) {
                // Verifica si la carpeta actual existe dentro del parentId
                const existingFolderId = await this.service.checkIfFolderExists({ folderName: segment, parentId });

                if (existingFolderId) {
                    // Si existe, toma su ID como el nuevo parentId
                    currentId = existingFolderId;
                    parentId = currentId;
                } else {
                    // Si no existe, crea la carpeta y actualiza el parentId
                    currentId = await this.service.createFolder({ folderName: segment, parentId });
                    parentId = currentId;
                }
            }

            // Retorna el ID de la última carpeta (la creada o encontrada)
            res.status(200).json({
                message: `ID de la última carpeta en la ruta '${folderPath}'`,
                folderId: currentId,
            });
        } catch (error: any) {
            res.status(500).json({ message: 'Error al verificar/crear la ruta', error: error.message });
        }
    };
}
