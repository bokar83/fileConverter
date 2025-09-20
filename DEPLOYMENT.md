# SnapConvert Deployment Guide

This guide covers different deployment options for SnapConvert.

## Local Development

### Prerequisites
- Node.js 18+
- LibreOffice
- Poppler utils

### Quick Start
```bash
# Run setup script
./scripts/setup.sh  # Linux/macOS
# or
scripts\setup.bat   # Windows

# Start development servers
npm run dev
```

## Docker Deployment

### Single Container
```bash
# Build and run
docker-compose up --build

# Access at http://localhost:3001
```

### Production Docker
```bash
# Build production image
docker build -t snapconvert:latest .

# Run with environment variables
docker run -d \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e MAX_FILE_SIZE_MB=50 \
  -v snapconvert_tmp:/app/tmp \
  snapconvert:latest
```

## VPS Deployment

### 1. Server Setup (Ubuntu/Debian)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install system dependencies
sudo apt-get install -y libreoffice poppler-utils

# Install Docker (optional)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### 2. Application Deployment
```bash
# Clone repository
git clone <your-repo-url>
cd snapconvert

# Install dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Build application
npm run build

# Set up environment
cp env.example .env
# Edit .env with production values

# Start with PM2 (recommended)
npm install -g pm2
pm2 start backend/dist/index.js --name snapconvert-backend
pm2 startup
pm2 save
```

### 3. Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # File upload size
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### 4. SSL with Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Frontend Deployment (Separate)

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod

# Set environment variables in Vercel dashboard
VITE_API_URL=https://your-backend-domain.com/api
```

### Netlify Deployment
```bash
# Build frontend
cd frontend
npm run build

# Deploy to Netlify
npx netlify deploy --prod --dir=dist

# Set environment variables in Netlify dashboard
VITE_API_URL=https://your-backend-domain.com/api
```

## Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-domain.com
MAX_FILE_SIZE_MB=50
TMP_DIR=/app/tmp
CLEANUP_MAX_AGE_MINUTES=30
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-domain.com/api
```

## Monitoring & Maintenance

### Health Checks
```bash
# Check application health
curl http://localhost:3001/api/health

# Check system resources
htop
df -h
```

### Logs
```bash
# PM2 logs
pm2 logs snapconvert-backend

# Docker logs
docker-compose logs -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Backup Strategy
```bash
# Backup application data
tar -czf snapconvert-backup-$(date +%Y%m%d).tar.gz \
  /path/to/snapconvert/tmp \
  /path/to/snapconvert/.env

# Automated backup script
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /backups/snapconvert-$DATE.tar.gz /path/to/snapconvert/tmp
find /backups -name "snapconvert-*.tar.gz" -mtime +7 -delete
```

## Scaling Considerations

### Horizontal Scaling
- Use Redis for shared storage instead of in-memory
- Load balancer for multiple backend instances
- CDN for static assets

### Performance Optimization
- Increase file size limits if needed
- Optimize image conversion quality
- Implement caching for repeated conversions
- Use background job queue for large files

### Security Hardening
- Regular security updates
- Firewall configuration
- Rate limiting
- Input validation
- File type restrictions

## Troubleshooting

### Common Issues

1. **LibreOffice not found**
   ```bash
   sudo apt-get install libreoffice
   ```

2. **Poppler not found**
   ```bash
   sudo apt-get install poppler-utils
   ```

3. **Permission denied**
   ```bash
   sudo chown -R $USER:$USER /path/to/snapconvert
   chmod 755 /path/to/snapconvert/tmp
   ```

4. **Out of memory**
   - Reduce MAX_FILE_SIZE_MB
   - Increase server RAM
   - Optimize conversion settings

5. **Port already in use**
   ```bash
   sudo lsof -i :3001
   sudo kill -9 <PID>
   ```

### Performance Monitoring
```bash
# Monitor system resources
htop
iotop
nethogs

# Monitor application
pm2 monit
docker stats
```

## Production Checklist

- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Monitoring set up
- [ ] Backup strategy implemented
- [ ] Log rotation configured
- [ ] Health checks working
- [ ] Performance tested
- [ ] Security scan completed
- [ ] Documentation updated



