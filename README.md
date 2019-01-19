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

Weather data is cached according to the third parameter passed to node e.g.,
> `node src/server.js 30000`

will result in MongoDB caching every 30000 milliseconds. The default value is 60000 milliseconds.

### Nginx

The Nginx configuration can be found in `/etc/nginx/conf.d/sysmon.confg`. This configuration will reverse proxy any http requests from localhost:9000 to exampledomain.ca.

