/**
 * Stores the Three usage/allowance data
 *
 * @param {Object} initial
 * @constructor
 */
function ParseResult(initial) {
    //Date data was downloaded
    this.date = new Date();

    //Remaining mobile data allowance (MB)
    this.mobile_data = 0;

    //Remaining Three-to-Three calls
    this.three_to_three_calls = 0;

    //Remaining flexi units
    this.flexi_units = 0;

    //Remaining evening and weekend minutes
    this.evening_weekend_minutes = 0;

    //Days remaining in the current billing cycle
    this.days_remaining = 0;

    //Current spend (outside the price plan) in euro
    this.current_spend = null;

    //The name of the price plan (verbatim from the allowance page)
    this.price_plan_name = null;
    //The normalized name of the price plan (e.g. 'mini_flex_max')
    this.price_plan_normalized = null;

    //Total number of flexi units in the price plan
    this.price_plan_flexi_units = null;

    //Load the initial values into the class
    Object.keys(initial || {}).forEach(function (key) {
        if (this.hasOwnProperty(key)) {
            this[key] = initial[key];
        } else {
            throw new Error("Unsupported property '" + key + "'");
        }
    }, this);
}

module.exports = ParseResult;
