const bcrypt = require('bcryptjs');
const passwordChecker = require('password-checker');
const emailValidator = require('email-validator');
const checker = new passwordChecker();

checker.requireLetters(true);
checker.requireNumbersOrSymbols(true);
checker.min_length = 8;
checker.max_length = 72; //bcrypt
//disallow params:
//active
//in_password (true to disallow passwords that contain a disallowed entry at all, default off)
//len (min length of match if in_password is on, default 4 for password list, 0 otherwise)
//disallowed lists are case-insensitive
checker.disallowNames(true);
checker.disallowWords(true);
checker.disallowPasswords(true, true, 4);

const UserService = {
  getListIds(db, user_id) {
    console.log('getListIds');
    return db.pluck('list_id').from('userlist').where('user_id', user_id);
  },
  getFolderIds(db, list_id) {
    console.log('getFolderIds');
    return db.pluck('folder_id').from('listfolder').whereIn('list_id', list_id);
  },
  getBookmarkIds(db, folder_id) {
    console.log('getBookmarkIds');
    return db.pluck('bookmark_id').from('folderbookmarks').whereIn('folder_id', folder_id);
  },
  getBookmarks(db, bookmark_ids) {
    console.log('getBookmarks');
    return db.from('bookmarks').whereIn('id', bookmark_ids);
  },
  getFolders(db, folder_ids) {
    console.log('getFolders');
    return db.from('folders').whereIn('id', folder_ids);
  },
  getLists(db, list_ids) {
    console.log('getLists');
    return db.from('lists').whereIn('id', list_ids);
  },
  hasUserWithUserName(db, username) {
    return db('users')
      .where({ username })
      .first()
      .then(user => !!user);
  },

  hasUserWitEmail(db, email) {
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
  //insert into list
  //insert into userlist
  //insert into folder
  //insert into listfolder
  //insert into bookmarks
  //insert into folderbookmarks

  insertListSimple(db, user_id){
    return db
      .insert({name: 'main'})
      .into('lists')
      .returning('*')
      .then(([list])=> list);  
  },
  insertUserlistSimple(db, user_id, list_id){
    return db
      .insert({user_id, list_id})
      .into('userlist')
      .returning('*');
  },
  insertFolderSimple(db, folder){
    
  }
};

module.exports = UserService;
