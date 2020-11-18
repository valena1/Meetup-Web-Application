// connection object
class Connection {
  constructor(
    connectionId,
    connectionName,
    connectionTopic,
    detail,
    location,
    date,
  ) {
    this._connectionId = connectionId;
    this._connectionName = connectionName;
    this._connectionTopic = connectionTopic;
    this._detail = detail;
    this._location = location;
    this._date = date;
  }

  getConnectionId() {
    return this._connectionId;
  }

  setConnectionId(value) {
    this._connectionId = value;
  }

  getConnectionName() {
    return this._connectionName;
  }

  setConnectionName(value) {
    this._connectionName = value;
  }

  getConnectionTopic() {
    return this._connectionTopic;
  }

  setConnectionTopic(value) {
    this._connectionTopic = value;
  }

  getDetail() {
    return this._detail;
  }

  setDetail(value) {
    this._detail = value;
  }

  getDate() {
    return this._date;
  }

  setDate(value) {
    this._date = value;
  }

  getLocation() {
    return this._location;
  }

  setLocation(value) {
    this._location = value;
  }

}

module.exports = Connection;
