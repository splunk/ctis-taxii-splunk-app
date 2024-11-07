def validate_confidence(instance, attribute, value: int):
    if not 0 <= value <= 100:
        raise ValueError("confidence must be between 0 and 100")
