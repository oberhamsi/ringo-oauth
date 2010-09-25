var oAuthConfig = exports.oAuthConfig = {
    protectedPaths: ['/'],
    consumer: {
        key: 'gmZfYHVNwFQdbmtSG8VBlQ',
        secret: 'uTMYmDxx9Y5CpmV7or0zMydoMihOGq17SVJujo8UG0Q',
    },
    provider: {
        name: 'Twitter',
        image: 'http://a0.twimg.com/images/dev/buttons/sign-in-with-twitter-l.png',
        urls: {
            requestToken: 'http://twitter.com/oauth/request_token',
            accessToken: 'http://twitter.com/oauth/access_token',
            authorize: 'http://twitter.com/oauth/authorize',
            // unused for now authenticate: 'http://twitter.com/oauth/authenticate',
        },
        callback: {
            host: 'http://localhost:8080',
            path: '/oauth/callback/',
        }
    }
};

exports.middleware = [
    require('ringo/oauth/middleware').middleware(oAuthConfig),
    require('ringo/middleware/gzip').middleware,
    require('ringo/middleware/etag').middleware,
    require('ringo/middleware/static').middleware(module.resolve('public')),
    require('ringo/middleware/responselog').middleware,
    require('ringo/middleware/error').middleware,
    require('ringo/middleware/notfound').middleware,
];

exports.app = require('ringo/webapp').handleRequest;

exports.macros = [
    require('ringo/skin/macros'),
    require('ringo/skin/filters'),
];

exports.charset = 'UTF-8';
exports.contentType = 'text/html';

exports.urls = [
    ['/', require('actions')],
];

