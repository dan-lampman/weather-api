# Rhovepad API

A recommendation system for a social music player ecosystem.

## Running Locally

```sh
$ npm install
$ npm start
```

Rhovepad-API should now be running on [localhost:3000](http://localhost:3000/) with an existing database of the provided music (music.JSON).

To populate user listening and following relationships,
- POST http://localhost:3000/rhovepad-api/init
- This functionality has been purposefully moved to a single route so that the database can be updated during runtime without needing to restart the server.

## Running Tests

```sh
$ npm test
```

This will create a coverage report at `coverage/index.html`.

# Documentation


## User Routes

User routes have been defined under `rhovepad-api/user/:userID` instead of using routes against the API root. This change allows for a more RESTful implementation.

### Music Recommendations

- GET `rhovepad-api/user/:userID/recommendations`
- Other parameters: none
- Returns a list of music IDs that the user has not listened to based first and second degree followers of the user. This is a curated list that does not included duplicates or songs the user has already listened to.

### View All Users

- GET `rhovepad-api/user/viewAll`
- Other parameters: none
- Returns a list of all users including their follower relationships and the IDs of music that they have already listened.

### Follow

- POST `rhovepad-api/user/follow`
- Other parameters: body: `from` (string), `to` (string)
- Adds `from` as a follower of `to`. If this relationship already exists, nothing is done and the API returns 200.

### Listen

- POST `rhovepad-api/user/listen`
- Other parameters: body: `user` (string), `music` (string)
- Adds `music` as a song that `user` has listened to. If this relationship already exists, nothing is done and the API returns 200.

## Admin Routes

### Init

- POST `rhovepad-api/init`
- Other parameters: none
- Consumes `listen.JSON` and `follows.json` in order to populate user and music relationships.

## Other Routes

### Get Music

- GET `rhovepad-api/music`
- Returns list of music

### Status

- GET `rhovepad-api/status`
- Other parameters: none
- Returns server status