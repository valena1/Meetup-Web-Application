class User {
  constructor(
    firstName,
    lastName,
    email,
    password,
  ) {
    this._firstName = firstName;
    this._lastName = lastName;
    this._email = email;
    this._password = password;
  }

  getFirstName() {
    return this._firstName;
  }

  setFirstName(value) {
    this._firstName = value;
  }

  getLastName() {
    return this._lastName;
  }

  setLastName(value) {
    this._lastName = value;
  }

  getEmail() {
    return this._email;
  }

  setEmail(value) {
    this._email = value;
  }

  getPassword() {
    return this._password;
  }

  setPassword(value) {
    this._password = value;
  }

}

module.exports = User;
