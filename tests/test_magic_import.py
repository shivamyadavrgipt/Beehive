import importlib
import sys


def test_app_imports_without_python_magic(monkeypatch):
    monkeypatch.setitem(sys.modules, "magic", None)
    monkeypatch.setenv("FLASK_SECRET_KEY", "test-secret-key")

    imported_app = importlib.import_module("app")

    assert imported_app.app is not None
    assert imported_app.magic is None
