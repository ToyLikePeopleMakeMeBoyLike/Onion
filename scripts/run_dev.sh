#!/bin/bash
# Script to run the Flask development server

# Exit immediately if a command exits with a non-zero status.
set -e

# Activate virtual environment if you use one and it's not already active
# if [ -d ".venv" ]; then
#   echo "Activating virtual environment..."
#   source.venv/bin/activate
# fi

echo "Setting up Flask environment variables..."
export FLASK_APP=app
export FLASK_ENV=development # Enables debug mode and reloader

# Check if database needs initialization
INSTANCE_PATH="instance"
DATABASE_FILE="$INSTANCE_PATH/database.db"

if [ ! -f "$DATABASE_FILE" ]; then
  echo "Database file not found at $DATABASE_FILE. Initializing database..."
  # Ensure instance folder exists for flask init-db
  mkdir -p $INSTANCE_PATH
  flask init-db
else
  echo "Database file found at $DATABASE_FILE."
fi

echo "Starting Flask development server on http://0.0.0.0:5000"
echo "Access it at http://localhost:5000 from your host machine if using Docker/Codespaces port forwarding."
# Use 0.0.0.0 to make it accessible from outside the container in Codespaces/Docker.
# For production, Gunicorn would be used (see Dockerfile).
flask run --host=0.0.0.0 --port=5000