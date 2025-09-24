# Document Extraction App - Tech Stack & Setup Guide

## Project Overview
A full-stack document extraction application that uses AI to extract structured data from invoices and other business documents.

## 🛠️ Tech Stack (Latest 2025)

### Frontend
- **Next.js 15** (App Router with Turbopack)
- **React 19** (with React Compiler)
- **TypeScript 5.6+**
- **Tailwind CSS 4.0** (with latest features)
- **shadcn/ui** (Latest component library)
- **Lucide React** (Icons)
- **React Hook Form 7.53+** (Form Management)
- **Zod 3.23+** (Schema Validation)
- **TanStack Query v5** (Server State Management)

### Backend
- **Python 3.12+** (Latest stable)
- **Flask 3.1+** (Latest stable)
- **Flask-CORS 5.0+** (Cross-Origin Resource Sharing)
- **OpenAI Python SDK 1.52+** (GPT-4o with Structured Outputs)
- **SQLAlchemy 2.0+** (Modern ORM)
- **PostgreSQL 16+/SQLite 3.45+** (Database)
- **Pydantic 2.9+** (Data Validation & Settings)
- **python-multipart** (File Upload Support)

### AI/ML Services
- **OpenAI GPT-4o-2024-11-20** (Latest model with Structured Outputs)
- **OpenAI Vision API** (Document/image processing)

### Development Tools
- **ESLint 9+ & Prettier** (Frontend Linting/Formatting)
- **Biome** (Fast alternative linter/formatter)
- **Black & Ruff** (Python Formatting & Linting)
- **Docker** (Containerization)
- **Vercel** (Frontend Deployment)

## 📋 Data Schema Structure

Based on the invoice structure and requirements, the extracted data should match SalesOrderHeader and SalesOrderDetail:

### SalesOrderHeader Schema
```typescript
interface SalesOrderHeader {
  invoiceId: string;
  invoiceNumber: string;
  invoiceDate: string;
  customerId: string;
  customerName: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone?: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone?: string;
  };
  salesperson?: string;
  poNumber?: string;
  shipDate?: string;
  shipVia?: string;
  fob?: string;
  terms?: string;
  subtotal: number;
  taxRate: number;
  tax: number;
  other?: number;
  total: number;
}
```

### SalesOrderDetail Schema
```typescript
interface SalesOrderDetail {
  id: string;
  invoiceId: string; // Foreign key to SalesOrderHeader
  itemNumber: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}
```

## 🚀 Setup Instructions (Official Methods)

### Prerequisites
- **Node.js 18.18+** (LTS recommended)
- **Python 3.12+**
- **OpenAI API Key**

### Frontend Setup (Next.js 15 + shadcn/ui)

1. **Create Next.js 15 App (Latest)**
```bash
# Using the latest create-next-app with all modern defaults
pnpm create next-app@latest document-extractor --yes
cd document-extractor
```

> The `--yes` flag uses the latest defaults: TypeScript, Tailwind, App Router, Turbopack, and `@/*` import alias.

2. **Initialize shadcn/ui (Latest)**
```bash
# Initialize with the latest shadcn CLI
pnpm dlx shadcn@latest init
```

> shadcn will auto-detect Next.js 15 and configure accordingly.

3. **Add shadcn/ui Components**
```bash
# Add essential components for the app
pnpm dlx shadcn@latest add button card input label table form toast dialog tabs badge alert skeleton progress
```

4. **Install Additional Dependencies**
```bash
pnpm add react-hook-form @hookform/resolvers zod@latest
pnpm add @tanstack/react-query@latest axios
pnpm add react-dropzone
pnpm add class-variance-authority clsx tailwind-merge
```

### Backend Setup (Flask 3.1+ + OpenAI)

1. **Create Project & Virtual Environment**
```bash
cd ..
mkdir document-extractor-api
cd document-extractor-api

# Use Python 3.12+
python3.12 -m venv venv
source venv/bin/activate  # On macOS/Linux
```

2. **Install Latest Dependencies**
```bash
# Core Flask dependencies
pip install flask[async]==3.1.* flask-cors==5.0.*

# AI & Data Processing
pip install openai==1.52.* pydantic==2.9.*

# Database & File Handling
pip install sqlalchemy==2.0.* python-multipart python-dotenv

# Development & Quality
pip install ruff black pytest

# Image processing (if needed)
pip install pillow
```

