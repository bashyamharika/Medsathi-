import type { Request, Response, NextFunction } from 'express';
import { cloudinaryService } from '../services/cloudinary.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

export class UploadController {
  /**
   * Handles patient profile photo upload.
   * Validates file presence and uploads via CloudinaryService.
   */
  public async uploadPatientPhoto(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json(
          errorResponse('Please upload a patient photo (JPG, PNG, or WebP format required).')
        );
        return;
      }

      const result = await cloudinaryService.uploadPatientPhoto(
        req.file.buffer,
        req.file.mimetype
      );

      res.status(201).json(
        successResponse(result)
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * Deletes an orphaned image from Cloudinary if patient creation failed
   */
  public async deletePatientPhoto(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { publicId } = req.params;
      if (!publicId || typeof publicId !== 'string') {
        res.status(400).json(errorResponse('Public ID is required.'));
        return;
      }

      const deleted = await cloudinaryService.deletePatientPhoto(publicId);
      res.json(successResponse({ deleted }));
    } catch (err) {
      next(err);
    }
  }
}

export const uploadController = new UploadController();
export default uploadController;
