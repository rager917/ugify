# ugify
Chrome extension: pretty display for the [Technion grade-sheet](http://ug3.technion.ac.il/Tadpis.html)

[Available at the webstore](https://chrome.google.com/webstore/detail/bgdphblhdngheddjhkiojiilhaadoedo?utm_source=chrome-app-launcher-info-dialog)

## Important files

[`backcground.js`](background.js): manipulates the headers, to get the right charset/encoding

[`main.js`](main.js): manipulates the actual content of the page

[`manifest.json`](manifest.json): metadata. Defines what happens and when.

`*.html`: layouts for the new pages

The code is written using [ECMA Script 6](http://es6-features.org/) (aka Javascript 6), [jQuery](https://jquery.com/) and [Bootstrap](http://getbootstrap.com/).

## Related

Gai Shaked's [system](http://technion.ac.il/~gai/cm/)

[An android App](https://bitbucket.org/tomer90/whatif-gpa-manipulation/src/master/app/build/outputs/apk/?at=master) by Tomer Zeltzer

Course metadata as JSON file: https://github.com/elazarg/ug-data
