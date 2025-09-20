# SnapConvert - File Converter MVP

A simple, fast web application to convert common documents and images with drag-and-drop functionality.

## Features

### Document Conversions
- **DOCX → PDF** - Convert Word documents to PDF
- **XLSX → PDF** - Convert Excel spreadsheets to PDF  
- **PPTX → PDF** - Convert PowerPoint presentations to PDF
- **TXT → PDF** - Convert text files to PDF

### Image Conversions
- **JPEG ↔ PNG** - Convert between JPEG and PNG formats
- **JPEG/PNG ↔ WebP** - Convert to/from WebP format
- **PNG ↔ TIFF** - Convert between PNG and TIFF formats
- **GIF/BMP → PNG/JPEG** - Convert legacy formats to modern ones

### PDF Conversions
- **PDF → PNG/JPEG** - Convert PDF pages to images (multi-page PDFs return as ZIP)
- **Image(s) → PDF** - Merge multiple images into a single PDF

## Tech Stack

- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Node.js + Express + TypeScript
- **Conversion Engine**: 
  - LibreOffice (headless) for document conversions
  - Sharp for image processing
  - Poppler utils for PDF to image conversion
- **Containerization**: Docker + Docker Compose

## Prerequisites

- Node.js 18+ 
- Docker Desktop (optional, for containerized deployment)
- LibreOffice (for document conversions)
- Poppler utils (for PDF to image conversions)

## Quick Start

### Option 1: Local Development

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd snapconvert
   npm install
   ```

2. **Set up environment variables**
   ```bash
   # Copy environment files
   cp env.example .env
   cp backend/env.example backend/.env
   cp frontend/env.example frontend/.env
   ```

3. **Install system dependencies** (Ubuntu/Debian)
   ```bash
   sudo apt-get update
   sudo apt-get install libreoffice poppler-utils
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

### Option 2: Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

   This will start the application at http://localhost:3001

## Usage

1. **Upload Files**: Drag and drop files onto the upload area or click to select
2. **Choose Format**: Select your desired output format from the available options
3. **Convert**: Click the convert button to process your files
4. **Download**: Download the converted files individually or all at once

## API Endpoints

- `POST /api/convert` - Convert files
- `GET /api/download/:id` - Download converted file
- `GET /api/health` - Health check

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Backend port | `3001` |
| `MAX_FILE_SIZE_MB` | Maximum file size | `50` |
| `TMP_DIR` | Temporary directory | `tmp` |
| `CLEANUP_MAX_AGE_MINUTES` | File cleanup age | `30` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |

## File Size Limits

- Maximum file size: 50MB per file (configurable)
- Maximum files per request: 10
- Supported formats: DOCX, XLSX, PPTX, TXT, PDF, JPEG, PNG, WebP, TIFF, GIF, BMP

## Security Features

- File type validation (MIME type checking)
- File size limits
- Filename sanitization
- Rate limiting (100 requests per 15 minutes per IP)
- Automatic cleanup of temporary files
- CORS protection

## Troubleshooting

### LibreOffice Not Found
```bash
# Ubuntu/Debian
sudo apt-get install libreoffice

# macOS
brew install --cask libreoffice

# Windows
# Download from https://www.libreoffice.org/
```

### Poppler Not Found
```bash
# Ubuntu/Debian
sudo apt-get install poppler-utils

# macOS
brew install poppler

# Windows
# Download from https://poppler.freedesktop.org/
```

### Permission Issues
```bash
# Ensure temp directory is writable
chmod 755 tmp/
```

### Memory Issues
- Reduce `MAX_FILE_SIZE_MB` in environment variables
- Increase Docker memory limits if using containers
- Monitor system resources during conversion

## Development

### Project Structure
```
snapconvert/
├── frontend/          # React frontend
├── backend/           # Node.js backend
├── samples/           # Test files
├── docker-compose.yml # Docker configuration
├── Dockerfile         # Multi-stage build
└── README.md
```

### Available Scripts

- `npm run dev` - Start development servers
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run docker:up` - Start with Docker
- `npm run docker:down` - Stop Docker containers

### Testing

```bash
# Run backend tests
cd backend && npm test

# Run frontend tests  
cd frontend && npm test
```

## Deployment

### VPS Deployment

1. **Prepare server**
   ```bash
   # Install system dependencies
   sudo apt-get update
   sudo apt-get install nodejs npm docker.io docker-compose
   sudo apt-get install libreoffice poppler-utils
   ```

2. **Deploy application**
   ```bash
   git clone <repository-url>
   cd snapconvert
   cp env.example .env
   # Edit .env with production values
   docker-compose up -d
   ```

3. **Configure reverse proxy** (Nginx example)
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

### Frontend Deployment (Vercel/Netlify)

1. **Build frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   npx vercel --prod
   ```

3. **Update API URL** in production environment variables

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:
- Check the troubleshooting section above
- Review the logs for error messages
- Ensure all system dependencies are installed
- Verify file formats are supported
