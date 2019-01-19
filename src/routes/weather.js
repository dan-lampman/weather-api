const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const request = require('request-promise');

const accuApiKey = '0v4SufzOkQH7TwbzksUyQIO0EcXBpAYJ';
const accuLocationUri = 'http://dataservice.accuweather.com/locations/v1/search?q=';
const accuWeatherUri = 'http://dataservice.accuweather.com/currentconditions/v1/';

router.use(bodyParser.urlencoded({ extended: true }));

router.get('/cities/:cityList',  (req, res) => {
    const cities = req.params.cityList ? req.params.cityList.toString().split(',') : [];
    const locationRequests = [];
    const weatherRequests = [];
    const weatherResponse = [];


    if (cities.length < 2) {
        res.status(404).send({
            message: 'Missing parameter: a minimum of two city names is required'
        })
    }


    cities.forEach((city) => {
        console.log(`${accuLocationUri}${city}?${accuApiKey}`);
        locationRequests.push(request.get(`${accuLocationUri}${city}&apikey=${accuApiKey}`));
    });

    Promise.all(locationRequests).then((locationResponse) => {
        locationResponse.forEach((location) => {
            if (location === '') {
                res.status(404).send('Cannot find city');
                return;
            }

            const key = JSON.parse(location)[0].Key || null;
            weatherRequests.push(request.get(`${accuWeatherUri}${key}?apikey=${accuApiKey}`));
        });

        Promise.all(weatherRequests).then((weatherResponse) => {
            locationResponse.forEach((location) => {
                const weather = JSON.parse(location)[0] || null;
                weatherResponse.push(weather);
            });

            res.status(200).send(weatherResponse);
        })
    }).catch((locationError) => {
        res.status(500).send('Location lookup error');
    })
});

module.exports = router;