'use strict';

var express = require('express');

var router = express.Router();
var multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },

    filename: function (req, file, cb) {
        var str = file.originalname.split(".");
        console.log(str);

        cb(null, file.fieldname + '-' + Date.now() + '.' + str[str.length - 1]);
    }
});

var upload = multer({storage: storage}).single('file');


router.post('/', function (req, res)     {
    upload(req, res, function (err) {
        if (err) {
            console.log('Error Occured');
            return;
        }
		console.log('Photo Uploaded');
		console.log(req.file);
        return res.json(req.file);
    })
});

module.exports = router;
