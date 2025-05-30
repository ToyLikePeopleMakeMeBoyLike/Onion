from flask import Blueprint, render_template, request, redirect, current_app, url_for, flash
import sqlite3 # For IntegrityError
from.db_operations import get_db, query_db, execute_db
from.utils import generate_short_code

bp = Blueprint('main', __name__)

@bp.route('/', methods=['GET', 'POST'])
def index():
    short_url_display = None
    if request.method == 'POST':
        original_url = request.form.get('original_url', '').strip()
        custom_alias = request.form.get('custom_alias', '').strip()

        if not original_url:
            flash("Original URL cannot be empty.", "error")
        elif not (original_url.startswith('http://') or original_url.startswith('https://')):
            flash("Original URL must start with http:// or https://.", "error")
        else:
            # Check if original_url already has a short_code
            existing_entry = query_db('SELECT short_code FROM urls WHERE original_url = ?', [original_url], one=True)
            if existing_entry:
                short_code = existing_entry['short_code']
                flash(f"This URL has already been shortened: {request.host_url.rstrip('/') + url_for('main.redirect_to_url', short_code=short_code)}", "info")
                short_url_display = request.host_url.rstrip('/') + url_for('main.redirect_to_url', short_code=short_code)
            else:
                short_code_to_insert = None # Initialize variable
                if custom_alias:
                    if not (3 <= len(custom_alias) <= 30 and custom_alias.isalnum()): # Basic validation for alias
                        flash("Custom alias must be 3-30 alphanumeric characters.", "error")
                    else:
                        # Check if custom alias already exists
                        existing_alias = query_db('SELECT id FROM urls WHERE short_code = ?', [custom_alias], one=True)
                        if existing_alias:
                            flash(f"Custom alias '{custom_alias}' is already taken. Please choose another or leave blank for random.", "error")
                        else:
                            short_code_to_insert = custom_alias

                if not short_code_to_insert and not custom_alias: # Only generate if no valid custom alias was provided (or it was invalid) and not already existing
                    while True:
                        generated_code = generate_short_code()
                        existing_code = query_db('SELECT id FROM urls WHERE short_code = ?', [generated_code], one=True)
                        if not existing_code:
                            short_code_to_insert = generated_code
                            break
                
                if short_code_to_insert: # Ensure short_code_to_insert was set (either custom or generated)
                    try:
                        execute_db('INSERT INTO urls (original_url, short_code) VALUES (?, ?)',
                                   [original_url, short_code_to_insert])
                        current_app.logger.info(f"Stored new mapping: {short_code_to_insert} -> {original_url}")
                        short_url_display = request.host_url.rstrip('/') + url_for('main.redirect_to_url', short_code=short_code_to_insert)
                        flash(f"URL shortened successfully!", "success")
                    except sqlite3.IntegrityError: # This might happen if a race condition occurs with custom alias
                        flash(f"Could not create short URL due to a conflict (alias might have been taken just now). Please try again.", "error")
                        current_app.logger.error(f"Database integrity error for short_code {short_code_to_insert}")
                elif not existing_entry and not custom_alias: # If we failed to set a short_code (e.g. custom alias was invalid and random generation failed - though unlikely for random)
                     flash("Could not generate a unique short code or process custom alias. Please try again.", "error")

    return render_template('index.html', short_url_display=short_url_display)

@bp.route('/<short_code>')
def redirect_to_url(short_code):
    current_app.logger.info(f"Attempting to redirect for short code: {short_code}")
    
    url_entry = query_db('SELECT original_url FROM urls WHERE short_code =?', [short_code], one=True)

    if url_entry:
        original_url = url_entry['original_url']
        try:
            execute_db('UPDATE urls SET clicks = clicks + 1 WHERE short_code =?', [short_code])
            current_app.logger.info(f"Redirecting {short_code} to {original_url}. Click count updated.")
        except Exception as e:
            current_app.logger.error(f"Failed to update click count for {short_code}: {e}")
        
        # Using 302 for temporary redirect to allow analytics on each click.
        # 301 might get cached by Tor Browser, bypassing our server on subsequent visits.
        return redirect(original_url, code=302)
    else:
        current_app.logger.warning(f"Short code '{short_code}' not found in database.")
        flash(f"The short URL '{short_code}' was not found.", "error")
        return render_template('404.html', short_code=short_code), 404

@bp.route('/history')
def history():
    all_urls_data = query_db('SELECT original_url, short_code, created_at, clicks FROM urls ORDER BY created_at DESC')
    
    urls_for_template = []
    if all_urls_data:
        for url_entry in all_urls_data:
            full_short_url = request.host_url.rstrip('/') + url_for('main.redirect_to_url', short_code=url_entry['short_code'])
            urls_for_template.append({
                'original_url': url_entry['original_url'],
                'short_url_display': full_short_url,
                'created_at': url_entry['created_at'],
                'clicks': url_entry['clicks']
            })
            
    return render_template('history.html', urls=urls_for_template)