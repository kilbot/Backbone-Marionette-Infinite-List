var Mn = require('backbone.marionette');
var _ = require('lodash');

var Filter = Mn.Behavior.extend({

  ui: {
    searchField : 'input[type=search]',
    sync        : '*[data-action="sync"]'
  },

  events: {
    'keyup @ui.searchField' : 'query',
    'click @ui.sync'        : 'sync'
  },

  /**
   *
   */
  query: function(){
    var value = this.ui.searchField.val();
    this.fetch(value);
  },

  fetch: _.debounce( function(value){
    this.view.collection.fetch({
      data: {
        filter: {
          q: value,
          fields: this.view.collection.fields
        }
      }
    });
  }, 149),

  sync: function(e){
    if(e) { e.preventDefault(); }
    this.view.collection.fullSync();
  }

});

module.exports = Filter;