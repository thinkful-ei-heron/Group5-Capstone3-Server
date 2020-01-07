const UserService = {
  getListIds(db, user_id){
    return db.from('userlist').whereIn('user_id', user_id);
  },
  getFolderIds(db, list_id){
    return db.from('listfolder').whereIn('list_id', list_id);
  },
  getBookmarkIds(db, folder_id){
    return db.from('folderbookmarks').whereIn('folder_id', folder_id);
  },
  getBookmarks(db, bookmark_ids){
    return db.from('bookmarks').whereIn('id', bookmark_ids);
  },
  getFolders(db, folder_ids){
    return db.from('folders').whereIn('id', folder_ids);
  },
  getLists(db, list_ids){
    return db.from('lists').whereIn('id', list_ids);
  }
};

module.exports = UserService;