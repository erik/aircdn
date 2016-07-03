var fs = require('fs');
var http = require('http');

var isOnline = require('is-online');

var hosts = require('./hosts.js');


class Cache {
    constructor(cacheDir) {
        this.directory = cacheDir;
        this.files = [];

        console.log("Using cache directory:", cacheDir);

        if (!fs.existsSync(cacheDir)) {
            console.log("... creating");
            fs.mkdirSync(cacheDir);
        }

        for (let file of fs.readdirSync(cacheDir)) {
            if (!fs.lstatSync(cacheDir + '/' + file).isDirectory()) {
                console.log('... adding to cache:', file);
                this.files.push(file);
            }
        }
    }

    handleRequest(req, res) {
        var domain = req.headers.host;
        var path = req.originalUrl;

        console.log('->', domain, path);

        isOnline((err, online) => {
            if (online) {
                var opts = {
                    hostname: hosts.dns_cache[domain],
                    port: req.port,
                    path: path,
                    headers: req.headers,
                    method: req.method
                };

                // TODO: handle https
                var proxy_req = http.request(opts, (proxy_res) => {
                    proxy_res.addListener('data', (chunk) => {
                        res.write(chunk, 'binary');
                    });

                    proxy_res.addListener('end', () => res.end());
                    res.writeHead(proxy_res.statusCode, proxy_res.headers);
                });

                proxy_req.end();
            }
        });
    }


};


module.exports = Cache;
