import re

try:
    from presidio_analyzer import AnalyzerEngine
    from presidio_anonymizer import AnonymizerEngine
    analyzer = AnalyzerEngine()
    anonymizer = AnonymizerEngine()
    _HAS_PRESIDIO = True
except Exception:
    _HAS_PRESIDIO = False


def _regex_redact(text: str) -> str:
    """Fallback high-precision regex redaction for emails, phone numbers, and card numbers."""
    # Redact email addresses
    text = re.sub(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', '<EMAIL_ADDRESS>', text)
    # Redact phone numbers (10 digits, formatted with dashes/spaces)
    text = re.sub(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', '<PHONE_NUMBER>', text)
    # Redact 16-digit card / account numbers
    text = re.sub(r'\b(?:\d[ -]*?){13,16}\b', '<CREDIT_CARD>', text)
    return text


def redact_pii(text: str) -> str:
    """Mask personally identifiable information (PII) from text."""
    if not text:
        return text

    if _HAS_PRESIDIO:
        try:
            results = analyzer.analyze(text=text, language="en")
            if results:
                anonymized_result = anonymizer.anonymize(
                    text=text,
                    analyzer_results=results
                )
                return anonymized_result.text
        except Exception:
            pass

    # Fallback to regex-based redaction
    return _regex_redact(text)