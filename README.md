# Document Extraction App

## Problem Statement

The Gallup Customer Intelligence team frequently works with document data extraction workflows. This case study demonstrates the ability to build a full-stack document extraction application that can:

- Process sales invoices using AI/LLM technology
- Extract structured data from unstructured documents
- Present data in a clean, user-friendly interface
- Support real-time document processing
- Scale to handle production workloads

The application mimics real-world scenarios where businesses need to digitize and process large volumes of invoices, receipts, and other business documents efficiently.

## Solution Overview

This project implements a modern full-stack document extraction solution with the following architecture:

### Frontend (Next.js 15)
- **React/Next.js** with TypeScript for type safety
- **Tailwind CSS** with shadcn/ui components for modern UI
- **Zustand** for state management
- **Real-time processing** with progress indicators

### Backend (Flask/Python)
- **Flask** RESTful API with structured endpoints
- **OpenAI GPT-4** for intelligent document processing
- **PIL/Pillow** for image processing
- **Pandas** for data manipulation and CSV export
- **Clean Architecture** with domain-driven design

### Key Features
- 📄 **Multi-format Document Upload** (PDF, PNG, JPG, JPEG)
- 🤖 **AI-Powered Data Extraction** using OpenAI GPT-4
- 📊 **Structured Data Display** with editable fields
- 💾 **Database Management** with CSV export/import
- 📈 **Analytics Dashboard** with statistics and insights
- 🔄 **Real-time Processing** with progress tracking
- 🎯 **Confidence Scoring** for extraction accuracy

## Project Structure

```
challenge/
├── document-extractor/          # Next.js Frontend
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   │   ├── page.tsx         # Dashboard
│   │   │   ├── upload/          # Upload interface
│   │   │   ├── view/            # Invoice viewer/editor
│   │   │   ├── manage/          # Database management
│   │   │   └── analytics/       # Statistics dashboard
│   │   ├── components/          # Reusable UI components
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   └── layout/          # Layout components
│   │   ├── features/            # Feature-specific components
│   │   │   ├── upload/          # Upload functionality
│   │   │   ├── view/            # Invoice viewing/editing
│   │   │   ├── manage/          # Data management
│   │   │   └── analytics/       # Analytics features
│   │   ├── stores/              # Zustand state stores
│   │   ├── types/               # TypeScript definitions
│   │   └── lib/                 # Utilities and API client
│   └── public/                  # Static assets
├── document-extractor-api/      # Flask Backend
│   ├── app/
│   │   ├── core/                # Core configuration
│   │   ├── domain/              # Business logic
│   │   │   ├── models/          # Data models
│   │   │   └── services/        # Business services
│   │   ├── infrastructure/      # External integrations
│   │   │   ├── ai/              # OpenAI integration
│   │   │   └── data/            # Data access layer
│   │   └── presentation/        # API endpoints
│   │       └── api/
│   ├── data/                    # CSV database files
│   ├── uploads/                 # Uploaded documents
│   └── logs/                    # Application logs
└── sample-invoices/             # Test invoice samples
```

## Features in Detail

### 1. Document Upload & Processing
- **Multi-format Support**: Upload PDF, PNG, JPG, JPEG files
- **Drag & Drop Interface**: Intuitive file upload with preview
- **Progress Tracking**: Real-time upload and processing status
- **Validation**: Client and server-side file validation
- **Batch Processing**: Support for multiple document uploads

### 2. AI-Powered Extraction
- **OpenAI Integration**: Uses GPT-4 for intelligent data extraction
- **Structured Output**: Extracts invoice data into predefined schema
- **Confidence Scoring**: Provides accuracy metrics for extracted data
- **Error Handling**: Robust error handling with retry mechanisms
- **Template Flexibility**: Handles various invoice formats and layouts

### 3. Data Visualization & Management
- **Invoice Viewer**: Clean display of extracted invoice data
- **Inline Editing**: Edit extracted fields directly in the UI
- **Search & Filter**: Find invoices by various criteria
- **Sorting**: Sort by date, amount, customer, etc.
- **Export Options**: Export data to CSV format

### 4. Analytics Dashboard
- **Key Metrics**: Total invoices, items, amounts processed
- **Data Insights**: Processing statistics and trends
- **File Management**: Track CSV database status
- **Performance Monitoring**: Processing times and success rates

### 5. Database Integration
- **CSV-Based Storage**: Uses Excel/CSV files as data persistence
- **Dual Table Structure**: 
  - `invoices.csv`: Header-level invoice data
  - `invoice_details.csv`: Line item details
- **Data Consistency**: Maintains referential integrity
- **Backup & Restore**: Database backup functionality

## Technology Stack

### Frontend Technologies
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type safety and better developer experience
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality component library
- **Zustand**: Lightweight state management
- **Lucide Icons**: Modern icon library

