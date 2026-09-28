import { Router, type Request, type Response, type NextFunction } from 'express';
import multer from 'multer';
import { uploadController } from '../controllers/upload.controller.js';
import { errorResponse } from '../utils/response.js';

const uploadRouter = Router();

// Configure multer for memory storage and file validation
const storage = multer.memoryStorage();

const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('INVALID_FILE_TYPE'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB maximum file size
  },
  fileFilter,
});

// Middleware wrapper to catch multer specific errors and provide friendly responses
const handleMulterUpload = (req: Request, res: Response, next: NextFunction) => {
  upload.single('photo')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(400).json(
            errorResponse('Image size is too large. Maximum allowed size is 5MB.')
          );
          return;
        }
        res.status(400).json(errorResponse(`Upload error: ${err.message}`));
        return;
      }
      if (err.message === 'INVALID_FILE_TYPE') {
        res.status(400).json(
          errorResponse('Please upload a JPG, PNG, or WebP image.')
        );
        return;
      }
      res.status(400).json(errorResponse('Failed to process image file.'));
      return;
    }
    next();
  });
};

/**
 * POST /api/upload/patient-photo
 * Uploads patient photo to Cloudinary
 */
uploadRouter.post('/patient-photo', handleMulterUpload, (req, res, next) => {
  uploadController.uploadPatientPhoto(req, res, next);
});

/**
 * DELETE /api/upload/patient-photo/:publicId
 * Deletes patient photo from Cloudinary
 */
uploadRouter.delete('/patient-photo/:publicId', (req, res, next) => {
  uploadController.deletePatientPhoto(req, res, next);
});

export default uploadRouter;
