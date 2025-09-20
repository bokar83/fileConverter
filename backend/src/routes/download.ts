import express from 'express';
import path from 'path';
import fs from 'fs';
import { isValidId } from '../utils/ids';
import { storageService } from '../services/storage';

const router = express.Router();

router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    if (!isValidId(id)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }
    
    const result = storageService.get(id);
    if (!result) {
      return res.status(404).json({ error: 'File not found or expired' });
    }
    
    // Check if file still exists
    if (!fs.existsSync(result.filePath)) {
      storageService.delete(id);
      return res.status(404).json({ error: 'File not found on disk' });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.convertedName}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(result.filePath);
    
    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to read file' });
      }
    });
    
    fileStream.pipe(res);
    
    // Clean up after successful download
    fileStream.on('end', () => {
      // Delete the file and result entry after a short delay
      setTimeout(() => {
        try {
          fs.unlinkSync(result.filePath);
          storageService.delete(id);
        } catch (error) {
          console.warn('Failed to clean up file:', error);
        }
      }, 5000); // 5 second delay
    });
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ 
      error: 'Download failed', 
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as downloadRouter };
