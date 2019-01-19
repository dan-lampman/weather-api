const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/', function getStatus(req, res) {
    res.status(200).send({
        response: 'SUCCESS',
        version: '1.0.0'
    });
});

module.exports = router;
