# Node.js API Client For Three.ie

A screen-scraping API for Three.ie Bill Pay accounts.

This package is 100% unofficial and 100% powered by screen scraping.

## Installation

The following will install this package and add it as a dependency to your project:

    npm install --save three-ie

## Usage

Require the package `three-ie` after installing with npm.

The most basic usage is a simple static call to `ThreeIE.get_usage` with a username (usually phone number), password and callback function.

```javascript
var ThreeIE = require('three-ie');

ThreeIE.get_usage('0861234567', 'password1', function (err, balance) {
    if (err) {
        console.error(err);
    } else {
        console.log("Remaining flexi units: ". balance.flexi_units);
    }
});
```

## License

This project is released under the MIT License.
