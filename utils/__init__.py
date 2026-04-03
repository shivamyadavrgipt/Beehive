from flask import jsonify


def error_response(message: str, status_code: int, **kwargs):
    return jsonify({"error": message, **kwargs}), status_code
