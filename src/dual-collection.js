var _ = require('lodash');
var bb = require('backbone');
bb.sync = require('backbone-dual-storage/src/sync');

var Collection = require('./collection');
var FilteredCollection = require('./filtered-collection')(Collection);

var IDBModel = require('backbone-indexeddb/src/model')(bb.Model);
var IDBCollection = require('backbone-indexeddb/src/collection')(FilteredCollection);

var DualModel = require('backbone-dual-storage/src/model')(IDBModel);
var DualCollection = require('backbone-dual-storage/src/collection')(IDBCollection);

bb.DualCollection = DualCollection;

module.exports = DualCollection.extend({
  model: DualModel,
  name: 'customers',
  url: 'http://localhost:3000/api/customers',
  fields: ['first_name', 'last_name'],

  matchMaker: function(model, query){
    var filter = _.get(query, [0, 'prefix']);
    if(filter === 'even' && model.id % 2 === 0){
      return true;
    }
    return this.default.matchMaker.apply(this, arguments);
  }
});