"""
Document processing models.
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime
from pathlib import Path
import mimetypes


class UploadedDocument(BaseModel):
    """Model for uploaded document information."""
    model_config = ConfigDict(str_strip_whitespace=True, validate_assignment=True)
    
    id: str = Field(description="Unique document ID")
    filename: str = Field(description="Original filename")
    file_path: str = Field(description="Stored file path")
    file_size: int = Field(ge=0, description="File size in bytes")
    mime_type: str = Field(description="MIME type of the file")
    upload_timestamp: datetime = Field(default_factory=datetime.now)
    
    @classmethod
    def from_file_path(cls, file_path: Path, document_id: str) -> 'UploadedDocument':
        """Create document from file path."""
        mime_type, _ = mimetypes.guess_type(str(file_path))
        
        return cls(
            id=document_id,
            filename=file_path.name,
            file_path=str(file_path),
            file_size=file_path.stat().st_size,
            mime_type=mime_type or 'application/octet-stream'
        )


class ExtractionResult(BaseModel):
    """Result of document extraction process."""
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    document_id: str = Field(description="Source document ID")
    extraction_id: str = Field(description="Unique extraction ID")
    success: bool = Field(description="Whether extraction was successful")
    extracted_data: Optional[Dict[str, Any]] = Field(default=None, description="Extracted structured data")
    confidence_score: Optional[float] = Field(default=None, ge=0, le=1, description="Overall confidence score")
    processing_time: Optional[float] = Field(default=None, description="Processing time in seconds")
    error_message: Optional[str] = Field(default=None, description="Error message if extraction failed")
    validation_results: Optional[Dict[str, Any]] = Field(default=None, description="Validation results")
    created_at: datetime = Field(default_factory=datetime.now)
    
    @property
    def is_valid(self) -> bool:
        """Check if extraction result is valid."""
        return self.success and self.extracted_data is not None


class ProcessingStatus(BaseModel):
    """Status of document processing."""
    document_id: str = Field(description="Document ID being processed")
    status: str = Field(description="Current processing status")
    progress: int = Field(ge=0, le=100, description="Progress percentage")
    message: Optional[str] = Field(default=None, description="Status message")
    started_at: datetime = Field(default_factory=datetime.now)
    completed_at: Optional[datetime] = Field(default=None)