var DualCollection = require('backbone-dual-storage');

module.exports = DualCollection.extend({
  name: 'customers',
  url: 'http://localhost:3000/api/customers',

  _page: 0,

  fields: ['first_name', 'last_name'],

  appendNextPage: function(options) {
    options = options || {};
    var self = this, isNew = this.isNew();

    options.data = {
      page: ++this._page
    };
    options.remove = false;

    return this.fetch(options)
      .then(function(response){
        if(isNew && _.size(response) === 0){
          return self.firstSync();
        }
      });
  }

});