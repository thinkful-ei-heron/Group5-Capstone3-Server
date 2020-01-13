const bcrypt = require('bcryptjs');
const passwordChecker = require('password-checker');
const emailValidator = require('email-validator');
const checker = new passwordChecker();
const uuid = require('uuid/v4');

checker.requireLetters(true);
checker.requireNumbersOrSymbols(true);
checker.min_length = 8;
checker.max_length = 72; //bcrypt
//disallow params:
//active
//in_password (true to disallow passwords that contain a disallowed entry at all, default off)
//len (min length of match if in_password is on, default 4 for password list, 0 otherwise)
//disallowed lists are case-insensitive
// checker.disallowNames(true);
// checker.disallowWords(true);
// checker.disallowPasswords(true, true, 4);

const UserService = {
  hasUserWithUserName(db, username) {
    return db('users')
      .where({ username })
      .first()
      .then(user => !!user);
  },

  hasUserWithEmail(db, email) {
    return db('users')
      .where({ email })
      .first()
      .then(user => !!user);
  },

  insertUser(db, newUser) {
    return db('users')
      .insert(newUser)
      .returning('*')
      .then(([user]) => user);
  },

  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },

  validateEmail(email) {
    return emailValidator.validate(email);
  },

  validatePassword(password) {
    if (checker.check(password)) {
      return null;
    }
    let err = checker.errors;
    return err[0].toString().slice(7);
    //err is array of failed rules, entries are error objects, toString gets 'Error: description of error'
  },

  /**
   *
   * @param {knex} db Knex instance
   * @param {Number} id User ID
   * @param {Object} settings Settings object
   * @param {Boolean} settings.preview Preview bookmarks?
   * @param {Boolean} settings.extra
   * @param {Boolean} settings.autosave Save on change instead of waiting for user to save?
   * @param {Text} settings.color Base UI color as hex `RRGGBB`
   *
   */
  patchSettings(db, id, settings) {
    return db('users')
      .where({ id })
      .update(settings);
  },

  getSettings(db, id) {
    return db('users')
      .where({ id })
      .select('preview', 'extra', 'autosave', 'color');
  }
};

module.exports = UserService;
