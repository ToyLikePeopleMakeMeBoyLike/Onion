import sqlite3
from flask import current_app, g
from flask.cli import with_appcontext

def get_db():
    """Connects to the application's configured database.
    The connection is unique for each request and will be reused if called again.
    """
    if 'db' not in g:
        g.db = sqlite3.connect(
            current_app.config,
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row
        current_app.logger.debug(f"Database connection opened for {current_app.config}")
    return g.db

def close_db(e=None):
    """Closes the database connection if it was opened for this request."""
    db = g.pop('db', None)
    if db is not None:
        db.close()
        current_app.logger.debug("Database connection closed.")

def init_db():
    """Initializes the database by executing the schema.sql file."""
    db = get_db()
    try:
        with current_app.open_resource('schema.sql') as f:
            db.executescript(f.read().decode('utf8'))
        current_app.logger.info("Database schema initialized.")
    except Exception as e:
        current_app.logger.error(f"Error initializing database schema: {e}")


@click.command('init-db')
@with_appcontext
def init_db_command():
    """Clear existing data and create new tables."""
    init_db()
    click.echo('Initialized the database.')

def init_app(app):
    """Register database functions with the Flask app.
    This is called by the application factory.
    """
    app.teardown_appcontext(close_db) # Call close_db when app context ends
    app.cli.add_command(init_db_command) # Add `flask init-db` command

# Helper for querying
def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv if rv else None) if one else rv

# Helper for executing DML statements
def execute_db(sql, args=()):
    db = get_db()
    cur = db.cursor()
    cur.execute(sql, args)
    db.commit()
    last_row_id = cur.lastrowid
    cur.close()
    return last_row_id

# Add this import at the top
import click