/**
 * @fileOverview
 * OAuth1.0a helpers for ringo webapps.
 */
var {JettyOAuthConsumer} = require('ringo/signpost');

/** 
 * @returns {Function} a function to sign ringo/httpclient requests. use as `beforeSend` parameter
 *                      in `request()`.
 * @param {Object} consumer must contain `key` and `secret`.
 * @param {Object} userToken must contain `accessToken` and `tokenSecret`.
 */

exports.requestSigner = function(consumer, userToken) {
    /**
     * @ignore
     * @see {ringo/httpclient}
     */
    function getRequestSigner(userToken) {
        if (!userToken || !userToken.accessToken || !userToken.tokenSecret) {
            throw new Error('Missing user access token');
        }
        consumer.setTokenWithSecret(userToken.accessToken, userToken.tokenSecret);
        return function(exchange) {
            consumer.sign(exchange.contentExchange);
        }
    };
  
    var consumer = new JettyOAuthConsumer(consumer);
    return getRequestSigner(userToken);
};
