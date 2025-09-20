import {
  getFileExtension,
  getMimeType,
  isValidConversion,
  getAvailableOutputFormats,
  validateFileType,
  validateFileSize,
  sanitizeFilename,
  validateConversionRequest
} from '../../utils/validate';

describe('validate utils', () => {
  describe('getFileExtension', () => {
    it('should extract file extension correctly', () => {
      expect(getFileExtension('test.pdf')).toBe('pdf');
      expect(getFileExtension('document.docx')).toBe('docx');
      expect(getFileExtension('image.PNG')).toBe('png');
      expect(getFileExtension('file')).toBe('');
    });
  });

  describe('getMimeType', () => {
    it('should return correct MIME type for extensions', () => {
      expect(getMimeType('test.pdf')).toBe('application/pdf');
      expect(getMimeType('document.docx')).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      expect(getMimeType('image.png')).toBe('image/png');
      expect(getMimeType('image.jpeg')).toBe('image/jpeg');
    });
  });

  describe('isValidConversion', () => {
    it('should validate conversion pairs correctly', () => {
      expect(isValidConversion('docx', 'pdf')).toBe(true);
      expect(isValidConversion('png', 'jpeg')).toBe(true);
      expect(isValidConversion('pdf', 'png')).toBe(true);
      expect(isValidConversion('docx', 'png')).toBe(false);
      expect(isValidConversion('invalid', 'pdf')).toBe(false);
    });
  });

  describe('getAvailableOutputFormats', () => {
    it('should return available output formats for input', () => {
      const docxFormats = getAvailableOutputFormats('docx');
      expect(docxFormats).toContain('pdf');
      expect(docxFormats).toHaveLength(1);

      const pngFormats = getAvailableOutputFormats('png');
      expect(pngFormats).toContain('jpeg');
      expect(pngFormats).toContain('webp');
      expect(pngFormats).toContain('tiff');
      expect(pngFormats).toContain('pdf');
    });
  });

  describe('validateFileType', () => {
    it('should validate file type correctly', () => {
      const result = validateFileType('test.pdf', 'application/pdf');
      expect(result.valid).toBe(true);
      expect(result.extension).toBe('pdf');

      const invalidResult = validateFileType('test.txt', 'application/pdf');
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.error).toContain('MIME type mismatch');
    });
  });

  describe('validateFileSize', () => {
    it('should validate file size correctly', () => {
      const validResult = validateFileSize(1024 * 1024, 50); // 1MB, max 50MB
      expect(validResult.valid).toBe(true);

      const invalidResult = validateFileSize(100 * 1024 * 1024, 50); // 100MB, max 50MB
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.error).toContain('exceeds maximum');
    });
  });

  describe('sanitizeFilename', () => {
    it('should sanitize filename correctly', () => {
      expect(sanitizeFilename('test file.pdf')).toBe('test_file.pdf');
      expect(sanitizeFilename('file@#$%.txt')).toBe('file____.txt');
      expect(sanitizeFilename('normal-file.pdf')).toBe('normal-file.pdf');
    });
  });
});



