var $ = require('cheerio');
var PricePlans = require('./price-plans');
var ParseResult = require('./parse-result');

//Parse a float
function parsef(str) {
    return parseFloat(str.replace(/,/g, ''));
}

//Parse an int
function parsei(str) {
    return parseInt(parsef(str));
}

var allowance_parsers = [];

//Parse remaining "3 to 3 Calls"
allowance_parsers.push(function (label, value, result) {
    if (/3 to 3/i.test(label)) {
        result.three_to_three_calls = parsei(value);
    }
});

//Parse remaining "Mobile Data MB"
allowance_parsers.push(function (label, value, result) {
    if (/data/i.test(label)) {
        result.mobile_data = parsei(value);
    }
});

//Parse remaining "Price Plan Flexi Units"
allowance_parsers.push(function (label, value, result) {
    if (/flexi/i.test(label)) {
        result.flexi_units = parsei(value);
    }
});

//Parse remaining "Evening & Weekend Minutes"
allowance_parsers.push(function (label, value, result) {
    if (/evening/i.test(label)) {
        result.evening_weekend_minutes = parsei(value);
    }
});

/**
 * @class Parser
 * @constructor
 */
function Parser() {}

/**
 * Parse the usage/allowance HTML document
 *
 * @param $document
 * @return {ParseResult}
 */
Parser.prototype.parse = function ($document) {
    var result = new ParseResult({date: new Date});
    var $table = $document('#allowanceRemBody');
    if ($table.length !== 1) {
        throw new Error('Allowance remaining table (#allowanceRemBody) not found.');
    }
    this.parse_remaining_allowance_table($table, result);
    this.parse_current_spend($document.html(), result);
    this.parse_price_plan($document.html(), result);
    this.map_price_plan(result);
    this.parse_days_remaining($document.html(), result);
    return result;
};

/**
 * Parse the "Remaining allowance" table
 *
 * @param $table
 * @param {ParseResult} result
 * @return {Array}
 */
Parser.prototype.parse_remaining_allowance_table = function ($table, result) {
    var $trs = $table.find('tr');
    return $trs.map(function (_, tr) {
        var $tds = $(tr).find('td');
        if ($tds.length !== 2) {
            return;
        }
        var label = $tds.eq(0).text().trim();
        var value = $tds.eq(1).text().trim();
        var results = [];
        for (var i = 0, len = allowance_parsers.length; i < len; i++) {
            var ap = allowance_parsers[i];
            results.push(ap(label, value, result));
        }
        return results;
    });
};

/**
 * Parse the "Total spend" (outside price plan)
 *
 * @param {string} html
 * @param {ParseResult} result
 */
Parser.prototype.parse_current_spend = function (html, result) {
    var match;
    var regexp = /&euro;[\s\r\n]*([0-9\.]+)/gi;
    var spends = [];
    while (match = regexp.exec(html)) {
        spends.push(parsef(match[1]));
    }
    if (spends.length > 0) {
        result.current_spend = Math.max.apply(null, spends);
    }
};

/**
 * Parse the name of the price plan
 *
 * @param {string} html
 * @param {ParseResult} result
 */
Parser.prototype.parse_price_plan = function (html, result) {
    var match;
    var regexp = /postpay price details.*?>(.*?)<\/a>/gi;
    if (match = regexp.exec(html)) {
        result.price_plan_name = match[1];
        result.price_plan_normalized = this.normalize_price_plan(result.price_plan_name);
    }
};

/**
 * Normalize the price plan name so we can look it up
 *
 * @param {string} plan_name
 * @return {string}
 */
Parser.prototype.normalize_price_plan = function (plan_name) {
    if (typeof plan_name !== 'string') {
        return null;
    }
    return plan_name.replace(/[^a-zA-Z0-9]+/g, '_').toLowerCase();
};

/**
 * Look up the number of flexi units for the price plan
 *
 * @param {ParseResult} result
 */
Parser.prototype.map_price_plan = function (result) {
    if (!result.price_plan_normalized) {
        return;
    }
    if (PricePlans.hasOwnProperty(result.price_plan_normalized)) {
        result.price_plan_flexi_units = PricePlans[result.price_plan_normalized].flexi_units;
    }
};

/**
 * Parse the number of days remaining in the current billing cycle
 *
 * @param {string} html
 * @param {ParseResult} result
 */
Parser.prototype.parse_days_remaining = function (html, result) {
    var match;
    if (match = /([0-9]+)[\s]+day/i.exec(html)) {
        result.days_remaining = parsei(match[1]);
    }
};

module.exports = Parser;
