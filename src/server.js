const express = require('express');
const app = express();
const MongoInMemory = require('mongo-in-memory');
const request = require('request-promise');

const port = process.env.PORT || 9000;
const openWeatherKey = 'f8834164e9016e7faf70fff59ef53ccc';
const openWeatherUri = 'http://api.openweathermap.org/data/2.5/weather?q=';
const mongoDBPort = 8000;
const mongoDBName = 'currentWeather';
const mongoServerInstance = new MongoInMemory(mongoDBPort);
let cacheTimeMS = 60000;

function checkMongoCache(city) {
    return new Promise((resolve, reject) => {
        mongoServerInstance.getDocument(mongoDBName, 'cityWeather', city, (error, document) => {
            if (error) {
                console.log(error);
                reject(error);
            }

            if (document !== null) {
                console.log('document already exists in mongo: ' + city);
                resolve(document)
                return;
            }
            resolve(null);
        });
    });
};

function roundMilliseconds(ms) {
    var d = new Date();
    return Math.floor(d.getTime()/ms);
}

app.get('/weather-api/cities/:cityList', async(req, res) => {
    const cities = req.params.cityList ? req.params.cityList.toString().split(',') : [];
    const weatherRequests = [];
    const response = [];

    if (cities.length < 2) {
        res.status(404).send({
            message: 'Missing parameter: a minimum of two city names is required'
        })
        return;
    }

    for (let i = 0; i < cities.length; i++) {
        try {
            const city = cities[i];
            const timeKey = roundMilliseconds(cacheTimeMS);
            const existingDoc = await checkMongoCache(`${city}-${timeKey}`);

            if (existingDoc !== null) {
                response.push(existingDoc);
            } else {
                weatherRequests.push(request.get(`${openWeatherUri}${city}&apikey=${openWeatherKey}`));
            }
        } catch (someError) {
            console.log(someError);
        }

    }

    Promise.all(weatherRequests).then((weatherResponse) => {
        weatherResponse.forEach((rawCityWeather) => {
            const cityWeather = JSON.parse(rawCityWeather);
            const timeKey = roundMilliseconds(cacheTimeMS);
            cityWeather._id = cityWeather.name.toString().toLowerCase() + '-' + timeKey;
            cityWeather.auditDate = (new Date).getTime();

            mongoServerInstance.addDocument(mongoDBName, 'cityWeather', cityWeather, (error, documentObjectAdded) => {
                if (error) {
                    console.log(error);
                    res.status(500).send(error);
                    return;
                }

                console.log('added document to Mongo with key: ' + cityWeather._id);
            });

            response.push(cityWeather);
        });
        res.status(200).send(response);
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
        console.log('Host ' + config.host);
        console.log('Port ' + config.port);

        const mongouri = mongoServerInstance.getMongouri(mongoDBName);
        console.log('MongoDB running on ' + mongouri);
    }
});

app.listen(port, () => {
    process.argv.forEach(function (val, index) {
        if (parseInt(val)) {
            cacheTimeMS = val;
            console.log('cacheTimeSeconds: ' + cacheTimeMS);
        }
      });

    console.log('weather-api listening on: ' + port);
});

module.exports = app;