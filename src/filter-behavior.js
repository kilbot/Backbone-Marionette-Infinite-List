var Mn = require('backbone.marionette');
var _ = require('lodash');

module.exports = Mn.Behavior.extend({

  ui: {
    search: 'input[type=search]',
    clear : '*[data-action="clear"]',
    sync  : '*[data-action="sync"]'
  },

  events: {
    'keyup @ui.search': 'search',
    'click @ui.clear' : 'clear',
    'click @ui.sync'  : 'sync'
  },

  /**
   *
   */
  search: function(){
    var value = this.ui.search.val();
    if( value === '' ){
      return this.clear();
    }
    this.query(value);
  },

  query: _.debounce( function(value){
    this.view.collection.setFilter('search', value);
  }, 149),

  sync: function(e){
    if(e) { e.preventDefault(); }
    this.view.collection.fullSync();
  },

  clear: function(e) {
    if(e) { e.preventDefault(); }
    this.view.collection.removeFilter('search');
    this.ui.search.val('');
  }

});