### Backend Technologies
- **Flask**: Python web framework
- **OpenAI API**: GPT-4 for document processing
- **Pillow (PIL)**: Image processing library
- **Pandas**: Data manipulation and analysis
- **CORS**: Cross-origin resource sharing
- **UUID**: Unique identifier generation

### Development Tools
- **ESLint**: Code linting and quality
- **TypeScript**: Static type checking
- **Turbopack**: Fast bundling (Next.js 15)
- **Git**: Version control

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- OpenAI API key

### Frontend Setup
```bash
cd document-extractor
npm install
npm run dev
```

### Backend Setup
```bash
cd document-extractor-api
pip install -r requirements.txt
# Create .env file with OPENAI_API_KEY
python run.py
```

### Environment Configuration
Create `.env` files in both directories:

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

**Backend (.env):**
```
OPENAI_API_KEY=your_openai_api_key_here
FLASK_ENV=development
```

## API Endpoints

### Upload Endpoints
- `POST /api/v1/upload` - Upload document file
- `POST /api/v1/upload/validate` - Validate file before upload
- `GET /api/v1/upload/status/{document_id}` - Get upload status

### Extraction Endpoints
- `POST /api/v1/extract/{document_id}` - Extract data from document
- `POST /api/v1/extract/batch` - Batch extract multiple documents
- `GET /api/v1/extract/status/{extraction_id}` - Get extraction status

### Invoice Management
- `GET /api/v1/invoices` - List invoices with pagination/search
- `GET /api/v1/invoices/{invoice_id}` - Get specific invoice
- `PUT /api/v1/invoices/{invoice_id}` - Update invoice data
- `DELETE /api/v1/invoices/{invoice_id}` - Delete invoice
- `GET /api/v1/invoices/statistics` - Get processing statistics
- `POST /api/v1/invoices/export` - Export to CSV
- `POST /api/v1/invoices/backup` - Backup database

### Health Check
- `GET /health` - API health status

## Usage Workflow

### 1. Upload Documents
1. Navigate to the Upload page
2. Drag & drop or select invoice files
3. Watch real-time upload progress
4. Automatic extraction begins after upload

### 2. Review Extracted Data
1. View extracted invoice information
2. Check confidence scores
3. Edit any incorrect fields
4. Save changes to database

### 3. Manage Database
1. Search and filter invoices
2. Sort by various criteria
3. Export data to CSV
4. Backup database files

### 4. Analytics Insights
1. View processing statistics
2. Monitor extraction accuracy
3. Track database growth
4. Performance metrics

## Sample Data Structure

### Invoice Schema
```typescript
interface Invoice {
  id?: string;
  invoice_number: string;
  invoice_date: string;
  customer_name: string;
  billing_address: Address;
  shipping_address: Address;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  extraction_confidence?: number;
}
```

### Line Item Schema
```typescript
interface InvoiceItem {
  item_number: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}
```

## Scaling Strategies

### 1. Performance Optimization
- **Caching**: Implement Redis for API response caching
- **CDN**: Use CloudFront for static asset delivery
- **Database**: Migrate from CSV to PostgreSQL/MongoDB
- **Queue System**: Add Redis/Celery for background processing

### 2. Infrastructure Scaling
- **Containerization**: Docker containers for easy deployment
- **Load Balancing**: Multiple API instances behind load balancer
- **Auto-scaling**: Kubernetes for automatic scaling
- **Monitoring**: Implement Prometheus/Grafana monitoring

### 3. Feature Enhancements
- **Multi-document Types**: Support receipts, purchase orders, etc.
- **OCR Integration**: Add Tesseract for scanned documents
- **Machine Learning**: Custom models for specific document types
- **Real-time Collaboration**: Multi-user editing capabilities

### 4. Security & Compliance
- **Authentication**: JWT-based user authentication
- **Authorization**: Role-based access control
- **Encryption**: End-to-end data encryption
- **Audit Logging**: Comprehensive audit trails
- **GDPR Compliance**: Data protection and privacy controls

## Testing Strategy

### Frontend Testing
- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Cypress for E2E testing
- **Type Checking**: TypeScript strict mode
- **Linting**: ESLint with strict rules

### Backend Testing
- **Unit Tests**: pytest for service layer testing
- **API Tests**: pytest + requests for endpoint testing
- **Mock Testing**: Mock OpenAI API for consistent testing
- **Load Testing**: Locust for performance testing

## Deployment Options

### Development
- **Local**: npm run dev + python run.py
- **Docker**: docker-compose for full stack

### Production
- **Frontend**: Vercel/Netlify for Next.js deployment
- **Backend**: AWS ECS/Fargate or Google Cloud Run
- **Database**: AWS RDS PostgreSQL or MongoDB Atlas
- **Storage**: AWS S3 for document storage

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## License

This project is created for the Gallup case study assessment and is not licensed for public distribution.

---

**Built with ❤️ for Gallup Customer Intelligence Team**