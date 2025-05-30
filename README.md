# Onion Link Shortener

This project is a simple URL shortener service, designed with operational security for.onion links in mind. It uses Python and Flask.

## Features

*   Shorten long URLs (especially.onion addresses).
*   Custom alias for shortened links.
*   Redirection to original URLs.
*   History of shortened links and click counts.

## Development Setup

1.  **Prerequisites**:
    *   Python 3.x (python3 recommended)
    *   `pip` (usually comes with Python)

2.  **Environment Setup & Installation**:
    *   **Clone the repository**:
        ```bash
        git clone <repository_url>
        cd <repository_directory>
        ```
    *   **Create and activate a virtual environment**:
        It's highly recommended to use a virtual environment to manage project dependencies.
        ```bash
        python3 -m venv .venv
        source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
        ```
    *   **Install dependencies**:
        Once the virtual environment is activated, install the required packages:
        ```bash
        pip install -r requirements.txt
        ```
    *   **Make the development script executable**:
        ```bash
        chmod +x scripts/run_dev.sh
        ```

3.  **Running the Development Server**:
    *   **Ensure your virtual environment is active.**
    *   Execute the development script:
        ```bash
        bash scripts/run_dev.sh
        ```
        Alternatively, if you've made it executable and it's in your PATH or current directory:
        ```bash
        ./scripts/run_dev.sh
        ```
    *   The application will be available at `http://localhost:5000`.
    *   The script will automatically initialize the SQLite database (`instance/database.db`) if it doesn't exist on the first run (after dependencies are installed and `flask` command is available).

## Operational Security (OpSec) Notes

*   **Tor Hidden Service**: This application is intended to be deployed as a Tor hidden service. Refer to `config/torrc.example` for a sample Tor configuration.
*   **Minimize Footprints**: The application aims to be minimal to reduce attack surface and potential for information leaks.
*   **Logging**: Review and configure logging appropriately for your environment, being mindful of sensitive information.
*   **Server Hardening**: If deploying, ensure standard server hardening practices and configure your web server (e.g., Gunicorn) and Tor securely.
*   **No External Requests by Default**: The core application does not make external requests beyond serving user needs.
*   **Development vs. Production**: The `run_dev.sh` script uses the Flask development server. For production, use a robust WSGI server like Gunicorn (see `Dockerfile` for an example).
