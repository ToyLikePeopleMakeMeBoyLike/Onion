from flask import Blueprint, render_template, request, redirect, current_app, url_for, flash, jsonify
import sqlite3 # For IntegrityError
from .db_operations import get_db, query_db, execute_db
from .utils import generate_short_code

bp = Blueprint('main', __name__)

@bp.route('/', methods=['GET', 'POST'])
def index():
    short_url_display = None
    original_url_encrypted_for_display = None # For potentially showing decrypted on result

    if request.method == 'POST':
        # original_url_plaintext is from the visible form field, not stored.
        # original_url is the hidden field containing the encrypted URL.
        encrypted_original_url = request.form.get('original_url', '').strip() # This is now encrypted
        custom_alias = request.form.get('custom_alias', '').strip()

        # Server-side validation of the *encrypted* URL is not meaningful for its content.
        # The fact that it's non-empty is the main server-side check here.
        if not encrypted_original_url:
            flash("Encrypted original URL data seems to be missing.", "error")
        # Client-side JS should have already validated the plaintext URL starts with http/https
        else:
            # Since URLs are encrypted client-side with a user-specific seed,
            # checking for existing original_url in the DB is not useful for preventing
            # duplicates of the *same plaintext URL* across different users or seeds.
            # We can still check if a *custom alias* is taken.

            short_code_to_insert = None
            alias_problem = False

            if custom_alias:
                if not (3 <= len(custom_alias) <= 30 and custom_alias.isalnum()):
                    flash("Custom alias must be 3-30 alphanumeric characters.", "error")
                    alias_problem = True
                else:
                    existing_alias = query_db('SELECT id FROM urls WHERE short_code = ?', [custom_alias], one=True)
                    if existing_alias:
                        flash(f"Custom alias '{custom_alias}' is already taken. Please choose another or leave blank for random.", "error")
                        alias_problem = True
                    else:
                        short_code_to_insert = custom_alias

            if not alias_problem and not short_code_to_insert: # If no custom_alias or it was invalid, generate random.
                while True:
                    generated_code = generate_short_code()
                    existing_code = query_db('SELECT id FROM urls WHERE short_code = ?', [generated_code], one=True)
                    if not existing_code:
                        short_code_to_insert = generated_code
                        break

            if short_code_to_insert:
                try:
                    # Store the encrypted original_url
                    execute_db('INSERT INTO urls (original_url, short_code) VALUES (?, ?)',
                               [encrypted_original_url, short_code_to_insert])
                    current_app.logger.info(f"Stored new mapping: {short_code_to_insert} -> ENCRYPTED_URL_OMITTED")
                    short_url_display = request.host_url.rstrip('/') + url_for('main.redirect_to_url', short_code=short_code_to_insert)
                    original_url_encrypted_for_display = encrypted_original_url # Pass for potential JS display
                    flash(f"URL shortened successfully!", "success")
                except sqlite3.IntegrityError:
                    flash(f"Could not create short URL due to a conflict (alias might have been taken just now). Please try again.", "error")
                    current_app.logger.error(f"Database integrity error for short_code {short_code_to_insert}")
            elif not alias_problem : # Failed to set short_code for other reasons
                 flash("Could not generate a unique short code. Please try again.", "error")

    return render_template('index.html',
                           short_url_display=short_url_display,
                           original_url_encrypted_for_display=original_url_encrypted_for_display)


@bp.route('/<short_code>')
def redirect_to_url(short_code):
    current_app.logger.info(f"Attempting to serve redirector for short code: {short_code}")

    url_entry = query_db('SELECT original_url FROM urls WHERE short_code =?', [short_code], one=True)

    if url_entry:
        encrypted_original_url = url_entry['original_url']
        try:
            execute_db('UPDATE urls SET clicks = clicks + 1 WHERE short_code =?', [short_code])
            current_app.logger.info(f"Click count updated for {short_code}.")
        except Exception as e:
            current_app.logger.error(f"Failed to update click count for {short_code}: {e}")

        # Serve a page that will perform client-side decryption and redirection
        return render_template('redirector.html',
                               encrypted_url=encrypted_original_url,
                               short_code=short_code)
    else:
        current_app.logger.warning(f"Short code '{short_code}' not found in database.")
        flash(f"The short URL '{short_code}' was not found.", "error")
        return render_template('404.html', short_code=short_code), 404


@bp.route('/history')
def history():
    # URLs fetched are already encrypted in the 'original_url' field
    all_urls_data = query_db('SELECT original_url, short_code, created_at, clicks, encrypted_description FROM urls ORDER BY created_at DESC')

    urls_for_template = []
    if all_urls_data:
        for url_entry in all_urls_data:
            full_short_url = request.host_url.rstrip('/') + url_for('main.redirect_to_url', short_code=url_entry['short_code'])
            urls_for_template.append({
                'encrypted_original_url': url_entry['original_url'], # This is the encrypted one
                'short_url_display': full_short_url,
                'created_at': url_entry['created_at'],
                'clicks': url_entry['clicks'],
                'encrypted_description': url_entry['encrypted_description'],
                'short_code': url_entry['short_code'] # Add this line
            })

    return render_template('history.html', urls=urls_for_template)

@bp.route('/update_description/<short_code>', methods=['POST', 'OPTIONS'])
def update_description(short_code):
    if request.method == 'OPTIONS':
        # This is a pre-flight request. Respond with 200 OK.
        # Browsers send OPTIONS requests to check if the actual POST request is allowed.
        # For same-origin requests with application/json, this might not always be strictly necessary
        # but handling it can resolve 405 errors if the browser decides to send one.
        response = current_app.make_default_options_response()
        # If specific CORS headers were needed, they would be added here, e.g.:
        # response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        # response.headers.add('Access-Control-Allow-Methods', 'POST,OPTIONS')
        return response

    current_app.logger.info(f"Attempting to update description for short code: {short_code}")
    data = request.get_json()
    if not data or 'encrypted_description' not in data:
        current_app.logger.warning(f"Bad request for update_description: {short_code}. Missing data.")
        return jsonify({"success": False, "error": "Missing encrypted_description"}), 400

    encrypted_description = data['encrypted_description']

    # Check if the short_code exists
    url_entry = query_db('SELECT id FROM urls WHERE short_code = ?', [short_code], one=True)
    if not url_entry:
        current_app.logger.warning(f"Short code '{short_code}' not found while trying to update description.")
        return jsonify({"success": False, "error": "Short code not found"}), 404

    try:
        execute_db('UPDATE urls SET encrypted_description = ? WHERE short_code = ?',
                   [encrypted_description, short_code])
        current_app.logger.info(f"Successfully updated description for short code: {short_code}")
        return jsonify({"success": True}), 200
    except Exception as e:
        current_app.logger.error(f"Failed to update description for {short_code}: {e}")
        return jsonify({"success": False, "error": "Database update failed"}), 500