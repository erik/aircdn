var fs = require('fs');
var path = require('path');
var http = require('http');
var jsonfile = require('jsonfile');

var hosts = require('./hosts.js');


class Cache {
    constructor(cacheDir) {
        this.directory = cacheDir;
        this.files = new Set();
        this.meta = {};
        this.metaFile = path.join(cacheDir, 'meta.json');

        console.log("Using cache directory:", cacheDir);

        if (!fs.existsSync(cacheDir)) {
            console.log("... creating");
            fs.mkdirSync(cacheDir);
        }

        if (fs.existsSync(this.metaFile)) {
            console.log('... loading metadata');
            this.meta = jsonfile.readFileSync(this.metaFile);
        }

        for (let file of fs.readdirSync(cacheDir)) {
            if (file == 'meta.json') continue;

            if (!fs.lstatSync(cacheDir + '/' + file).isDirectory()) {
                console.log('... adding to cache:', file);
                this.files.add(path.join(cacheDir, file));
            }
        }
    }

    getFileName(domain, url) {
        var fname = domain + url.replace(/\//g, '_');
        return path.join(this.directory, fname);
    }

    has(domain, url) {
        return this.files.has(this.getFileName(domain, url));
    }

    get(domain, url, callback) {
        var fname = this.getFileName(domain, url);

        fs.readFile(fname, (err, data) => {
            if (err) {
                console.log('Failed reading cached file', err);
            }

            callback(err, data, this.meta[fname]);
        });
    }

    addEntry(domain, url, content, headers) {
        var fname = this.getFileName(domain, url);
        console.log('adding to cache...', fname);

        fs.writeFile(fname, content, (err) => {
            if (err) {
                console.log('Failed writing cache file:', err);
            } else {
                this.files.add(fname);
                this.meta[fname] = headers;

                jsonfile.writeFile(this.metaFile, this.meta, (err) => {
                    err && console.log('Failed to write meta:', err);
                });
            }
        });
    }


};


module.exports = Cache;
