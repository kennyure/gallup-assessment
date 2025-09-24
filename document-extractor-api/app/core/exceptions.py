"""
Custom application exceptions.
"""


class DocumentExtractionError(Exception):
    """Base exception for document extraction errors."""
    pass


class InvalidFileFormatError(DocumentExtractionError):
    """Raised when uploaded file format is not supported."""
    pass


class OpenAIError(DocumentExtractionError):
    """Raised when OpenAI API encounters an error."""
    pass


class ValidationError(DocumentExtractionError):
    """Raised when extracted data fails validation."""
    pass


class DataStorageError(DocumentExtractionError):
    """Raised when data storage operations fail."""
    pass


class ConfigurationError(Exception):
    """Raised when application configuration is invalid."""
    pass