### Backend Dependencies (Simplified)
```txt
# Core Framework
flask[async]==3.1.*
flask-cors==5.0.*

# AI Integration
openai==1.52.*
pydantic==2.9.*

# Data Processing (CSV/Excel)
pandas==2.2.*
openpyxl==3.1.*

# File & Environment Handling
python-multipart
python-dotenv
pillow

# Development Tools
ruff
black
pytest
```

## 📁 Clean Architecture Structure

### Frontend Structure (Next.js 15 + Domain-Driven Design)
```
document-extractor/
├── src/
│   ├── app/                          # Next.js 15 App Router
│   │   ├── (dashboard)/              # Route groups
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   └── loading.tsx
│   │   │   └── layout.tsx
│   │   ├── api/                      # API routes
│   │   │   ├── upload/
│   │   │   │   └── route.ts
│   │   │   └── extract/
│   │   │       └── route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home page
│   │   ├── loading.tsx               # Global loading
│   │   └── error.tsx                 # Global error
│   ├── components/                   # Reusable components
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── features/                 # Feature-specific components
│   │   │   ├── document-upload/
│   │   │   │   ├── upload-zone.tsx
│   │   │   │   ├── upload-progress.tsx
│   │   │   │   └── upload-status.tsx
│   │   │   ├── data-extraction/
│   │   │   │   ├── extraction-table.tsx
│   │   │   │   ├── field-editor.tsx
│   │   │   │   └── validation-panel.tsx
│   │   │   └── invoice-management/
│   │   │       ├── invoice-list.tsx
│   │   │       ├── invoice-detail.tsx
│   │   │       └── invoice-actions.tsx
│   │   ├── layout/                   # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── footer.tsx
│   │   └── common/                   # Common components
│   │       ├── loading-spinner.tsx
│   │       ├── error-boundary.tsx
│   │       └── confirmation-dialog.tsx
│   ├── lib/                          # Utilities & configurations
│   │   ├── api/                      # API layer
│   │   │   ├── client.ts             # Base API client
│   │   │   ├── queries/              # TanStack Query hooks
│   │   │   │   ├── upload.ts
│   │   │   │   ├── extraction.ts
│   │   │   │   └── invoices.ts
│   │   │   └── types.ts              # API types
│   │   ├── schemas/                  # Zod validation schemas
│   │   │   ├── invoice.ts
│   │   │   ├── upload.ts
│   │   │   └── user-input.ts
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── use-file-upload.ts
│   │   │   ├── use-extraction.ts
│   │   │   └── use-local-storage.ts
│   │   ├── constants.ts              # App constants
│   │   ├── utils.ts                  # Utility functions
│   │   └── env.ts                    # Environment validation
│   ├── types/                        # TypeScript type definitions
│   │   ├── invoice.ts
│   │   ├── api.ts
│   │   └── global.ts
│   └── styles/                       # Global styles
│       └── globals.css
├── public/                           # Static assets
│   ├── icons/
│   ├── images/
│   └── sample-invoices/
├── components.json                   # shadcn/ui config
├── tailwind.config.ts               # Tailwind configuration
├── next.config.ts                   # Next.js configuration
├── tsconfig.json                    # TypeScript configuration
├── eslint.config.mjs                # ESLint configuration
└── package.json
```

