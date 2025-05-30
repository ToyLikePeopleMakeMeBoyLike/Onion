import string
import random

def generate_short_code(length=6):
    """Generates a random short code using alphanumeric characters."""
    characters = string.ascii_letters + string.digits
    # Ensure the generated code is truly random and unpredictable for security.
    # random.SystemRandom uses OS-provided sources of randomness if available.
    # For a simple case, random.choice is often sufficient, but for security-sensitive
    # applications, consider stronger randomness if predictability is a concern.
    try:
        # Use SystemRandom if available for better randomness
        sr = random.SystemRandom()
        short_code = "".join(sr.choice(characters) for _ in range(length))
    except AttributeError:
        # Fallback to pseudo-random if SystemRandom is not available
        short_code = "".join(random.choice(characters) for _ in range(length))
    return short_code