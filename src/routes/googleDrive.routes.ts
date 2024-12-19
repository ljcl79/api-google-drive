import { Router } from 'express';
import { GoogleDriveController } from '../controllers/googleDrive.controller';
import { upload } from '../config/multer.config';

const router = Router();
const controller = new GoogleDriveController();

router.post('/create-folder', controller.createFolder);
router.post('/upload-file', upload.single('file'), controller.uploadFile);
router.get('/download-file/:fileId', controller.downloadFile);
router.get('/list-subfolders/:parentId', controller.listSubFolders);
router.post('/check-folder-exists', controller.checkIfFolderExists);
router.post('/check-folder-create-if-not-exist', controller.checkFolderCreateIfNotExist);

export default router;

