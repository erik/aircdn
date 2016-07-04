var express = require('express');
var http = require('http');
var isOnline = require('is-online');

var hosts = require('./hosts.js');
var Cache = require('./cache.js');

var app = express();
var cache;

app.get('/_info', (req, res) => {
    res.json({cached: cache.files});
});

app.get(/\/.*/, (req, res) => {
    var domain = req.headers.host;
    var path = req.originalUrl;

    isOnline((err, online) => {
        if (online) {
            var opts = {
                hostname: hosts.dns_cache[domain],
                port: req.port,
                path: path,
                headers: req.headers,
                method: req.method
            };

            var buffer = '';

            // TODO: handle https
            var proxy_req = http.request(opts, (proxy_res) => {
                proxy_res.addListener('data', (chunk) => {
                    res.write(chunk, 'binary');
                    buffer += chunk;
                });

                proxy_res.addListener('end', () => {
                    res.end();
                    cache.addEntry(domain, path, buffer, proxy_res.headers);
                });

                res.writeHead(proxy_res.statusCode, proxy_res.headers);
            });

            proxy_req.end();
        } else if (cache.has(domain, path)) {
            cache.get(domain, path, (err, data, headers) => {
                res.writeHead(200, headers);
                res.write(data);
                res.end();
            });
        } else {
            res.sendStatus(404);
        }
    });
});


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
