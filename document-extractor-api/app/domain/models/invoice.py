"""
Invoice domain models using Pydantic for validation and serialization.
"""
from pydantic import BaseModel, Field, ConfigDict, validator
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
import uuid


class Address(BaseModel):
    """Address model for billing and shipping information."""
    model_config = ConfigDict(str_strip_whitespace=True, validate_assignment=True)
    
    street: str = Field(description="Street address", default="")
    city: str = Field(description="City name", default="")
    state: str = Field(description="State or province", default="")
    zip_code: str = Field(description="ZIP or postal code", default="")
    phone: Optional[str] = Field(default=None, description="Phone number")
    
    @validator('phone')
    def validate_phone(cls, v):
        """Validate phone number format if provided."""
        if v and v.strip() and not v.strip().startswith('[') and len(v.strip()) < 10:
            raise ValueError('Phone number must be at least 10 digits')
        return v.strip() if v else None


class InvoiceItem(BaseModel):
    """Invoice line item model."""
    model_config = ConfigDict(
        str_strip_whitespace=True, 
        validate_assignment=True,
        arbitrary_types_allowed=True
    )
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique item ID")
    item_number: str = Field(description="Product or service item number", default="")
    description: str = Field(description="Item description", default="")
    quantity: int = Field(gt=0, description="Quantity ordered")
    unit_price: Decimal = Field(ge=0, description="Price per unit")
    total: Decimal = Field(ge=0, description="Line item total")
    
    @validator('total')
    def validate_total(cls, v, values):
        """Validate that total matches quantity * unit_price."""
        if 'quantity' in values and 'unit_price' in values:
            calculated_total = Decimal(str(values['quantity'])) * values['unit_price']
            if abs(calculated_total - v) > Decimal('0.01'):
                raise ValueError(f'Total {v} does not match calculated total {calculated_total}')
        return v


class InvoiceData(BaseModel):
    """Complete invoice data model."""
    model_config = ConfigDict(
        str_strip_whitespace=True, 
        validate_assignment=True,
        arbitrary_types_allowed=True
    )
    
    # Primary identifier
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique invoice ID")
    
    # Required fields
    invoice_number: str = Field(description="Unique invoice number", default="")
    invoice_date: Optional[datetime] = Field(default=None, description="Invoice date")
    customer_id: Optional[str] = Field(default=None, description="Customer ID")
    customer_name: str = Field(description="Customer company name", default="")
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
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.now, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(default=None, description="Last update timestamp")
    extraction_confidence: Optional[float] = Field(default=None, ge=0, le=1, description="AI extraction confidence score")
    
    @validator('subtotal')
    def validate_subtotal(cls, v, values):
        """Validate that subtotal matches sum of item totals."""
        if 'items' in values:
            calculated_subtotal = sum(item.total for item in values['items'])
            if abs(calculated_subtotal - v) > Decimal('0.01'):
                raise ValueError(f'Subtotal {v} does not match calculated subtotal {calculated_subtotal}')
        return v
    
    @validator('tax')
    def validate_tax(cls, v, values):
        """Validate that tax matches subtotal * tax_rate (allowing for rounding)."""
        if 'subtotal' in values and 'tax_rate' in values:
            calculated_tax = values['subtotal'] * values['tax_rate']
            # Allow for more flexible rounding (up to $1.00 difference)
            if abs(calculated_tax - v) > Decimal('1.00'):
                raise ValueError(f'Tax {v} does not match calculated tax {calculated_tax}')
        return v
    
    @validator('total')
    def validate_total(cls, v, values):
        """Validate that total matches subtotal + tax (allowing for OCR variations)."""
        if 'subtotal' in values and 'tax' in values:
            calculated_total = values['subtotal'] + values['tax']
            # Allow for OCR reading variations (up to $5.00 difference)
            if abs(calculated_total - v) > Decimal('5.00'):
                raise ValueError(f'Total {v} does not match calculated total {calculated_total}')
        return v
    
    def to_dict(self) -> dict:
        """Convert to dictionary with proper types for API responses."""
        def safe_float(value) -> float:
            """Safely convert to float, return 0.0 for invalid values."""
            try:
                result = float(value)
                return 0.0 if not isinstance(result, (int, float)) or result != result else result  # Check for NaN
            except (ValueError, TypeError):
                return 0.0

        return {
            'id': self.id,
            'invoice_number': self.invoice_number,
            'invoice_date': self.invoice_date.isoformat() if self.invoice_date else '',
            'customer_id': self.customer_id or '',
            'customer_name': self.customer_name,
            'billing_address': {
                'street': self.billing_address.street,
                'city': self.billing_address.city,
                'state': self.billing_address.state,
                'zip_code': self.billing_address.zip_code,
                'phone': self.billing_address.phone or ''
            },
            'shipping_address': {
                'street': self.shipping_address.street,
                'city': self.shipping_address.city,
                'state': self.shipping_address.state,
                'zip_code': self.shipping_address.zip_code,
                'phone': self.shipping_address.phone or ''
            },
            'items': [
                {
                    'id': item.id,
                    'item_number': item.item_number,
                    'description': item.description,
                    'quantity': item.quantity,
                    'unit_price': safe_float(item.unit_price),
                    'total': safe_float(item.total)
                }
                for item in self.items
            ],
            'subtotal': safe_float(self.subtotal),
            'tax_rate': safe_float(self.tax_rate),
            'tax': safe_float(self.tax),
            'total': safe_float(self.total),
            'salesperson': self.salesperson or '',
            'po_number': self.po_number or '',
            'terms': self.terms or '',
            'ship_date': self.ship_date.isoformat() if self.ship_date else '',
            'ship_via': self.ship_via or '',
            'fob': self.fob or '',
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else '',
            'extraction_confidence': self.extraction_confidence or 0.0
        }

    def to_csv_header(self) -> dict:
        """Convert to CSV header format for SalesOrderHeader."""
        return {
            'id': self.id,
            'invoice_number': self.invoice_number,
            'invoice_date': self.invoice_date.isoformat() if self.invoice_date else '',
            'customer_id': self.customer_id or '',
            'customer_name': self.customer_name,
            'billing_street': self.billing_address.street,
            'billing_city': self.billing_address.city,
            'billing_state': self.billing_address.state,
            'billing_zip': self.billing_address.zip_code,
            'billing_phone': self.billing_address.phone or '',
            'shipping_street': self.shipping_address.street,
            'shipping_city': self.shipping_address.city,
            'shipping_state': self.shipping_address.state,
            'shipping_zip': self.shipping_address.zip_code,
            'shipping_phone': self.shipping_address.phone or '',
            'subtotal': float(self.subtotal),
            'tax_rate': float(self.tax_rate),
            'tax_amount': float(self.tax),
            'total_amount': float(self.total),
            'salesperson': self.salesperson or '',
            'po_number': self.po_number or '',
            'terms': self.terms or '',
            'ship_date': self.ship_date.isoformat() if self.ship_date else '',
            'ship_via': self.ship_via or '',
            'fob': self.fob or '',
            'created_at': self.created_at.isoformat(),
            'extraction_confidence': self.extraction_confidence or 0.0
        }
    
    def to_csv_details(self) -> List[dict]:
        """Convert to CSV detail format for SalesOrderDetail."""
        return [
            {
                'id': item.id,
                'invoice_id': self.id,
                'item_number': item.item_number,
                'description': item.description,
                'quantity': item.quantity,
                'unit_price': float(item.unit_price),
                'line_total': float(item.total),
                'created_at': self.created_at.isoformat()
            }
            for item in self.items
        ]