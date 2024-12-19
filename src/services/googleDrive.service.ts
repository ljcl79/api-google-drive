// src/services/googleDrive.service.ts
import { google, drive_v3 } from 'googleapis';
import fs from 'fs';
import { FolderRequest, FileUploadRequest } from '../types/google-drive.types';

export class GoogleDriveService {
    private static CREDENTIALS_PATH = 'credentials.json';
    private static TOKEN_PATH = 'token.json';
    private static SCOPES = ['https://www.googleapis.com/auth/drive'];

    private async authenticate() {
        const content = fs.readFileSync(GoogleDriveService.CREDENTIALS_PATH, 'utf8');
        const { client_secret, client_id, redirect_uris } = JSON.parse(content).installed;

        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

        // Intentar cargar el token desde el archivo
        if (fs.existsSync(GoogleDriveService.TOKEN_PATH)) {
            const token = fs.readFileSync(GoogleDriveService.TOKEN_PATH, 'utf8');
            oAuth2Client.setCredentials(JSON.parse(token));
            return oAuth2Client;
        }

        // Si el token no existe, generar URL de autorización
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: GoogleDriveService.SCOPES,
        });

        console.log('Autoriza la aplicación visitando este enlace:', authUrl);

        // Solicitar el código de autorización al usuario
        const rl = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        const getCode = () =>
            new Promise<string>((resolve) => {
                rl.question('Introduce el código de autorización aquí: ', (code: string) => {
                    rl.close();
                    resolve(code);
                });
            });

        const code = await getCode();

        // Intercambiar el código por un token
        const tokenResponse = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokenResponse.tokens);

        // Guardar el token para usos futuros
        fs.writeFileSync(GoogleDriveService.TOKEN_PATH, JSON.stringify(tokenResponse.tokens), 'utf8');
        console.log('Token almacenado en', GoogleDriveService.TOKEN_PATH);

        return oAuth2Client;
    }

    async createFolder({ folderName, parentId }: FolderRequest): Promise<string> {
        try {
            const auth = await this.authenticate();
            const drive = google.drive({ version: 'v3', auth });

            const requestBody: drive_v3.Schema$File = {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: parentId ? [parentId] : undefined
            };

            const folder = await drive.files.create({
                requestBody,
                fields: 'id'
            });

            if (!folder.data.id) {
                throw new Error('No se pudo crear la carpeta: ID no generado');
            }

            return folder.data.id;
        } catch (error) {
            throw new Error(`Error al crear la carpeta: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }

    async uploadFile({ file, parentId }: FileUploadRequest): Promise<string> {
        try {
            const auth = await this.authenticate();
            const drive = google.drive({ version: 'v3', auth });

            const requestBody: drive_v3.Schema$File = {
                name: file.originalname,
                parents: parentId ? [parentId] : undefined
            };

            const media = {
                mimeType: file.mimetype,
                body: fs.createReadStream(file.path)
            };

            const uploadedFile = await drive.files.create({
                requestBody,
                media,
                fields: 'id'
            });

            if (!uploadedFile.data.id) {
                throw new Error('No se pudo subir el archivo: ID no generado');
            }

            // Eliminar archivo local después de subir
            fs.unlinkSync(file.path);

            return uploadedFile.data.id;
        } catch (error) {
            // Asegurarse de limpiar el archivo temporal en caso de error
            if (file.path && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            throw new Error(`Error al subir el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }

    async downloadFile(fileId: string): Promise<string> {
        try {
            const auth = await this.authenticate();
            const drive = google.drive({ version: 'v3', auth });

            if (!fs.existsSync('downloads')) {
                fs.mkdirSync('downloads');
            }

            const filePath = `downloads/${fileId}`;
            const dest = fs.createWriteStream(filePath);

            const response = await drive.files.get(
                { fileId, alt: 'media' },
                { responseType: 'stream' }
            );

            return new Promise((resolve, reject) => {
                response.data
                    .on('end', () => resolve(filePath))
                    .on('error', (error: Error) => {
                        // Limpiar archivo parcialmente descargado en caso de error
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                        }
                        reject(error);
                    })
                    .pipe(dest);
            });
        } catch (error) {
            throw new Error(`Error al descargar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }

    async listSubFolders(parentId: string): Promise<drive_v3.Schema$File[]> {
        try {
            const auth = await this.authenticate();
            const drive = google.drive({ version: 'v3', auth });

            const response = await drive.files.list({
                q: `'${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
                fields: 'files(id, name)'
            });

            return response.data.files || [];
        } catch (error) {
            throw new Error(`Error al listar las subcarpetas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }

    async checkIfFolderExists(folderData: FolderRequest): Promise<string | null> {
        try {
            const auth = await this.authenticate();
            const drive = google.drive({ version: 'v3', auth });
            const { folderName, parentId } = folderData;

            const response = await drive.files.list({
                q: `'${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
                fields: 'files(id)'
            });

            if (response.data.files && response.data.files.length > 0) {
                return response.data.files[0].id || null;
            }

            return null;
        } catch (error) {
            throw new Error(`Error al verificar si la carpeta existe: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }
}
