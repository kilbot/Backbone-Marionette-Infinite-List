var Mn = require('backbone.marionette');
var hbs = require('handlebars');
var Tmpl = require('./infinite-list-view.hbs');

module.exports = Mn.CompositeView.extend({
  className: 'list-infinite',
  template: hbs.compile(Tmpl)
});