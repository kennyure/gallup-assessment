"""
OpenAI client for document extraction using GPT-4o with structured outputs.
"""
import asyncio
import base64
import logging
from pathlib import Path
from typing import Dict, Any, Optional
import time

from openai import AsyncOpenAI
from app.core.exceptions import OpenAIError, ValidationError
from app.domain.models.invoice import InvoiceData
from app.domain.models.document import ExtractionResult

logger = logging.getLogger(__name__)


class OpenAIClient:
    """OpenAI client for document extraction."""
    
    def __init__(self, api_key: str, model: str = "gpt-4o-2024-11-20"):
        """Initialize OpenAI client."""
        if not api_key:
            raise ValueError("OpenAI API key is required")

        # Initialize with explicit parameters to avoid proxy issues
        self.client = AsyncOpenAI(
            api_key=api_key,
            timeout=60.0,
            max_retries=3
        )
        self.model = model
        logger.info(f"Initialized OpenAI client with model: {model}")

    async def extract_invoice_data(self, image_path: Path, document_id: str) -> ExtractionResult:
        """Extract structured data from invoice image using GPT-4o Vision."""
        start_time = time.time()
        extraction_id = f"extract_{document_id}_{int(start_time)}"
        
        try:
            logger.info(f"Starting extraction for document {document_id}")
            
            # Read and encode image
            if not image_path.exists():
                raise FileNotFoundError(f"Image file not found: {image_path}")
            
            image_data = base64.b64encode(image_path.read_bytes()).decode('utf-8')
            file_extension = image_path.suffix.lower()
            
            # Determine MIME type
            mime_type = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.pdf': 'application/pdf'
            }.get(file_extension, 'image/jpeg')
            
            # Call OpenAI API with structured output
            response = await self.client.beta.chat.completions.parse(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": self._get_system_prompt()
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "Please extract all structured data from this invoice image. Pay special attention to line items, totals, and addresses."
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{mime_type};base64,{image_data}",
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
            
            # Parse the response
            extracted_data = response.choices[0].message.parsed
            
            if extracted_data is None:
                raise ValueError("Failed to parse invoice data from OpenAI response")
            
            processing_time = time.time() - start_time
            
            # Calculate confidence score (simplified)
            confidence_score = self._calculate_confidence_score(response, extracted_data)
            
            logger.info(f"Successfully extracted data for invoice: {extracted_data.invoice_number} in {processing_time:.2f}s")
            
            return ExtractionResult(
                document_id=document_id,
                extraction_id=extraction_id,
                success=True,
                extracted_data=extracted_data.model_dump(),
                confidence_score=confidence_score,
                processing_time=processing_time
            )
            
        except Exception as e:
            processing_time = time.time() - start_time
            error_message = f"Failed to extract invoice data: {str(e)}"
            logger.error(error_message)
            
            return ExtractionResult(
                document_id=document_id,
                extraction_id=extraction_id,
                success=False,
                processing_time=processing_time,
                error_message=error_message
            )

    def _get_system_prompt(self) -> str:
        """Get the system prompt for invoice extraction."""
        return """You are an expert invoice data extraction system. 
        Analyze the provided invoice image and extract all relevant structured data with high accuracy.
        
        Pay close attention to:
        - Invoice numbers and dates (convert dates to ISO format)
        - Customer and billing information (separate billing and shipping addresses)
        - Individual line items with item numbers, descriptions, quantities, unit prices, and totals
        - Tax calculations and totals (ensure mathematical accuracy)
        - Any additional terms, references, or metadata
        
        Requirements:
        - Ensure all monetary values are accurate and properly calculated
        - Validate that line item totals = quantity × unit price
        - Validate that subtotal = sum of all line item totals
        - Validate that tax = subtotal × tax_rate
        - Validate that total = subtotal + tax
        - Use consistent date formats (ISO 8601)
        - Extract complete addresses with all available components
        - If billing and shipping addresses are the same, duplicate the information
        
        If any information is unclear or missing, make reasonable assumptions based on typical invoice structures."""

    def _calculate_confidence_score(self, response: Any, extracted_data: InvoiceData) -> float:
        """Calculate confidence score based on response and extracted data."""
        base_confidence = 0.8  # Base confidence for successful extraction
        
        # Adjust based on completeness
        completeness_score = 0.0
        total_fields = 10  # Key fields to check
        
        if extracted_data.invoice_number:
            completeness_score += 0.1
        if extracted_data.customer_name:
            completeness_score += 0.1
        if extracted_data.items:
            completeness_score += 0.2
        if extracted_data.billing_address.street and extracted_data.billing_address.city:
            completeness_score += 0.1
        if extracted_data.subtotal > 0:
            completeness_score += 0.1
        if extracted_data.total > 0:
            completeness_score += 0.1
        if extracted_data.tax_rate >= 0:
            completeness_score += 0.1
        if extracted_data.invoice_date:
            completeness_score += 0.1
        if len(extracted_data.items) > 0:
            completeness_score += 0.1
        if all(item.description and item.quantity > 0 for item in extracted_data.items):
            completeness_score += 0.1
            
        return min(base_confidence + completeness_score, 1.0)

    async def validate_extraction(self, extracted_data: InvoiceData) -> Dict[str, Any]:
        """Validate extracted data for consistency and accuracy."""
        validation_results = {
            "is_valid": True,
            "warnings": [],
            "errors": [],
            "suggestions": []
        }
        
        try:
            # Validate financial calculations
            calculated_subtotal = sum(item.total for item in extracted_data.items)
            if abs(calculated_subtotal - extracted_data.subtotal) > 0.01:
                validation_results["warnings"].append(
                    f"Subtotal mismatch: calculated {calculated_subtotal}, extracted {extracted_data.subtotal}"
                )
            
            calculated_tax = extracted_data.subtotal * extracted_data.tax_rate
            if abs(calculated_tax - extracted_data.tax) > 0.01:
                validation_results["warnings"].append(
                    f"Tax calculation mismatch: calculated {calculated_tax:.2f}, extracted {extracted_data.tax}"
                )
            
            calculated_total = extracted_data.subtotal + extracted_data.tax
            if abs(calculated_total - extracted_data.total) > 0.01:
                validation_results["errors"].append(
                    f"Total mismatch: calculated {calculated_total:.2f}, extracted {extracted_data.total}"
                )
                validation_results["is_valid"] = False
            
            # Validate line items
            for i, item in enumerate(extracted_data.items):
                calculated_line_total = item.quantity * item.unit_price
                if abs(calculated_line_total - item.total) > 0.01:
                    validation_results["warnings"].append(
                        f"Line {i+1} total mismatch: {item.quantity} × ${item.unit_price} = ${calculated_line_total:.2f}, extracted ${item.total}"
                    )
            
            # Check for missing critical data
            if not extracted_data.invoice_number:
                validation_results["errors"].append("Missing invoice number")
                validation_results["is_valid"] = False
            
            if not extracted_data.customer_name:
                validation_results["errors"].append("Missing customer name")
                validation_results["is_valid"] = False
            
            if not extracted_data.items:
                validation_results["errors"].append("No invoice items found")
                validation_results["is_valid"] = False
                
        except Exception as e:
            validation_results["errors"].append(f"Validation error: {str(e)}")
            validation_results["is_valid"] = False
        
        return validation_results