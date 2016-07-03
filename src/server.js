var express = require('express');
var http = require('http');
var request = require('request');

var hosts = require('./hosts.js');
var Cache = require('./cache.js');

var app = express();
var cache;

app.get('/_info', (req, res) => {
    res.json({cached: cache.files});
});

app.get(/\/.*/, (req, res) => cache.handleRequest(req, res));

exports.start = function(options) {
    cache = new Cache(options.cacheDir);
    hosts.install();

    app.listen(options.port, () => {
        console.log("Routing HTTP on", options.port);
    });

    app.listen(options.httpsPort, () => {
        console.log("Routing HTTPS on", options.httpsPort);
    });

};
