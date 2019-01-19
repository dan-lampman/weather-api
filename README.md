# Weather API

A simple weather API that uses virtual MongoDB to store data.

## Running Locally

```sh
$ npm install
$ npm start
```

Weather API should now be running on [localhost:9000](http://localhost:9000/) with a virtual MongoDB.

To retrieve weather for a given CSV list of cities
- GET http://localhost:9000/weather-api/cities/toronto,oakville,london,new york

## Documentation

### Database

To deliver an entire application without relying on a MongoDB installation, this solution uses [mongo-in-memory](https://www.npmjs.com/package/mongo-in-memory).
This package has several limitations and as a result, this solution does not add a TTL on the `currentWeather` collection. Current weather conditions for a given city are not propery expired.

To add a TTL on a collection for a real MongoDB database using [MongoDB](https://mongodb.github.io/node-mongodb-native/):

>`db.currentWeather.createIndex( { "createdAt": 1 }, { expireAfterSeconds: 3600 } )`

### Nginx

The Nginx configuration can be found in `/etc/nginx/conf.d/sysmon.confg`. This configuration will reverse proxy any http requests from localhost:9000 to exampledomain.ca.

