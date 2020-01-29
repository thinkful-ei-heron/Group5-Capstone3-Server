# Group 5 Bookmark Organizer app

## Keisuke Isobe, Zayar Khin, Michael Kirsch, Zacharia Lutz

# [Bookmark Organizer](https://bookmark-organizer.now.sh/)

## Welcome to Bookmark Organizer: Make Your Bookmarks Usable Again
 Bookmark Organizer is an all-encompassing app that you can use to reorganize, search, filter, and access your bookmarks without having to go through the terrible user experience of modern browser bookmark pages.
 Modern browsers have terrible functionality for displaying, searching through, and organizing bookmarks. Bookmark Organizer has all of the tools you need to make your bookmarks usable again. 

## Bookmark Organizer in action

### Desktop List View
<img src='./src/img/Desktop_List.png' alt='Desktop List View' width='900px'/>

### Mobile Settings, Mobile List View
<img src='./src/img/Mobile_List_Settings.png' alt='Mobile Settings and Mobile List View' width='600'/>

## API Overview
```        
/api
.
├── /auth
│   └── POST    /           (log in)
│   └── PUT     /           (create JWT)
|
├── /user
│   └── GET     /lists      (get lists for user)
│   └── GET     /settings   (get settings for user)
│   └── PATCH   /settings   (update settings for user)
│   └── POST    /           (create new user)
|
├── /proxy
│   └── GET     /wayback    ()
│   └── GET     /memento    ()
|
├── /list
│   └── POST    /           (save list to user)
│   └── GET     /:list_id   (get list from user)
│   └── PUT     /:list_id   (update list for user)
```

## Features (for all users)
 :white_check_mark: Upload and export your bookmark files (supports Chrome and Firefox)

 :white_check_mark: Search through your bookmarks, differentiating between title, URL, and tags

 :white_check_mark: Rename, update URLs, and tag bookmarks

 :white_check_mark: Move bookmarks, sort, and filter through your bookmarks

## Features (for registered users)
 :white_check_mark: Users can save and load their lists of bookmarks to their account-- log in to access your saved bookmarks on browser or mobile.

 :white_check_mark: Bookmark Organizer trawls through several web archiving websites to see if your saved bookmark has an existing archive link, and allows you to save archive links as backups for your bookmarks.
 
 :white_check_mark: Users can adjust their personal settings, include showing thumbnails, autosave settings, and custom UI options. 

## Tech Specs: 
**Front-end:**
- React
- Javascript 
- HTML5
- CSS
- Bookmarks Parser NPM package
- Zeit

**Back-end**
- Node
- Express
- PostgreSQL DB hosted on Heroku
- JWT 

**Workflow**
- Agile/SCRUM 

## Future Updates
:point_right: Hotkeys and accessibility upgrades

:point_right: More drag and drop features

:point_right: Chrome extension!

## Team
<a href="https://github.com/mikirsch" target="_blank"> **Michael Kirsch**</a>: Project Manager

<a href="https://github.com/keisukeisobe" target="_blank"> **Keisuke Isobe**</a>: Product Manager

<a href="https://github.com/zkhin" target="_blank"> **Zayar Khin**</a>: Backend/Serverside Lead

<a href="https://github.com/zacharialutz" target="_blank"> **Zacharia Lutz**</a>: Frontend/Design Lead

## Links
[Server Repo](https://github.com/thinkful-ei-heron/Group5-Capstone3-Server)

[Deployed Server On Heroku](https://sleepy-scrubland-72098.herokuapp.com/)

[Deployed Client On Zeit](https://bookmark-organizer.now.sh/)

## Demo Info
- Account Username: testuser
- Account Password: p4ssw0r|)