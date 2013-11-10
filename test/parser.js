var fs = require('fs'),
    assert = require('assert'),
    $ = require('cheerio'),
    Parser = require('../parser');

var html = fs.readFileSync(__dirname + '/balance.html', {encoding: 'utf8'});
var $document = $.load(html);

describe('Parser', function () {
    var parser = new Parser;

    describe('#parse()', function () {
        var parse_result = parser.parse($document);
        it('should parse the remaining data allowance', function () {
            assert.equal(2096007, parse_result.mobile_data);
        });
        it('should parse the remaining three to three calls', function () {
            assert.equal(2998, parse_result.three_to_three_calls);
        });
        it('should parse the remaining flexi units', function () {
            assert.equal(341, parse_result.flexi_units);
        });
        //TODO: Evening/weekend minutes (I no longer have it as part of my plan)
        it('should parse the days remaining in the billing cycle', function () {
            assert.equal(18, parse_result.days_remaining);
        });
        it('should parse the current spend (outside price plan)', function () {
            assert.equal(0.61, parse_result.current_spend);
        });
        it('should parse the price plan name', function () {
            assert.equal('Classic Flex Max 350', parse_result.price_plan_name);
            assert.equal('classic_flex_max_350', parse_result.price_plan_normalized);
            assert.equal(350, parse_result.price_plan_flexi_units);
        });

        it('should handle a empty document', function () {
            assert.throws(function () {
                parser.parse($.load(''));
            }, Error, 'Parser should throw an error if table missing');
        });
    });
});
