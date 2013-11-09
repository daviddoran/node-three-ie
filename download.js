var async = require('async');
var request = require('request');
var cheerio = require('cheerio');
var Parser = require('./parser');

function TokenError() {}
TokenError.prototype = Error;
TokenError.prototype.constructor = TokenError;

var URIs = {
    LoginTicketURL: 'https://sso.three.ie/mylogin/',
    LoginURL: 'https://sso.three.ie/mylogin/?service=https%3A%2F%2Fmy3account.three.ie%2FThreePortal%2Fappmanager%2FThree%2FMy3ROI',
    MyAllowanceURL: 'https://my3account.three.ie/My_allowance'
};

/**
 * Download the Three allowance/usage page
 *
 * Disclaimer: The whole process is truly horrible and complicated
 * and will probably break frequently and without notice. I tried a
 * few times to divine the exact cookies and tokens that the allowance
 * page checks for (to simplify the process) but it seems that there's no way
 * to get around the 4 or 5 HTTP requests required to fake the login,
 * exchange the SSO (Single Sign-On) token on the main site, etc.
 *
 * @param {Account} account
 * @constructor
 */

function Download(account) {
    this.debugging = false;
    this.account = account;
    var jar = request.jar();
    var options = {
        followRedirect: false,
        followAllRedirects: true,
        jar: jar,
        timeout: 30 * 1000
    };
    if (this.debugging) {
        options.strictSSL = false;
        options.proxy = 'http://127.0.0.1:8080';
    }
    this.request = request.defaults(options);
    this.$get = $get.bind(this);
}

Download.prototype.get_usage = function (callback) {
    var tasks = [
        getTicket.bind(this),
        doLogin.bind(this),
        getRedirectTicket.bind(this),
        getUsageDocument.bind(this),
        parseUsage.bind(this)
    ];
    return async.waterfall(tasks, callback);
};

function $get(uri, next) {
    return this.request(uri, function (error, response, body) {
        if (error || [200, 301, 302].indexOf(parseInt(response != null ? response.statusCode : void 0)) === -1) {
            var message = error ? error.message : "" + response.statusCode + " " + (response != null ? response.statusText : void 0);
            return next(new TokenError(message));
        } else {
            return next(null, cheerio.load(body));
        }
    });
}

function getTicket(next) {
    return this.$get(URIs.LoginTicketURL, function (error, $document) {
        if (error != null) {
            return next(error);
        }
        var $lt = $document('input[name=lt]');
        if ($lt.length) {
            return next(null, $lt.val());
        } else {
            return next(new TokenError('Login ticket input element not found'));
        }
    });
}

function doLogin(token, next) {
    var callback = function (error, response, body) {
        return next(error, token);
    };
    return this.request.post({
        url: URIs.LoginURL,
        form: {
            username: this.account.username,
            password: this.account.password,
            lt: token
        }
    }, callback);
}

function getRedirectTicket(ticket, next) {
    return this.$get(URIs.MyAllowanceURL, function (error, $document) {
        var url_with_ticket = $document('body a').attr('href');
        return next(error, url_with_ticket);
    });
}

function getUsageDocument(url_with_ticket, next) {
    return this.$get(url_with_ticket, function (error, $document) {
        return next(error, $document);
    });
}

function parseUsage($document, next) {
    var parser = new Parser;
    return next(null, parser.parse($document));
}

module.exports = Download;
