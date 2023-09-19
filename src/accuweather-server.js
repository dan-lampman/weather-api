const express = require('express');
const app = express();
const Status = require('./routes/status');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoInMemory = require('mongo-in-memory');
const request = require('request-promise');

const port = process.env.PORT || 3000;
const accuApiKey = '0v4SufzOkQH7TwbzksUyQIO0EcXBpAYJ';
const accuLocationUri = 'http://dataservice.accuweather.com/locations/v1/search?q=';
const accuWeatherUri = 'http://dataservice.accuweather.com/currentconditions/v1/';
const mongoDBPort = 8000;
const mongoDBName = 'currentWeather';
const mongoServerInstance = new MongoInMemory(mongoDBPort);

app.get('/weather-api/cities/:cityList', (req, res) => {
    const cities = req.params.cityList ? req.params.cityList.toString().split(',') : [];
    const locationRequests = [];
    const weatherRequests = [];
    const weatherResponse = [];

    if (cities.length < 2) {
        res.status(404).send({
            message: 'Missing parameter: a minimum of two city names is required'
        })
    }

    const collection = mongoServerInstance.connections;

    if (collection.currentWeather) {
        collection.find({}).toArray(function(err, items) {
            console.log(items);
        });
    }

    cities.forEach((city) => {
        console.log(`${accuLocationUri}${city}?${accuApiKey}`);
        weatherRequests.push(request.get(`${accuLocationUri}${city}&apikey=${accuApiKey}`));
    });

    Promise.all(locationRequests).then((locationResponse) => {
        locationResponse.forEach((location) => {
            if (location === '') {
                res.status(404).send('Cannot find city');
                return;
            }

            const key = JSON.parse(location)[0].Key || null;

            if (key) {
                weatherRequests.push(request.get(`${accuWeatherUri}${key}?apikey=${accuApiKey}`));
            }
        });

        Promise.all(weatherRequests).then((weatherResponse) => {
            locationResponse.forEach((location) => {
                const weather = JSON.parse(location)[0] || null;

                mongoServerInstance.addDocument(mongoDBName, 'cityWeather', weather, (error, documentObjectAdded) => {
                    if (error) {
                        console.log(error);
                        res.status(500).send(error);
                        return;
                    }

                    console.log('added document to Mongo');
                });

                weatherResponse.push(weather);
            });

            res.status(200).send(weatherResponse);
        })
    }).catch((locationError) => {
        res.status(500).send(locationError);
    })
});

app.get('/', (req, res) => {
    res.send('Hello! weather-api is at ' + req.get('host') + '/weather-api');
});

mongoServerInstance.start((error, config) => {
    if (error) {
        console.error(error);
    } else {

        //callback when server has started successfully

        console.log("HOST " + config.host);
        console.log("PORT " + config.port);

        const mongouri = mongoServerInstance.getMongouri(mongoDBName);
        console.log('MongoDB running on ' + mongouri);
    }
});

app.listen(port, () => {
    console.log('weather-api listening on: ' + port);
});

module.exports = app;