### Backend Structure (Flask + CSV Data)
```
document-extractor-api/
├── app/
│   ├── __init__.py                   # Flask app factory
│   ├── core/                         # Core business logic
│   │   ├── __init__.py
│   │   ├── config.py                 # Configuration management
│   │   ├── exceptions.py             # Custom exceptions
│   │   └── logging.py                # Logging configuration
│   ├── domain/                       # Domain models & business logic
│   │   ├── __init__.py
│   │   ├── models/                   # Domain models (Pydantic)
│   │   │   ├── __init__.py
│   │   │   ├── invoice.py
│   │   │   ├── document.py
│   │   │   └── extraction_result.py
│   │   └── services/                 # Business logic services
│   │       ├── __init__.py
│   │       ├── extraction_service.py
│   │       ├── validation_service.py
│   │       └── csv_service.py        # CSV data management
│   ├── infrastructure/               # External services & data
│   │   ├── __init__.py
│   │   ├── data/                     # Data management
│   │   │   ├── __init__.py
│   │   │   ├── csv_manager.py        # CSV operations
│   │   │   ├── excel_reader.py       # Excel file handling
│   │   │   └── file_storage.py       # File operations
│   │   ├── ai/                       # AI service integrations
│   │   │   ├── __init__.py
│   │   │   ├── openai_client.py
│   │   │   ├── prompt_templates.py
│   │   │   └── response_parsers.py
│   │   └── external/                 # External API clients
│   │       ├── __init__.py
│   │       └── notification_client.py
│   ├── presentation/                 # API layer
│   │   ├── __init__.py
│   │   ├── api/                      # API blueprints
│   │   │   ├── __init__.py
│   │   │   ├── v1/                   # API version 1
│   │   │   │   ├── __init__.py
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── __init__.py
│   │   │   │   │   ├── upload.py
│   │   │   │   │   ├── extraction.py
│   │   │   │   │   └── invoices.py
│   │   │   │   ├── schemas/          # Pydantic request/response models
│   │   │   │   │   ├── __init__.py
│   │   │   │   │   ├── upload_schemas.py
│   │   │   │   │   ├── extraction_schemas.py
│   │   │   │   │   └── invoice_schemas.py
│   │   │   │   └── middleware/       # API middleware
│   │   │   │       ├── __init__.py
│   │   │   │       ├── cors.py
│   │   │   │       └── error_handlers.py
│   │   │   └── utils/                # API utilities
│   │   │       ├── __init__.py
│   │   │       ├── validators.py
│   │   │       └── response_helpers.py
│   │   └── cli/                      # Command line interface
│   │       ├── __init__.py
│   │       └── commands.py
│   └── tests/                        # Test suite
│       ├── __init__.py
│       ├── unit/                     # Unit tests
│       ├── integration/              # Integration tests
│       └── fixtures/                 # Test fixtures & sample data
│           ├── sample_invoices/
│           └── test_data.csv
├── data/                             # CSV data storage
│   ├── Case Study Data.xlsx          # Original Excel file
│   ├── invoices.csv                  # Processed invoices
│   └── invoice_details.csv           # Invoice line items
├── uploads/                          # Temporary file storage
├── logs/                            # Application logs
├── .env                             # Environment variables
├── .env.example                     # Environment template
├── requirements.txt                 # Python dependencies
├── pyproject.toml                   # Python project configuration
└── run.py                           # Application entry point
```

## 🔧 OpenAI Integration with Structured Outputs (Latest)

### Python Schema Definition (Pydantic 2.9+)
```python
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal
from datetime import datetime
from decimal import Decimal

class Address(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    
    street: str = Field(description="Street address")
    city: str = Field(description="City name")
    state: str = Field(description="State or province")
    zip_code: str = Field(description="ZIP or postal code")
    phone: Optional[str] = Field(default=None, description="Phone number")

class InvoiceItem(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, use_enum_values=True)
    
    item_number: str = Field(description="Product or service item number")
    description: str = Field(description="Item description")
    quantity: int = Field(gt=0, description="Quantity ordered")
    unit_price: Decimal = Field(ge=0, description="Price per unit")
    total: Decimal = Field(ge=0, description="Line item total")

class InvoiceData(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, use_enum_values=True)
    
    # Required fields
    invoice_number: str = Field(description="Unique invoice number")
    invoice_date: datetime = Field(description="Invoice date")
    customer_name: str = Field(description="Customer company name")
    billing_address: Address = Field(description="Billing address")
    shipping_address: Address = Field(description="Shipping address")
    items: List[InvoiceItem] = Field(min_length=1, description="Invoice line items")
    
    # Financial fields
    subtotal: Decimal = Field(ge=0, description="Subtotal before tax")
    tax_rate: Decimal = Field(ge=0, le=1, description="Tax rate (0-1)")
    tax: Decimal = Field(ge=0, description="Tax amount")
    total: Decimal = Field(ge=0, description="Total amount due")
    
    # Optional fields
    salesperson: Optional[str] = Field(default=None, description="Salesperson name")
    po_number: Optional[str] = Field(default=None, description="Purchase order number")
    terms: Optional[str] = Field(default=None, description="Payment terms")
    ship_date: Optional[datetime] = Field(default=None, description="Ship date")
    ship_via: Optional[str] = Field(default=None, description="Shipping method")
    fob: Optional[str] = Field(default=None, description="Free on board terms")
```

