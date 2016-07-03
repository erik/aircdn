#!/usr/bin/env node

var program = require('commander');
var fs = require('fs');
var is_root = require('is-root');

var server = require('./src/server.js');

const DEFAULT_CACHE_DIR = '/tmp/aircdn/';

program
    .option('-p, --port [port]', 'HTTP Port', 80)
    .option('-P, --https-port [port]', 'HTTPS port', 443)
    .option('-d, --cache-dir [directory]', 'Cache location', DEFAULT_CACHE_DIR)
    .parse(process.argv);


if (!is_root()) {
    console.log("aircdn requires root privileges");
    process.exit(1);
}

server.start(program);
