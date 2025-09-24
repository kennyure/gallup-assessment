# Running Instructions - Document Extractor

This document provides step-by-step instructions to run both the backend API and frontend application, and test the functionality.

## Prerequisites

- **Python 3.8+** (for backend)
- **Node.js 18+** (for frontend)
- **OpenAI API Key** (required for document extraction)

## Backend Setup (Flask API)

### 1. Navigate to Backend Directory
```bash
cd document-extractor-api
```

### 2. Create Virtual Environment
```bash
python3 -m venv venv
```

### 3. Activate Virtual Environment
```bash
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Environment Configuration
Ensure the `.env` file exists with your OpenAI API key:
```bash
# Check if .env exists
cat .env

# The file should contain:
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-2024-11-20
# ... other configuration
```

### 6. Run the Backend Server
```bash
python run.py
```

The backend will start on `http://localhost:5001`

**Expected Output:**
```
Starting Document Extractor API on 0.0.0.0:5001
Debug mode: True
 * Serving Flask app 'app'
 * Debug mode: on
```

## Frontend Setup (Next.js)

### 1. Navigate to Frontend Directory
```bash
cd document-extractor
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

**Expected Output:**
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Ready in 2.3s
```

## Testing the Functionality

### 1. Access the Application
Open your browser and navigate to `http://localhost:3000`

### 2. Upload and Extract Documents

#### Upload a Document:
1. Go to the **Upload** page
2. Click "Choose file" or drag & drop a document
3. Supported formats: JPG, JPEG, PNG, PDF
4. Click "Upload Document"
5. Wait for upload confirmation

#### Extract Invoice Data:
1. After upload, click "Extract Data"
2. Wait for AI processing (may take 10-30 seconds)
3. View extracted data in the results panel
4. Data is automatically saved to CSV files

### 3. Manage Invoices

#### View All Invoices:
1. Go to the **Manage** page
2. Browse the list of processed invoices
3. Use search functionality to find specific invoices
4. View statistics and totals

#### Edit Invoice Data:
1. From the Manage page, click on an invoice
2. This takes you to the View page
3. Click the "Edit Invoice" button
4. Modify any fields (customer info, line items, totals)
5. Add/remove line items using + and trash icons
6. Click "Save Changes" to persist edits
7. Click "Cancel" to discard changes

### 4. View Invoice Details
1. Go to the **View** page
2. Select an invoice from the Manage page, or
3. Use direct URL with invoice ID: `http://localhost:3000/view?invoice=INVOICE_ID`
4. View comprehensive invoice details
5. Access edit functionality from this page

### 5. Analytics Dashboard
1. Go to the **Analytics** page
2. View processing statistics
3. Monitor invoice trends and totals
4. Export data if needed

## API Testing (Optional)

### Test Backend Endpoints Directly:

#### Health Check:
```bash
curl http://localhost:5001/health
```

#### Upload File:
```bash
curl -X POST -F "file=@/path/to/invoice.png" http://localhost:5001/api/v1/upload
```

#### Get All Invoices:
```bash
curl http://localhost:5001/api/v1/invoices
```

#### Extract Document:
```bash
curl -X POST http://localhost:5001/api/v1/extract/DOCUMENT_ID
```

## Troubleshooting

### Backend Issues:

**Port Already in Use:**
```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9
```

**Missing OpenAI API Key:**
- Check `.env` file exists
- Verify API key is valid and has credits
- Ensure no extra spaces in the key

**Package Installation Errors:**
```bash
# Upgrade pip first
pip install --upgrade pip
# Reinstall requirements
pip install -r requirements.txt --force-reinstall
```

### Frontend Issues:

**Port Already in Use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Node Modules Issues:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**API Connection Issues:**
- Ensure backend is running on port 5001
- Check browser console for CORS errors
- Verify no firewall blocking requests

### Common Issues:

**File Upload Fails:**
- Check file size (max 16MB)
- Verify file format is supported
- Ensure uploads directory exists and is writable

**Extraction Takes Too Long:**
- Large files may take 30-60 seconds
- Check OpenAI API rate limits
- Monitor backend logs for errors

**Edit Functionality Not Working:**
- Ensure both frontend and backend are running
- Check browser console for JavaScript errors
- Verify API endpoints are accessible

## File Structure

```
challenge/
├── document-extractor-api/          # Backend (Flask)
│   ├── app/                        # Application code
│   ├── data/                       # CSV storage
│   ├── uploads/                    # Uploaded files
│   ├── venv/                       # Virtual environment
│   ├── requirements.txt            # Python dependencies
│   └── run.py                      # Entry point
├── document-extractor/             # Frontend (Next.js)
│   ├── src/                        # Source code
│   ├── public/                     # Static assets
│   ├── package.json                # Node dependencies
│   └── next.config.ts              # Next.js config
└── RUNNING_INSTRUCTIONS.md         # This file
```

## Development Notes

- Backend runs in debug mode with auto-reload
- Frontend runs in development mode with hot reload
- CSV files are stored in `document-extractor-api/data/`
- Uploaded files are stored in `document-extractor-api/uploads/`
- Logs are available in `document-extractor-api/logs/`

## Production Deployment

For production deployment:

1. Set `FLASK_ENV=production` in backend `.env`
2. Use `npm run build` for frontend
3. Configure proper CORS origins
4. Set up reverse proxy (nginx)
5. Use proper secret keys and API keys
6. Set up database instead of CSV files
7. Configure file storage (AWS S3, etc.)

## Support

If you encounter issues:

1. Check the logs in `document-extractor-api/logs/`
2. Monitor browser console for frontend errors
3. Verify all dependencies are correctly installed
4. Ensure OpenAI API key is valid and has sufficient credits
5. Check network connectivity between frontend and backend