### OpenAI API Usage (Latest SDK)
```python
import asyncio
from openai import AsyncOpenAI
import base64
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class DocumentExtractionService:
    def __init__(self, api_key: str, model: str = "gpt-4o-2024-11-20"):
        self.client = AsyncOpenAI(api_key=api_key)
        self.model = model

    async def extract_invoice_data(self, image_path: Path) -> InvoiceData:
        """Extract structured data from invoice image using GPT-4o Vision."""
        try:
            # Read and encode image
            image_data = base64.b64encode(image_path.read_bytes()).decode('utf-8')
            
            response = await self.client.beta.chat.completions.parse(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": """You are an expert invoice data extraction system. 
                        Analyze the provided invoice image and extract all relevant structured data.
                        Pay close attention to:
                        - Invoice numbers and dates
                        - Customer and billing information
                        - Individual line items with quantities and prices
                        - Tax calculations and totals
                        - Any additional terms or references
                        
                        Ensure all monetary values are accurate and properly calculated."""
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "Please extract all structured data from this invoice image."
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_data}",
                                    "detail": "high"  # High detail for better accuracy
                                }
                            }
                        ]
                    }
                ],
                response_format=InvoiceData,
                temperature=0.1,  # Low temperature for consistent extraction
                max_tokens=4000
            )
            
            extracted_data = response.choices[0].message.parsed
            
            if extracted_data is None:
                raise ValueError("Failed to parse invoice data from response")
            
            logger.info(f"Successfully extracted data for invoice: {extracted_data.invoice_number}")
            return extracted_data
            
        except Exception as e:
            logger.error(f"Failed to extract invoice data: {str(e)}")
            raise

    async def validate_extraction(self, data: InvoiceData) -> dict:
        """Validate extracted data for consistency and accuracy."""
        validation_results = {
            "is_valid": True,
            "warnings": [],
            "errors": []
        }
        
        # Validate financial calculations
        calculated_subtotal = sum(item.total for item in data.items)
        if abs(calculated_subtotal - data.subtotal) > 0.01:
            validation_results["warnings"].append(
                f"Subtotal mismatch: calculated {calculated_subtotal}, extracted {data.subtotal}"
            )
        
        calculated_tax = data.subtotal * data.tax_rate
        if abs(calculated_tax - data.tax) > 0.01:
            validation_results["warnings"].append(
                f"Tax calculation mismatch: calculated {calculated_tax}, extracted {data.tax}"
            )
        
        calculated_total = data.subtotal + data.tax
        if abs(calculated_total - data.total) > 0.01:
            validation_results["errors"].append(
                f"Total mismatch: calculated {calculated_total}, extracted {data.total}"
            )
            validation_results["is_valid"] = False
        
        return validation_results
```

## � Data Storage (Simple CSV/Excel Approach)

