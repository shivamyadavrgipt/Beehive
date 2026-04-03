import importlib
import sys


def test_app_imports_without_python_magic(monkeypatch):
    monkeypatch.setitem(sys.modules, "magic", None)
    sys.modules.pop("app", None)

    imported_app = importlib.import_module("app")

    assert imported_app.app is not None
    assert imported_app.magic is None
