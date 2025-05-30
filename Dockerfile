# Use an official Python image.
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /workspace

# Install system dependencies if needed (e.g., for database drivers later)
# RUN apt-get update && apt-get install -y --no-install-recommends some-package

# Copy the requirements file into the container
COPY requirements.txt.

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY..

# Expose the port the app runs on
EXPOSE 5000

# Default command can be overridden, but good for reference
# CMD ["flask", "run", "--host=0.0.0.0"]

# Create a non-root user for Codespaces and grant permissions
RUN useradd -ms /bin/bash vscode \
    && chown -R vscode:vscode /workspace

# Switch to non-root user
USER vscode