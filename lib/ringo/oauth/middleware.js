/**
 * @fileOverview 
 *
 * The middleware takes care of a three legged oAuth process, in particular:
 *
 *   * displays a simple sign in page using the config.provider.name and config.provider.image
 *   * handles the callback by the provider (no need to add a callback path to your url config)
 *
 * Once authorization is finished it redirects back to the originally request path
 * in your app. At this point `req.session.oAuthToken` is set and contains the `accessToken`
 * and `tokenSecret` to be used for signing requests to a protected url.
 *
 *  
 */

var {Session} = require('ringo/webapp/request');
var {Consumer, Provider} = require('ringo/signpost');

/**
 * @param {Object} config
 * @example
 *   oAuthConfig = {
 *       protectedPaths: ['/'],
 *       consumer: {
 *           key: 'XXXXXXX',
 *           secret: 'XXXXXX',
 *
 *       },
 *       provider: {
 *           name: 'Twitter',
 *           image: 'http://example.com/oauth/provider-signin.png',
 *           urls: {
 *               requestToken: 'http://example.com/oauth/request_token',
 *               accessToken: 'http://example.com/oauth/access_token',
 *               authorize: 'http://example.com/oauth/authorize',
 *           },
 *           callback: {
 *               host: 'http://localhost:8080',
 *               path: '/oauth/callback/',
 *           }
 *       }
 *   };
 *
 *   middleware = [
 *       require('ringo/oauth/middleware').middleware(oAuthConfig),
 *   ];
 */
exports.middleware = function(config) {
    var provider = new Provider(config.provider);

    return function (app) {
        return function (req) {
            var path = (req.scriptName + req.pathInfo).replace(/\/+/g, '/');
            // bad idead if session data is transmitted to client.
            var session = new Session(req);
            
            // 2) provider is calling us back?
            if (provider.isCallbackPath(path)) {
                session.data.oAuthToken = provider.retrieveAccessToken(session.data.oAuthToken.consumer, req);
                session.data.oAuthToken.isAuthorized = true;
                var location = provider.getProtectedPath(req);
                return {
                    status: 303,
                    headers: {Location: location},
                    body: ["See other: " + location]
                };
            }
            
            var doAuth = config.protectedPaths.indexOf(path) == 0;
            if (doAuth) {
                // FIXME if if we have access token we need to verify user is
                // still logged in by doing call to urls.authorize.
                if (session.data.oAuthToken && session.data.oAuthToken.isAuthorized === true) {
                    return app(req);
                }
                // 1) send to sign in / authorize page and keep consumer.
                var consumer = new Consumer(config.consumer)
                session.data.oAuthToken = {
                    consumer: consumer,
                    isAuthorized: false,
                }
                var authUrl = provider.retrieveSignInUrl(consumer, path);
                return {
                    status: 200,
                    headers: {
                        'Content-Type': 'text/html',
                    },
                    body: [
                        '<html><head><title>Sign in</title></head>',
                        '<body><h1>Sign in with ' + config.provider.name + '</h1>',
                        '<a href="' + authUrl + '">',
                        '<img src="' + config.provider.image + '">',
                        '</a>',
                        '</body></html>'
                    ]
                };
            }
            return app(req);
        }
    }
};
