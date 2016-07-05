var dns = require('dns');
var hostile = require('hostile');

const DEFAULT_CDN_DOMAINS = [
    'cdnjs.cloudflare.com',
    'cdn.jsdelivr.net',
    'code.jquery.com',
    // TODO: add more things here
];

var dns_cache = {};


function cleanup(domains, err) {
    console.log('Cleaning up hosts file.');

    for (let domain of domains) {
        hostile.remove('127.0.0.1', domain);
    }

    err && console.log("error -> ", err.stack);
    process.exit(1);
}

exports.install = function(domains) {
    domains = domains || DEFAULT_CDN_DOMAINS;

    console.log("Modifying hosts file:");

    for (let domain of domains) {
        // TODO: install these IPs later if we end up being online.
        dns.resolve(domain, (err, addresses) => {
            if (!err) {
                console.log('...', domain, '->', addresses[0]);
                dns_cache[domain] = addresses[0];
            }
        });

        hostile.set('127.0.0.1', domain);
    }

    // Make sure we clean up after ourselves
    process.on('exit', () => cleanup(domains));
    process.on('SIGINT', () => cleanup(domains));
    process.on('uncaughtException', (err) => cleanup(domains, err));

};

exports.dns_cache = dns_cache;
