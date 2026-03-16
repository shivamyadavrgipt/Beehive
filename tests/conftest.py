import pytest
import mongomock
import unittest.mock
from unittest.mock import patch

unittest.mock.patch("pymongo.MongoClient", mongomock.MongoClient).start()

from app import app as flask_app
from database.databaseConfig import db


@pytest.fixture(autouse=True)
def mock_db():
    # Clear all collections
    for collection in db.list_collection_names():
        db.drop_collection(collection)
    yield db

@pytest.fixture
def app():
    flask_app.config.update({
        "TESTING": True,
        "SECRET_KEY": "beehive",
    })
    yield flask_app

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def runner(app):
    return app.test_cli_runner()
