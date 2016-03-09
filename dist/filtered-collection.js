var FilteredCollection =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* jshint -W071, -W003, -W021 */
	var _ = __webpack_require__(1);
	var Backbone = __webpack_require__(2);
	var FilteredCollection = __webpack_require__(3);
	var SortedCollection = __webpack_require__(7);
	var PaginatedCollection = __webpack_require__(9);
	var proxyCollection = __webpack_require__(4);

	//
	var proxyEvents = function proxyEvents(from, eventNames) {
	  _.each(eventNames, function(eventName) {
	    this.listenTo(from, eventName, function() {
	      var args = _.toArray(arguments);
	      args.unshift(eventName);
	      this.trigger.apply(this, args);
	    });
	  }, this);
	};

	// extend FilteredCollection with query methods
	//_.extend(FilteredCollection.prototype, query);

	function Obscura(superset, options) {
	  this._superset = superset;
	  this._filtered = new FilteredCollection(superset, options);
	  this._sorted = new SortedCollection(this._filtered, options);
	  this._paginated = new PaginatedCollection(this._sorted, options);
	  proxyCollection(this._paginated, this);
	  proxyEvents.call(this, this._filtered, filteredEvents);
	  proxyEvents.call(this, this._sorted, sortedEvents);
	  proxyEvents.call(this, this._paginated, paginatedEvents);
	  this.initialize(options);
	}

	var methods = {
	  superset: function () {
	    return this._superset;
	  },
	  getFilteredLength: function () {
	    return this._filtered.length;
	  },
	  removeTransforms: function () {
	    this._filtered.resetFilters();
	    this._sorted.removeSort();
	    this._paginated.removePagination();
	    return this;
	  },
	  destroy: function () {
	    this.stopListening();
	    this._filtered.destroy();
	    this._sorted.destroy();
	    this._paginated.destroy();
	    this.length = 0;
	    this.trigger('obscura:destroy');
	  }
	};

	var filteredMethods = [
	  'filterBy',
	  'removeFilter',
	  'resetFilters',
	  'refilter',
	  'hasFilter',
	  'getFilters'
	];
	var filteredEvents = [
	  'filtered:add',
	  'filtered:remove',
	  'filtered:reset'
	];
	var sortedMethods = [
	  'setSort',
	  'reverseSort',
	  'removeSort'
	];
	var sortedEvents = [
	  'sorted:add',
	  'sorted:remove'
	];
	var paginatedMethods = [
	  'setPerPage',
	  'setPage',
	  'getPerPage',
	  'getNumPages',
	  'getPage',
	  'hasNextPage',
	  'hasPrevPage',
	  'nextPage',
	  'prevPage',
	  'movePage',
	  'removePagination',
	  'firstPage',
	  'lastPage',
	  'appendNextPage'
	];
	var paginatedEvents = [
	  'paginated:change:perPage',
	  'paginated:change:page',
	  'paginated:change:numPages'
	];
	var unsupportedMethods = [
	  'add',
	  'create',
	  'remove',
	  'set',
	  'reset',
	  'sort',
	  'parse',
	  'sync',
	  'fetch',
	  'push',
	  'pop',
	  'shift',
	  'unshift'
	];

	_.each(filteredMethods, function (method) {
	  methods[method] = function () {
	    var result = FilteredCollection.prototype[method]
	      .apply(this._filtered, arguments);
	    return result === this._filtered ? this : result;
	  };
	});
	_.each(paginatedMethods, function (method) {
	  methods[method] = function () {
	    var result = PaginatedCollection.prototype[method]
	      .apply(this._paginated, arguments);
	    return result === this._paginated ? this : result;
	  };
	});
	_.each(sortedMethods, function (method) {
	  methods[method] = function () {
	    var result = SortedCollection.prototype[method]
	      .apply(this._sorted, arguments);
	    return result === this._sorted ? this : result;
	  };
	});
	_.each(unsupportedMethods, function (method) {
	  methods[method] = function () {
	    throw new Error(
	      'Backbone.Obscura: Unsupported method: ' +
	      method + ' called on read-only proxy'
	    );
	  };
	});

	_.extend(Obscura.prototype, methods, Backbone.Events);
	Obscura = Backbone.Collection.extend(Obscura.prototype);
	Obscura.FilteredCollection = FilteredCollection;
	Obscura.SortedCollection = SortedCollection;
	Obscura.PaginatedCollection = PaginatedCollection;
	module.exports = Obscura;
	/* jshint +W071, +W003, +W021 */

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = _;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = Backbone;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1);
	var Backbone = __webpack_require__(2);
	var proxyCollection = __webpack_require__(4);
	var backboneQuery = __webpack_require__(5);
	var Parser = __webpack_require__(6);
	var parse = new Parser();

	// Beware of `this`
	// All of the following functions are meant to be called in the context
	// of the FilteredCollection object, but are not public functions.

	function invalidateCache() {
	  this._filterResultCache = {};
	}

	function invalidateCacheForFilter(filterName) {
	  for (var cid in this._filterResultCache) {
	    if (this._filterResultCache.hasOwnProperty(cid)) {
	      delete this._filterResultCache[cid][filterName];
	    }
	  }
	}

	function addFilter(filterName, filterObj) {
	  // If we've already had a filter of this name, we need to invalidate
	  // any and all of the cached results
	  if (this._filters[filterName]) {
	    invalidateCacheForFilter.call(this, filterName);
	  }

	  this._filters[filterName] = filterObj;
	  this.trigger('filtered:add', filterName);
	}

	function removeFilter(filterName) {
	  delete this._filters[filterName];
	  invalidateCacheForFilter.call(this, filterName);
	  this.trigger('filtered:remove', filterName);
	}

	function execFilterOnModel(model) {
	  if (!this._filterResultCache[model.cid]) {
	    this._filterResultCache[model.cid] = {};
	  }

	  var cache = this._filterResultCache[model.cid];

	  for (var filterName in this._filters) {
	    if (this._filters.hasOwnProperty(filterName)) {
	      // if we haven't already calculated this, calculate it and cache
	      if (!cache.hasOwnProperty(filterName)) {
	        cache[filterName] = this._filters[filterName].fn(model, this._filters[filterName].tokens);
	      }
	      if (!cache[filterName]) {
	        return false;
	      }
	    }
	  }
	  return true;
	}

	function execFilter() {
	  var filtered = [];

	  // Filter the collection
	  if (this._superset) {
	    filtered = this._superset.filter(_.bind(execFilterOnModel, this));
	  }

	  this._collection.reset(filtered);
	  this.length = this._collection.length;
	}

	function onAddChange(model) {
	  // reset the cached results
	  this._filterResultCache[model.cid] = {};

	  if (execFilterOnModel.call(this, model)) {
	    if (!this._collection.get(model.cid)) {
	      var index = this.superset().indexOf(model);

	      // Find the index at which to insert the model in the
	      // filtered collection by finding the index of the
	      // previous non-filtered model in the filtered collection
	      var filteredIndex = null;
	      for (var i = index - 1; i >= 0; i -= 1) {
	        if (this.contains(this.superset().at(i))) {
	          filteredIndex = this.indexOf(this.superset().at(i)) + 1;
	          break;
	        }
	      }
	      filteredIndex = filteredIndex || 0;

	      this._collection.add(model, { at: filteredIndex });
	    }
	  } else {
	    if (this._collection.get(model.cid)) {
	      this._collection.remove(model);
	    }
	  }
	  this.length = this._collection.length;
	}

	// This fires on 'change:[attribute]' events. We only want to
	// remove this model if it fails the test, but not add it if
	// it does. If we remove it, it will prevent the 'change'
	// events from being forwarded, and if we add it, it will cause
	// an unneccesary 'change' event to be forwarded without the
	// 'change:[attribute]' that goes along with it.
	function onModelAttributeChange(model) {
	  // reset the cached results
	  this._filterResultCache[model.cid] = {};

	  if (!execFilterOnModel.call(this, model)) {
	    if (this._collection.get(model.cid)) {
	      this._collection.remove(model);
	    }
	  }
	}

	function onAll(eventName, model, value) {
	  if (eventName.slice(0, 7) === "change:") {
	    onModelAttributeChange.call(this, arguments[1]);
	  }
	}

	function onModelRemove(model) {
	  if (this.contains(model)) {
	    this._collection.remove(model);
	  }
	  this.length = this._collection.length;
	}

	function Filtered(superset) {
	  // Save a reference to the original collection
	  this._superset = superset;

	  // The idea is to keep an internal backbone collection with the filtered
	  // set, and expose limited functionality.
	  this._collection = new Backbone.Collection(superset.toArray());
	  proxyCollection(this._collection, this);

	  // Set up the filter data structures
	  this.resetFilters();

	  this.listenTo(this._superset, 'reset sort', execFilter);
	  this.listenTo(this._superset, 'add change', onAddChange);
	  this.listenTo(this._superset, 'remove', onModelRemove);
	  this.listenTo(this._superset, 'all', onAll);
	}

	var methods = {

	  defaultFilterName: '__default',

	  filterBy: function(filterName, filter) {
	    var filterObj;

	    // Allow the user to skip the filter name if they're only using one filter
	    if (!filter) {
	      filter = filterName;
	      filterName = this.defaultFilterName;
	    }

	    if (_.isFunction(filter)){
	      filterObj = { fn: filter };
	    } else {
	      filterObj = {
	        fn: backboneQuery,
	        tokens: this.parseFilter(filter)
	      }
	    }

	    addFilter.call(this, filterName, filterObj);

	    execFilter.call(this);
	    return this;
	  },

	  parseFilter: function(filter){
	    if (_.isArray(filter)) {
	      return filter;
	    }
	    if (_.isString(filter)) {
	      return parse(filter);
	    }
	    if (_.isObject(filter)) {
	      return _.reduce(filter, function(result, value, key){
	        result.push({
	          type: 'prefix',
	          prefix: key,
	          query: value
	        });
	        return result;
	      }, []);
	    }
	  },

	  removeFilter: function(filterName) {
	    if (!filterName) {
	      filterName = this.defaultFilterName;
	    }

	    removeFilter.call(this, filterName);

	    execFilter.call(this);
	    return this;
	  },

	  resetFilters: function() {
	    this._filters = {};
	    invalidateCache.call(this);

	    this.trigger('filtered:reset');

	    execFilter.call(this);
	    return this;
	  },

	  superset: function() {
	    return this._superset;
	  },

	  refilter: function(arg) {
	    if (typeof arg === "object" && arg.cid) {
	      // is backbone model, refilter that one
	      onAddChange.call(this, arg);
	    } else {
	      // refilter everything
	      invalidateCache.call(this);
	      execFilter.call(this);
	    }

	    return this;
	  },

	  getFilters: function() {
	    return  _.keys(this._filters);
	  },

	  hasFilter: function(name) {
	    return _.contains(this.getFilters(), name);
	  },

	  destroy: function() {
	    this.stopListening();
	    this._collection.reset([]);
	    this._superset = this._collection;
	    this.length = 0;

	    this.trigger('filtered:destroy');
	  }

	};

	// Build up the prototype
	_.extend(Filtered.prototype, methods, Backbone.Events);

	module.exports = Filtered;



