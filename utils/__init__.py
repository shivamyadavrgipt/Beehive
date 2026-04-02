from flask import jsonify


def error_response(message):
    return jsonify({"error": message})
