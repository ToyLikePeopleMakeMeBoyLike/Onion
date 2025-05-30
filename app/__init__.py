import os
import sqlite3
from flask import Flask, g, current_app

DATABASE_FILENAME = 'database.db'

def create_app(test_config=None):
    """Create and configure an instance of the Flask application."""
    app = Flask(__name__, instance_relative_config=True)
    
    # Ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass # Already exists

    app.config.from_mapping(
        SECRET_KEY='dev', # IMPORTANT: Change this to a random, secret value for production!
        DATABASE=os.path.join(app.instance_path, DATABASE_FILENAME),
    )

    if test_config is None:
        # Load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # Load the test config if passed in
        app.config.update(test_config)

    # Initialize database functions
    from. import db_operations
    db_operations.init_app(app)

    # Register blueprints
    from. import main
    app.register_blueprint(main.bp)
    # app.add_url_rule('/', endpoint='index') # If main.bp doesn't define '/'

    app.logger.info(f"Application created. Database at: {app.config}")
    return app