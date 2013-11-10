var Download = require('./download');
var Account = require('./account');

var noop = function () {};

function get_usage(username, password, cb) {
    cb = cb || noop;
    var account = new Account(username, password);
    var download = new Download(account);
    download.get_usage(cb);
}

module.exports.get_usage = get_usage;