### Working with the Provided Excel Data
```python
import pandas as pd
import json
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime

class CSVDataManager:
    """Simple data manager using CSV files instead of database."""
    
    def __init__(self, data_file_path: str):
        self.data_file = Path(data_file_path)
        self.invoices_csv = self.data_file.parent / "invoices.csv"
        self.invoice_details_csv = self.data_file.parent / "invoice_details.csv"
        
    def load_existing_data(self) -> Dict:
        """Load existing invoice data from CSV files."""
        invoices = []
        details = []
        
        # Load invoices if file exists
        if self.invoices_csv.exists():
            invoices_df = pd.read_csv(self.invoices_csv)
            invoices = invoices_df.to_dict('records')
        
        # Load details if file exists
        if self.invoice_details_csv.exists():
            details_df = pd.read_csv(self.invoice_details_csv)
            details = details_df.to_dict('records')
            
        return {"invoices": invoices, "details": details}
    
    def save_extracted_invoice(self, invoice_data: 'InvoiceData') -> str:
        """Save extracted invoice data to CSV files."""
        
        # Prepare invoice header data
        invoice_id = f"INV_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        header_data = {
            'id': invoice_id,
            'invoice_number': invoice_data.invoice_number,
            'invoice_date': invoice_data.invoice_date.isoformat(),
            'customer_name': invoice_data.customer_name,
            'billing_street': invoice_data.billing_address.street,
            'billing_city': invoice_data.billing_address.city,
            'billing_state': invoice_data.billing_address.state,
            'billing_zip': invoice_data.billing_address.zip_code,
            'billing_phone': invoice_data.billing_address.phone,
            'shipping_street': invoice_data.shipping_address.street,
            'shipping_city': invoice_data.shipping_address.city,
            'shipping_state': invoice_data.shipping_address.state,
            'shipping_zip': invoice_data.shipping_address.zip_code,
            'shipping_phone': invoice_data.shipping_address.phone,
            'subtotal': float(invoice_data.subtotal),
            'tax_rate': float(invoice_data.tax_rate),
            'tax_amount': float(invoice_data.tax),
            'total_amount': float(invoice_data.total),
            'salesperson': invoice_data.salesperson,
            'po_number': invoice_data.po_number,
            'terms': invoice_data.terms,
            'created_at': datetime.now().isoformat()
        }
        
        # Prepare invoice details data
        details_data = []
        for item in invoice_data.items:
            details_data.append({
                'invoice_id': invoice_id,
                'item_number': item.item_number,
                'description': item.description,
                'quantity': item.quantity,
                'unit_price': float(item.unit_price),
                'line_total': float(item.total),
                'created_at': datetime.now().isoformat()
            })
        
        # Append to CSV files
        header_df = pd.DataFrame([header_data])
        details_df = pd.DataFrame(details_data)
        
        # Write headers
        if not self.invoices_csv.exists():
            header_df.to_csv(self.invoices_csv, index=False)
        else:
            header_df.to_csv(self.invoices_csv, mode='a', header=False, index=False)
        
        # Write details
        if not self.invoice_details_csv.exists():
            details_df.to_csv(self.invoice_details_csv, index=False)
        else:
            details_df.to_csv(self.invoice_details_csv, mode='a', header=False, index=False)
            
        return invoice_id
    
    def get_all_invoices(self) -> List[Dict]:
        """Get all invoices with their details."""
        data = self.load_existing_data()
        
        # Merge invoices with their details
        for invoice in data["invoices"]:
            invoice_details = [
                detail for detail in data["details"] 
                if detail.get("invoice_id") == invoice.get("id")
            ]
            invoice["items"] = invoice_details
            
        return data["invoices"]
    
    def update_invoice(self, invoice_id: str, updated_data: Dict) -> bool:
        """Update an existing invoice (simple implementation)."""
        # Load current data
        invoices_df = pd.read_csv(self.invoices_csv)
        
        # Update the specific invoice
        mask = invoices_df['id'] == invoice_id
        if mask.any():
            for key, value in updated_data.items():
                if key in invoices_df.columns:
                    invoices_df.loc[mask, key] = value
            
            # Save back to CSV
            invoices_df.to_csv(self.invoices_csv, index=False)
            return True
        return False
    
    def export_to_excel(self, output_path: str) -> str:
        """Export all data back to Excel format."""
        data = self.load_existing_data()
        
        with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
            pd.DataFrame(data["invoices"]).to_excel(
                writer, sheet_name='SalesOrderHeader', index=False
            )
            pd.DataFrame(data["details"]).to_excel(
                writer, sheet_name='SalesOrderDetail', index=False
            )
            
        return output_path

# Simple usage example
data_manager = CSVDataManager("./Case Study Data.xlsx")
```

## 🌐 Environment Variables

### Frontend (.env.local)
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_NAME=Document Extractor
NEXT_PUBLIC_APP_VERSION=1.0.0

# Development
NEXT_PUBLIC_ENV=development
```

### Backend (.env)
```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-2024-11-20
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.1

# Data Storage Configuration
DATA_FILE_PATH=./data/Case Study Data.xlsx
CSV_OUTPUT_DIR=./data
BACKUP_DIR=./backups

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-super-secret-key-change-in-production

# File Upload Configuration
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216  # 16MB
ALLOWED_EXTENSIONS=jpg,jpeg,png,pdf

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=%(asctime)s - %(name)s - %(levelname)s - %(message)s

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,https://your-frontend-domain.com
```

## 🚀 Running the Application (Latest)

### Development Commands

#### Backend (Flask)
```bash
cd document-extractor-api
source venv/bin/activate

