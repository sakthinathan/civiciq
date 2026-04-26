"""
TTS Route
Handles generating Text-to-Speech audio using gTTS.
"""

import io
import logging
from flask import Blueprint, request, send_file, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

logger = logging.getLogger(__name__)
tts_bp = Blueprint("tts", __name__)
limiter = Limiter(key_func=get_remote_address)

try:
    from gtts import gTTS
    GTTS_AVAILABLE = True
except ImportError:
    GTTS_AVAILABLE = False
    logger.warning("gTTS not installed. TTS will be unavailable.")

@tts_bp.route("/api/tts", methods=["POST"])
@limiter.limit("30/minute")
def generate_tts():
    """Generate audio from text and return it as streaming mp3."""
    if not GTTS_AVAILABLE:
        return jsonify({"error": "TTS engine unavailable"}), 503

    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400

        data = request.get_json(force=True)
        text = data.get("text", "").strip()

        if not text:
            return jsonify({"error": "Text is required"}), 400
            
        if len(text) > 1000:
            text = text[:1000]

        # Generate audio buffer
        tts = gTTS(text=text, lang="en", slow=False)
        audio_fp = io.BytesIO()
        tts.write_to_fp(audio_fp)
        audio_fp.seek(0)

        return send_file(
            audio_fp,
            mimetype="audio/mpeg",
            as_attachment=False,
            download_name="speech.mp3"
        )
    except Exception as e:
        logger.error(f"TTS generation error: {e}")
        return jsonify({"error": "Failed to generate audio"}), 500
