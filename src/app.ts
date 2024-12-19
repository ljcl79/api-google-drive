// src/app.ts
import express from 'express';
import bodyParser from 'body-parser';
import googleDriveRoutes from './routes/googleDrive.routes';

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/drive', googleDriveRoutes);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});