/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1);
	var Backbone = __webpack_require__(2);

	// Methods in the collection prototype that we won't expose
	var blacklistedMethods = [
	  "_onModelEvent", "_prepareModel", "_removeReference", "_reset", "add",
	  "initialize", "sync", "remove", "reset", "set", "push", "pop", "unshift",
	  "shift", "sort", "parse", "fetch", "create", "model", "off", "on",
	  "listenTo", "listenToOnce", "bind", "trigger", "once", "stopListening"
	];

	var eventWhiteList = [
	  'add', 'remove', 'reset', 'sort', 'destroy', 'sync', 'request', 'error'
	];

	function proxyCollection(from, target) {

	  function updateLength() {
	    target.length = from.length;
	  }

	  function pipeEvents(eventName) {
	    var args = _.toArray(arguments);
	    var isChangeEvent = eventName === 'change' ||
	                        eventName.slice(0, 7) === 'change:';

	    // In the case of a `reset` event, the Collection.models reference
	    // is updated to a new array, so we need to update our reference.
	    if (eventName === 'reset') {
	      target.models = from.models;
	    }

	    if (_.includes(eventWhiteList, eventName)) {
	      if (_.includes(['add', 'remove', 'destroy'], eventName)) {
	        args[2] = target;
	      } else if (_.includes(['reset', 'sort'], eventName)) {
	        args[1] = target;
	      }
	      target.trigger.apply(this, args);
	    } else if (isChangeEvent) {
	      // In some cases I was seeing change events fired after the model
	      // had already been removed from the collection.
	      if (target.includes(args[1])) {
	        target.trigger.apply(this, args);
	      }
	    }
	  }

	  var methods = {};

	  _.each(_.functions(Backbone.Collection.prototype), function(method) {
	    if (!_.includes(blacklistedMethods, method)) {
	      methods[method] = function() {
	        return from[method].apply(from, arguments);
	      };
	    }
	  });

	  _.extend(target, Backbone.Events, methods);

	  target.listenTo(from, 'all', updateLength);
	  target.listenTo(from, 'all', pipeEvents);
	  target.models = from.models;

	  updateLength();
	  return target;
	}

	module.exports = proxyCollection;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1);

	function toType(obj) {
	  return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
	}

	/**
	 * Helper methods for matching tokens
	 */
	var methods = {

	  /**
	   * Token type `string`
	   * @return {Boolean}
	   */
	  string: function(token, model){
	    token = token || {};
	    if(!_.isString(token.query)){ return false; }

	    var attributes = _.chain(model.fields || ['title'])
	      .map(function(key){
	        return model.get(key); // allows nested get
	      })
	      .compact()
	      .value();

	    var self = this;
	    return _.some( attributes, function( attribute ) {
	      return self._partialString(attribute, token.query.toLowerCase());
	    });
	  },

	  /**
	   * Token type `prefix`
	   * @return {Boolean}
	   */
	  prefix: function(token, model){
	    token = token || {};
	    if(_.isFunction(token.query)){
	      return token.query(model.get(token.prefix));
	    }

	    if(!_.isString(token.query)){
	      token.query = token.query.toString();
	    }

	    var attr = model.get(token.prefix),
	        type = toType(attr);

	    // _boolean, _array etc
	    if(this.hasOwnProperty('_' + type)){
	      return this['_' + type](attr, token.query.toLowerCase());
	    }
	  },

	  /**
	   * Token type `or`
	   * @return {Boolean}
	   */
	  or: function(token, model){
	    var self = this;
	    return _.some(token.queries, function(t){
	      return self[t.type](t, model);
	    });
	  },

	  _string: function(str, value){
	    return str.toLowerCase() === value;
	  },

	  _partialString: function(str, value){
	    return str.toLowerCase().indexOf( value ) !== -1;
	  },

	  _number: function(number, value){
	    return number.toString() === value;
	  },

	  _partialNumber: function(number, value){
	    return number.toString().indexOf( value ) !== -1;
	  },

	  _boolean: function(bool, value){
	    if(value === 'true'){
	      return bool === true;
	    } else if (value === 'false'){
	      return bool === false;
	    }
	    return false;
	  },

	  _array: function(arr, value){
	    return _.some(arr, function(elem){
	      return elem.toLowerCase() === value;
	    });
	  }

	};

	module.exports = function(model, filterArray){
	  // match tokens
	  // todo: all = AND, any = OR
	  return _.every(filterArray, function(filter){
	    return methods[filter.type](filter, model);
	  });
	};

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/* jshint -W071, -W074 */
	var _ = __webpack_require__(1);

	/**
	 *
	 * @param options
	 * @constructor
	 */
	function Parser(options){
	  this.options = options || {};
	  if (!this.options.instance) {
	    return this.parse.bind(this);
	  }
	}

	/**
	 * Regex for special characters
	 */
	var regex = {
	  QUOTES      : /['"`]/,       // quotes
	  SPACES      : /[ \t\r\n]/,   // spaces
	  FLAGS       : /[~\+#!\*\/]/, // flags
	  SCREEN      : /[\\]/,        // screen
	  GROUP_OPEN  : /\(/,          // group openers
	  GROUP_CLOSE : /\)/,          // group endings
	  OR          : /\|/,          // logical OR
	  PREFIX      : /:/,           // divider between prefix and value
	  RANGE       : /-/,           // divider between values in range
	  OR_OPEN     : /\[/,          // OR group openers
	  OR_CLOSE    : /]/            // OR group endings
	};

	/**
	 * Returns first regex match for given character
	 * note: order is important!
	 * @param character
	 */
	function matchRegex(character){
	  var match;

	  _.some([
	    'SCREEN',
	    'OR_OPEN',
	    'OR_CLOSE',
	    'GROUP_OPEN',
	    'GROUP_CLOSE',
	    'OR',
	    'PREFIX',
	    'RANGE',
	    'SPACES',
	    'QUOTES',
	    'FLAGS'
	  ], function(key){
	    if(regex[key].test(character)){
	      match = key;
	      return true;
	    } else {
	      match = undefined;
	      return false;
	    }
	  });

	  return match;
	}

	/**
	 *
	 */
	function logicalOr(parts){
	  var p2 = parts.pop(),
	      p1 = parts.pop();

	  parts.push({
	    type: 'or',
	    queries: [ p1, p2 ]
	  });
	}

	/**
	 *
	 * @param options
	 */
	function appendPart(opts){
	  var part = opts.part || {};

	  if(!opts.hasarg){ return; }

	  if (['range', 'prange'].indexOf(part.type) >= 0) {
	    if(opts.buffer && _.isNaN(parseFloat(opts.buffer))){
	      part = {};
	      part.type = 'string';
	      part.query = '-' + opts.buffer;
	    } else {
	      part.to = opts.buffer;
	    }
	  } else if (opts.buffer && opts.buffer.length) {
	    part.query = opts.buffer;
	  }

	  if (!part.type) {
	    part.type = part.prefix ? 'prefix' : 'string';
	  }

	  opts.parts.push(part);

	  if (opts.or_at_next_arg && (opts.or_at_next_arg + 1 === opts.parts.length)){
	    logicalOr(opts.parts);
	    opts.or_at_next_arg = 0;
	  }

	  opts.part = {};
	  opts.buffer = '';
	  opts.hasarg = false;

	}

	/**
	 *
	 * @param options
	 * @param quote
	 */
	function inQuote(opts, quote){
	  if(this._input.length === 0){
	    return;
	  }

	  opts.character = this._input.shift();

	  if (opts.character === quote) {
	    appendPart.call(this, opts);
	  } else {
	    opts.buffer += opts.character;
	    opts.hasarg = true;
	    inQuote.call(this, opts, quote);
	  }
	}

	/**
	 *
	 */
	var matches = {

	  screen: function(opts){
	    opts.screen = true;
	  },

	  or_open: function(opts){
	    if (opts.hasarg) {
	      opts.buffer += opts.character;
	    } else {
	      opts.part.type = 'or';
	      opts.part.queries = this.parse(this._input.join(''), true);
	      if (opts.part.queries && opts.part.queries.length) {
	        opts.hasarg = true;
	        appendPart.call(this, opts);
	      }
	    }
	  },

	  or_close: function(opts){
	    opts.close = true;
	  },

	  group_open: function(opts){
	    if (opts.hasarg) {
	      opts.buffer += opts.character;
	    } else {
	      opts.part.type = 'and';
	      opts.part.queries = this.parse(this._input.join(''), true);
	      if (opts.part.queries && opts.part.queries.length) {
	        opts.hasarg = true;
	        appendPart.call(this, opts);
	      }
	    }
	  },

	  group_close: function(opts){
	    if(opts.open){
	      opts.close = true;
	      opts.open = undefined;
	    } else {
	      opts.buffer += opts.character;
	    }
	  },

	  or: function(opts){
	    opts.or_at_next_arg = opts.parts.length;
	    if (opts.hasarg) {
	      opts.or_at_next_arg += 1;
	      appendPart.call(this, opts);
	    }
	  },

	  prefix: function(opts){
	    opts.part.prefix = opts.buffer;
	    opts.part.type = 'prefix';
	    opts.buffer = '';
	    opts.hasarg = true;
	  },

	  range: function(opts){
	    if(opts.buffer && _.isNaN(parseFloat(opts.buffer))){
	      opts.buffer += opts.character;
	      return;
	    }
	    if (opts.part.type && (opts.part.type === 'prefix')) {
	      opts.part.type = 'prange';
	    } else {
	      opts.part.type = 'range';
	    }
	    opts.part.from = opts.buffer;
	    opts.buffer = '';
	    opts.hasarg = true;
	  },

	  spaces: function(opts){
	    appendPart.call(this, opts);
	  },

	  quotes: function(opts){
	    if (opts.buffer.length) {
	      opts.buffer += opts.character;
	      opts.hasarg = true;
	    } else {
	      inQuote.call(this, opts, opts.character);
	    }
	  },

	  flags: function(opts){
	    if (!opts.buffer.length) {
	      if (!opts.part.flags) { opts.part.flags = []; }
	      opts.part.flags.push(opts.character);
	    } else {
	      opts.buffer += opts.character;
	    }
	  }
	};

	/**
	 *
	 * @param options
	 */
	function next(opts){
	  opts.character = this._input.shift();
	  var match = matchRegex.call(this, opts.character);
	  if(match && !opts.screen){
	    matches[match.toLowerCase()].call(this, opts);
	  } else {
	    opts.buffer += opts.character;
	    opts.hasarg = true;
	    opts.screen = false;
	  }
	  if(this._input.length > 0 && !opts.close){
	    next.call(this, opts);
	  } else {
	    opts.close = undefined;
	    return;
	  }
	}

	Parser.prototype.parse = function(input, open) {
	  var opts = {
	    parts   : [],
	    part    : {},
	    open    : open,
	    buffer  : '',
	    hasarg  : false
	  };

	  if (!input || !input.length || (typeof input !== 'string')) {
	    return opts.parts;
	  }

	  this._input = input.split('');
	  next.call(this, opts);
	  appendPart.call(this, opts);
	  return opts.parts;
	};

	module.exports = Parser;
	/* jshint +W071, +W074 */

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	
	var _ = __webpack_require__(1);
	var Backbone =__webpack_require__(2);
	var proxyCollection = __webpack_require__(4);
	var sortedIndex = __webpack_require__(8);

	function lookupIterator(value) {
	  return _.isFunction(value) ? value : function(obj){ return obj.get(value); };
	}

	function modelInsertIndex(model) {
	  if (!this._comparator) {
	    return this._superset.indexOf(model);
	  } else {
	    return sortedIndex(this._collection.models, model, lookupIterator(this._comparator), this._reverse);
	  }
	}

	function onAdd(model) {
	  var index = modelInsertIndex.call(this, model);
	  this._collection.add(model, { at: index });
	}

	function onRemove(model) {
	  if (this.contains(model)) {
	    this._collection.remove(model);
	  }
	}

	function onChange(model) {
	  if (this.contains(model) && this._collection.indexOf(model) !== modelInsertIndex.call(this, model)) {
	    this._collection.remove(model);
	    onAdd.call(this, model);
	  }
	}

	function sort() {
	  if (!this._comparator) {
	    this._collection.reset(this._superset.toArray());
	    return;
	  }

	  // Evaluate the type of comparator based on http://backbonejs.org/#Collection-comparator
	  var newOrder;
	  if (_.isString(this._comparator) || this._comparator.length === 1) {
	    newOrder = this._superset.sortBy(this._comparator);
	  } else {
	    newOrder = this._superset.models.sort(this._comparator);
	  }
	  this._collection.reset(this._reverse ? newOrder.reverse() : newOrder);
	}

	function Sorted(superset) {
	  // Save a reference to the original collection
	  this._superset = superset;
	  this._reverse = false;
	  this._comparator = null;

	  // The idea is to keep an internal backbone collection with the paginated
	  // set, and expose limited functionality.
	  this._collection = new Backbone.Collection(superset.toArray());
	  proxyCollection(this._collection, this);

	  this.listenTo(this._superset, 'add', onAdd);
	  this.listenTo(this._superset, 'remove', onRemove);
	  this.listenTo(this._superset, 'change', onChange);
	  this.listenTo(this._superset, 'reset', sort);
	}

	var methods = {

	  setSort: function(comparator, direction) {
	    this._reverse = direction === 'desc' ? true : false;
	    this._comparator = comparator;

	    sort.call(this);

	    if (!comparator) {
	      this.trigger('sorted:remove');
	    } else {
	      this.trigger('sorted:add');
	    }

	    return this;
	  },

	  reverseSort: function() {
	    this._reverse = !this._reverse;
	    sort.call(this);

	    return this;
	  },

	  removeSort: function() {
	    this.setSort();
	    return this;
	  },

	  superset: function() {
	    return this._superset;
	  },

	  destroy: function() {
	    this.stopListening();
	    this._collection.reset([]);
	    this._superset = this._collection;
	    this.length = 0;

	    this.trigger('sorted:destroy');
	  }

	};

	// Build up the prototype
	_.extend(Sorted.prototype, methods, Backbone.Events);

	module.exports = Sorted;



/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	
	var _ = __webpack_require__(1);

	// Underscore provides a .sortedIndex function that works
	// when sorting ascending based on a function or a key, but there's no
	// way to do the same thing when sorting descending. This is a slight
	// modification of the underscore / backbone code to do the same thing
	// but descending.

	function comparatorAdapter(fieldExtractor, reverse) {
	  return function(left, right) {
	    var l = fieldExtractor(left);
	    var r = fieldExtractor(right);

	    if(l === r) return 0;

	    return reverse ? (l < r ? 1 : -1) : (l < r ? -1 : 1);
	  };
	}

	function lookupIterator(value, reverse) {
	  return value.length === 2 ? value : comparatorAdapter(value, reverse);
	}

	function sortedIndex(array, obj, iterator, reverse) {
	  iterator = iterator === null ? _.identity : lookupIterator(iterator, reverse);

	  var low = 0, high = array.length;
	  while (low < high) {
	      var mid = (low + high) >>> 1;
	    if(iterator(array[mid], obj) < 0) {
	      low = mid + 1;
	    } else {
	      high = mid;
	    }
	  }

	  return low;
	}

	module.exports = sortedIndex;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1);
	var Backbone = __webpack_require__(2);
	var proxyCollection = __webpack_require__(4);

	function getPageLimits() {
	  if(this._infinite){
	    var start = 0;
	    var end = this._collection.length;
	  } else {
	    var start = this.getPage() * this.getPerPage();
	    var end = start + this.getPerPage();
	  }
	  return [start, end];
	}

	function updatePagination() {
	  var pages = getPageLimits.call(this);
	  return this._collection.reset(this.superset().slice(pages[0], pages[1]));
	}

	function infintePagination() {
	  var start = 0;
	  var end = this._collection.length + this.getPerPage();
	  return this._collection.add(this.superset().slice(start, end));
	}

	function calcPages() {
	  var perPage = this.getPerPage();
	  var length = this.superset().length - this._collection.length;

	  var totalPages = length % perPage === 0 ?
	    (length / perPage) : Math.floor(length / perPage) + 1;

	  return totalPages + 1;
	}

	function updateNumPages() {
	  var length = this.superset().length;
	  var perPage = this.getPerPage();

	  // If the # of objects can be exactly divided by the number
	  // of pages, it would leave an empty last page if we took
	  // the floor.
	  var totalPages = length % perPage === 0 ?
	    (length / perPage) : Math.floor(length / perPage) + 1;

	  var numPagesChanged = this._totalPages !== totalPages;
	  this._totalPages = totalPages;

	  if (numPagesChanged) {
	    this.trigger('paginated:change:numPages', { numPages: totalPages });
	  }

	  // Test to see if we are past the last page, and if so,
	  // move back. Return true so that we can test to see if
	  // this happened.
	  if (this.getPage() >= totalPages) {
	    this.setPage(totalPages - 1);
	    return true;
	  }
	}

	function recalculatePagination() {
	  // reset infinite page
	  this._infinite = false;

	  if (updateNumPages.call(this)) { return; }
	  updatePagination.call(this);
	}

	// Given two arrays of backbone models, with at most one model added
	// and one model removed from each, return the model in arrayA that
	// is not in arrayB or undefined.
	function difference(arrayA, arrayB) {
	  var maxLength = _.max([ arrayA.length, arrayB.length ]);

	  for (var i = 0, j = 0; i < maxLength; i += 1, j += 1) {
	    if (arrayA[i] !== arrayB[j]) {
	      if (arrayB[i-1] === arrayA[i]) {
	        j -= 1;
	      } else if (arrayB[i+1] === arrayA[i]) {
	        j += 1;
	      } else {
	        return arrayA[i];
	      }
	    }
	  }
	}

	function onAddRemove(model, collection, options) {
	  if (updateNumPages.call(this)) { return; }

	  var pages = getPageLimits.call(this);
	  var start = pages[0], end = pages[1];

	  // We are only adding and removing at most one model at a time,
	  // so we can find just those two models. We could probably rewrite
	  // `collectionDifference` to only make on pass instead of two. This
	  // is a bottleneck on the total size of collections. I was getting
	  // slow unit tests around 30,000 models / page in Firefox.
	  var toAdd = difference(this.superset().slice(start, end), this._collection.toArray());

	  var infinite = this._infinite && options.add;
	  var toRemove;

	  if(!infinite){
	    toRemove = difference(this._collection.toArray(), this.superset().slice(start, end));
	  }

	  if (toRemove) {
	    this._collection.remove(toRemove);
	  }

	  if (toAdd) {
	    this._collection.add(toAdd, {
	      at: this.superset().indexOf(toAdd) - start
	    });
	  }
	};

	function Paginated(superset, options) {
	  // Save a reference to the original collection
	  this._superset = superset;

	  // The idea is to keep an internal backbone collection with the paginated
	  // set, and expose limited functionality.
	  this._collection = new Backbone.Collection(superset.toArray());
	  this._page = 0;
	  this.setPerPage((options && options.perPage) ? options.perPage : null);

	  proxyCollection(this._collection, this);

	  this.listenTo(this._superset, 'add remove', onAddRemove);
	  this.listenTo(this._superset, 'reset sort', recalculatePagination);
	}

	var methods = {

	  removePagination: function() {
	    this._infinite = false;
	    this.setPerPage(null);
	    return this;
	  },

	  setPerPage: function(perPage) {
	    this._perPage = perPage;
	    recalculatePagination.call(this);
	    this.setPage(0);

	    this.trigger('paginated:change:perPage', {
	      perPage: perPage,
	      numPages: this.getNumPages()
	    });

	    return this;
	  },

	  setPage: function(page) {

	    // reset infinite page
	    this._infinite = false;

	    // The lowest page we could set
	    var lowerLimit = 0;
	    // The highest page we could set
	    var upperLimit = this.getNumPages() - 1;

	    // If the page is higher or lower than these limits,
	    // set it to the limit.
	    page = page > lowerLimit ? page : lowerLimit;
	    page = page < upperLimit ? page : upperLimit;
	    page = page < 0 ? 0 : page;

	    this._page = page;
	    updatePagination.call(this);

	    this.trigger('paginated:change:page', { page: page });
	    return this;
	  },

	  getPerPage: function() {
	    return this._perPage || this.superset().length || 1;
	  },

	  getNumPages: function() {
	    if(this._infinite){
	      return calcPages.call(this);
	    } else {
	      return this._totalPages;
	    }
	  },

	  getPage: function() {
	    return this._page;
	  },

	  hasNextPage: function() {
	    return this.getPage() < this.getNumPages() - 1;
	  },

	  hasPrevPage: function() {
	    return this.getPage() > 0;
	  },

	  nextPage: function() {
	    this.movePage(1);
	    return this;
	  },

	  prevPage: function() {
	    this.movePage(-1);
	    return this;
	  },

	  firstPage: function() {
	    this.setPage(0);
	  },

	  lastPage: function() {
	    this.setPage(this.getNumPages() - 1);
	  },

	  movePage: function(delta) {
	    this.setPage(this.getPage() + delta);
	    return this;
	  },

	  superset: function() {
	    return this._superset;
	  },

	  destroy: function() {
	    this.stopListening();
	    this._collection.reset([]);
	    this._superset = this._collection;
	    this._page = 0;
	    this._totalPages = 0;
	    this.length = 0;
	    this._infinite = false;

	    this.trigger('paginated:destroy');
	  },

	  // infinite scroll
	  appendNextPage: function(){
	    this._infinite = true;
	    infintePagination.call(this);
	    this.trigger('paginated:change:page', { page: 0 });
	    return this;
	  }

	};

	// Build up the prototype
	_.extend(Paginated.prototype, methods, Backbone.Events);

	module.exports =  Paginated;

/***/ }
/******/ ]);