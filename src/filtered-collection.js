var _ = require('lodash');
var Parser = require('query-parser');
var parse = new Parser();

var defaultFilterName = '__default';

var queries = function(queryArray){
  return _.reduce(queryArray, function (result, value) {
    if (!result) {
      return value;
    }
    if (result.length === 1) {
      result.push(value[0]);
      return [{
        type   : 'and',
        queries: result
      }];
    }
    result[0].queries.push(value[0]);
    return result;
  });
};

module.exports = function(Collection){

  return Collection.extend({
    _filters: {},

    _filter: function(){
      var options;

      if(_.size(this._filters) !== 0){
        options = {
          data: {
            filter: {
              q: queries(this._filters),
              fields: this.fields
            }
          }
        };
      }

      return this.fetch(options);
    },

    setFilter: function(filterName, filter) {
      if(filter === undefined) {
        filter = filterName;
        filterName = defaultFilterName;
      }
      if(!filter){
        return this.removeFilter(filterName);
      }
      this._filters[filterName] = _.isString(filter) ? parse(filter) : filter;
      this.trigger('filtered:set');
      return this._filter();
    },

    removeFilter: function(filterName) {
      if (!filterName) {
        filterName = defaultFilterName;
      }
      delete this._filters[filterName];
      this.trigger('filtered:remove');
      return this._filter();
    },

    resetFilters: function() {
      this._filters = {};
      this.trigger('filtered:reset');
      return this._filter();
    },

    getFilters: function() {
      return _.keys(this._filters);
    },

    hasFilter: function(name) {
      return _.includes(this.getFilters(), name);
    }

  });
  
};