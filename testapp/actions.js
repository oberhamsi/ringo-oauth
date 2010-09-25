var {Response} = require('ringo/webapp/response');
var config = require('./config');
var {requestSigner} = require('ringo/oauth');
var {request} = require('ringo/httpclient');

exports.index = function (req) {

    // you can hold on to that function for future calls
    var signFn = requestSigner(config.oAuthConfig.consumer, req.session.data.oAuthToken);
    var response = request({
        url: "http://twitter.com/statuses/mentions.xml",
        beforeSend: signFn,
    });

    return Response.skin(module.resolve('skins/index.html'), {
        title: "You are logged in.",
        dump: response.content,
    });
};