# Install in development mode with hot reload
pip install -e .

# Run with Flask development server
flask --app app run --debug --host=0.0.0.0 --port=5000

# Or use the modern way
python -m flask --app app run --debug
```

#### Frontend (Next.js 15)
```bash
cd document-extractor

# Development with Turbopack (faster)
pnpm dev --turbopack

# Traditional development
pnpm dev

# Build and start production
pnpm build && pnpm start

# Lint and format
pnpm lint
pnpm format
```

## 🎯 Key Features to Implement

### Core Features
1. **Modern File Upload**
   - React Dropzone with drag & drop
   - Progress tracking and preview
   - Multiple file format support (PDF, JPG, PNG)
   - Client-side validation

2. **Real-time Processing**
   - WebSocket connections for live updates
   - Progress indicators during AI processing
   - Streaming responses from OpenAI API

3. **Advanced Data Validation**
   - Zod schemas for frontend validation
   - Pydantic models for backend validation
   - Cross-validation between extracted and calculated totals
   - Manual field editing with validation

4. **Modern UI/UX**
   - shadcn/ui components with Tailwind CSS 4.0
   - Responsive design for all device sizes
   - Dark/light mode support
   - Keyboard shortcuts and accessibility

5. **Data Management**
   - CRUD operations for invoices
   - Bulk operations and batch processing
   - Export to multiple formats (JSON, CSV, Excel)
   - Search and filtering capabilities

### Advanced Features
6. **Template Recognition**
   - AI-powered template detection
   - Custom template definitions
   - Template-specific extraction rules

7. **Quality Assurance**
   - Confidence scoring for extractions
   - Manual review workflows
   - Audit trails and version history

## 📈 Scaling Strategies (Production-Ready)

### Infrastructure Scaling
```typescript
// Performance optimizations for Next.js 15
// next.config.ts
export default {
  experimental: {
    ppr: true,              // Partial Prerendering
    turbopack: true,        // Turbopack bundler
    serverActions: {
      bodySizeLimit: '10mb'
    }
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840]
  },
  // Redis caching
  cacheHandler: './cache-handler.js',
  // Edge runtime
  runtime: 'edge'
}
```

### Database & Caching (Simplified)
1. **CSV/Excel Data Management**
   - Use pandas for fast CSV operations
   - Excel integration with openpyxl
   - Simple file-based storage with backups
   - In-memory caching for frequently accessed data

2. **Caching Strategy**
   - In-memory caching for processed results
   - CDN for static assets (Vercel Edge Network)
   - Application-level caching with TanStack Query
   - File system caching for uploaded documents

### API & Processing
3. **API Scaling**
   - Load balancing with multiple Flask instances
   - API rate limiting and throttling
   - Background job processing with Celery
   - Message queues (Redis/RabbitMQ)

4. **AI Processing Optimization**
   - Batch processing for multiple documents
   - Async processing with proper queuing
   - Fallback models for high availability
   - Cost optimization with model selection

### Monitoring & Observability
5. **Production Monitoring**
   - Application Performance Monitoring (APM)
   - Error tracking with Sentry
   - Logging aggregation with ELK stack
   - Health checks and metrics

6. **Security & Compliance**
   - OAuth2/JWT authentication
   - Rate limiting and DDoS protection
   - Data encryption at rest and in transit
   - GDPR/compliance features

## 📝 Development Workflow (Modern Practices)

### Code Quality
```bash
# Frontend tooling
pnpm add -D @typescript-eslint/eslint-plugin@latest
pnpm add -D prettier@latest eslint@latest
pnpm add -D @biomejs/biome  # Alternative to ESLint/Prettier

# Backend tooling
pip install ruff black pytest-cov mypy

# Git hooks with husky
pnpm add -D husky lint-staged
```

### Testing Strategy
```bash
# Frontend testing
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
pnpm add -D playwright @playwright/test

# Backend testing
pip install pytest pytest-asyncio httpx
```

### CI/CD Pipeline
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
        python-version: [3.12]
    # ... CI steps
```

---

*Last updated: September 23, 2025 - Based on official documentation and latest versions*