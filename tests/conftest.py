import pytest
import mongomock
from unittest.mock import patch, MagicMock


@pytest.fixture(scope="session", autouse=True)
def mock_mongo_client_session():
    with patch("pymongo.MongoClient", mongomock.MongoClient):
        yield


@pytest.fixture(autouse=True)
def mock_db(mock_mongo_client_session):
    from database.databaseConfig import db
    for collection in db.list_collection_names():
        db.drop_collection(collection)
    yield db


@pytest.fixture
def app(mock_mongo_client_session):
    with patch(
        "google_auth_oauthlib.flow.Flow.from_client_secrets_file",
        return_value=MagicMock(),
    ):
        from app import app as flask_app

    flask_app.config.update({"TESTING": True, "SECRET_KEY": "beehive"})
    yield flask_app


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def runner(app):
    return app.test_cli_runner()
