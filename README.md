# Onion Link Shortener

This project is a simple URL shortener service, designed with operational security for.onion links in mind. It uses Python and Flask.

## Features

*   Shorten long URLs (especially.onion addresses).
*   Custom alias for shortened links.
*   Redirection to original URLs.
*   History of shortened links and click counts.

## Development Setup

1.  **Prerequisites**:
    *   Python 3.x
    *   `pip`

2.  **Installation**:
    *   Clone the repository.
    *   Install dependencies: `pip install -r requirements.txt`
    *   (The `scripts/run_dev.sh` script can also handle database initialization on first run).

3.  **Running the Development Server**:
    *   Execute the development script: `bash scripts/run_dev.sh`
    *   The application will be available at `http://localhost:5000`.
    *   The script will automatically initialize the SQLite database (`instance/database.db`) if it doesn't exist.

## Operational Security (OpSec) Notes

*   **Tor Hidden Service**: This application is intended to be deployed as a Tor hidden service. Refer to `config/torrc.example` for a sample Tor configuration.
*   **Minimize Footprints**: The application aims to be minimal to reduce attack surface and potential for information leaks.
*   **Logging**: Review and configure logging appropriately for your environment, being mindful of sensitive information.
*   **Server Hardening**: If deploying, ensure standard server hardening practices and configure your web server (e.g., Gunicorn) and Tor securely.
*   **No External Requests by Default**: The core application does not make external requests beyond serving user needs.
*   **Development vs. Production**: The `run_dev.sh` script uses the Flask development server. For production, use a robust WSGI server like Gunicorn (see `Dockerfile` for an example).
