var DualCollection =
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

	var _ = __webpack_require__(1);
	var bb = __webpack_require__(2);
	bb.sync = __webpack_require__(3);

	var Collection = __webpack_require__(5);
	var FilteredCollection = __webpack_require__(6)(Collection);

	var IDBModel = __webpack_require__(8)(bb.Model);
	var IDBCollection = __webpack_require__(9)(FilteredCollection);

	var DualModel = __webpack_require__(13)(IDBModel);
	var DualCollection = __webpack_require__(14)(IDBCollection);

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

	var bb = __webpack_require__(2);
	var ajaxSync = bb.sync;
	var idbSync = __webpack_require__(4);

	module.exports = function(method, entity, options) {
	  if( !options.remote && entity.db ) {
	    return idbSync.apply(this, arguments);
	  }
	  return ajaxSync.apply(this, arguments);
	};

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var bb = __webpack_require__(2);

	/* jshint -W074 */
	module.exports = function(method, entity, options) {
	  var isModel = entity instanceof bb.Model;

	  return entity.db.open()
	    .then(function () {
	      switch (method) {
	        case 'read':
	          if (isModel) {
	            return entity.db.get(entity.id);
	          }
	          return entity.db.getBatch(options);
	        case 'create':
	          return entity.db.add(entity.toJSON())
	            .then(function (key) {
	              return entity.db.get(key);
	            });
	        case 'update':
	          return entity.db.put(entity.toJSON())
	            .then(function (key) {
	              return entity.db.get(key);
	            });
	        case 'delete':
	          if (isModel) {
	            return entity.db.delete(entity.id);
	          }
	          return;
	      }
	    })
	    .then(function (resp) {
	      if (options.success) {
	        options.success(resp);
	      }
	      return resp;
	    })
	    .catch(function (resp) {
	      if (options.error) {
	        options.error(resp);
	      }
	    });

	};
	/* jshint +W074 */

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var bb = __webpack_require__(2);

	module.exports = bb.Collection.extend({

	  constructor: function() {
	    bb.Collection.apply(this, arguments);
	    this.resetNew();
	  },

	  resetNew: function(){
	    this._isNew = true;
	    this.once('sync', function() {
	      this._isNew = false;
	    });
	  },

	  isNew: function() {
	    return this._isNew;
	  }

	});

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1);
	var Parser = __webpack_require__(7);
	var parse = new Parser();

	var defaultFilterName = '__default';

	module.exports = function(Collection) {

	  return Collection.extend({

	    constructor: function () {
	      Collection.apply(this, arguments);
	      this._filters = {};
	    },


	    setFilter: function (filterName, filter) {
	      if (filter === undefined) {
	        filter = filterName;
	        filterName = defaultFilterName;
	      }
	      if (!filter) {
	        return this.removeFilter(filterName);
	      }
	      this._filters[filterName] = {
	        string: filter,
	        query : _.isString(filter) ? parse(filter) : filter
	      };
	      this.trigger('filtered:set');

	      return this.fetch({data: {filter: this.getFilterOptions()}});
	    },

	    removeFilter: function (filterName) {
	      if (!filterName) {
	        filterName = defaultFilterName;
	      }
	      delete this._filters[filterName];
	      this.trigger('filtered:remove');

	      return this.fetch({data: {filter: this.getFilterOptions()}});
	    },

	    resetFilters: function () {
	      this._filters = {};
	      this.trigger('filtered:reset');
	      return this.fetch();
	    },

	    getFilters: function (name) {
	      if (name) {
	        return this._filters[name];
	      }
	      return this._filters;
	    },

	    hasFilter: function (name) {
	      return _.includes(_.keys(this.getFilters()), name);
	    },

	    hasFilters: function () {
	      return _.size(this.getFilters()) > 0;
	    },

	    getFilterOptions: function () {
	      if (this.hasFilters()) {
	        return {q: this.getFilterQueries(), fields: this.fields};
	      }
	    },

	    getFilterQueries: function () {
	      var queries = _(this.getFilters()).map('query').flattenDeep().value();

	      // compact
	      if (queries.length > 1) {
	        queries = _.reduce(queries, function (result, next) {
	          if (!_.some(result, function (val) {
	              return _.isEqual(val, next);
	            })) {
	            result.push(next);
	          }
	          return result;
	        }, []);
	      }

	      // extra compact for common simple query
	      if (queries.length === 1 && _.get(queries, [0, 'type']) === 'string') {
	        queries = _.get(queries, [0, 'query']);
	      }

	      return queries;
	    }

	  });

	};

/***/ },
/* 7 */
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
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1);

	module.exports = function(Model){

	  return Model.extend({

	    constructor: function (attributes, options) {
	      this.db = _.get(options, ['collection', 'db']);
	      if (!this.db) {
	        throw Error('Model must be in an IDBCollection');
	      }

	      Model.apply(this, arguments);
	    }

	  });

	};

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var IDBAdapter = __webpack_require__(10);
	var _ = __webpack_require__(1);

	module.exports = function(Collection){
	  
	  return Collection.extend({

	    constructor: function () {
	      this.db = new IDBAdapter({ collection: this });
	      Collection.apply(this, arguments);
	    },
	    
	    /**
	     * Clears the IDB storage and resets the collection
	     */
	    clear: function () {
	      var self = this;
	      return this.db.open()
	        .then(function () {
	          self.reset();
	          return self.db.clear();
	        });
	    },

	    /**
	     *
	     */
	    count: function () {
	      var self = this;
	      return this.db.open()
	        .then(function () {
	          return self.db.count();
	        })
	        .then(function (count) {
	          self.trigger('count', count);
	          return count;
	        });
	    },

	    /**
	     *
	     */
	    putBatch: function (models, options) {
	      options = options || {};
	      var self = this;
	      if (_.isEmpty(models)) {
	        models = this.getChangedModels();
	      }
	      if (!models) {
	        return;
	      }
	      return this.db.open()
	        .then(function () {
	          return self.db.putBatch(models, options);
	        });
	    },

	    /**
	     *
	     */
	    getBatch: function (keyArray, options) {
	      var self = this;
	      return this.db.open()
	        .then(function () {
	          return self.db.getBatch(keyArray, options);
	        });
	    },

	    /**
	     *
	     */
	    findHighestIndex: function (keyPath, options) {
	      var self = this;
	      return this.db.open()
	        .then(function () {
	          return self.db.findHighestIndex(keyPath, options);
	        });
	    },

	    /**
	     *
	     */
	    getChangedModels: function () {
	      return this.filter(function (model) {
	        return model.isNew() || model.hasChanged();
	      });
	    },

	    /**
	     *
	     */
	    removeBatch: function (models, options) {
	      options = options || {};
	      var self = this;
	      if (_.isEmpty(models)) {
	        return;
	      }
	      return this.db.open()
	        .then(function () {
	          return self.db.removeBatch(models);
	        })
	        .then(function () {
	          self.remove(models);
	          if (options.success) {
	            options.success(self, models, options);
	          }
	          return models;
	        });
	    }

	  });
	  
	};

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/* jshint -W071, -W074 */
	var _ = __webpack_require__(1);
	var matchMaker = __webpack_require__(11);

	var is_safari = window.navigator.userAgent.indexOf('Safari') !== -1 &&
	  window.navigator.userAgent.indexOf('Chrome') === -1 &&
	  window.navigator.userAgent.indexOf('Android') === -1;

	var indexedDB = window.indexedDB;

	var consts = {
	  'READ_ONLY'         : 'readonly',
	  'READ_WRITE'        : 'readwrite',
	  'VERSION_CHANGE'    : 'versionchange',
	  'NEXT'              : 'next',
	  'NEXT_NO_DUPLICATE' : 'nextunique',
	  'PREV'              : 'prev',
	  'PREV_NO_DUPLICATE' : 'prevunique'
	};

	function IDBAdapter( options ){
	  options = options || {};
	  this.parent = options.collection;
	  this.opts = _.defaults(_.pick(this.parent, _.keys(this.default)), this.default);
	  this.opts.storeName = this.parent.name || this.default.storeName;
	  this.opts.dbName = this.opts.storePrefix + this.opts.storeName;
	}

	IDBAdapter.prototype = {

	  default: {
	    storeName     : 'store',
	    storePrefix   : 'Prefix_',
	    dbVersion     : 1,
	    keyPath       : 'id',
	    autoIncrement : true,
	    indexes       : [],
	    pageSize      : 10,
	    matchMaker    : matchMaker,
	    onerror       : function(options) {
	      options = options || {};
	      var err = new Error(options._error.message);
	      err.code = event.target.errorCode;
	      options._error.callback(err);
	    }
	  },

	  constructor: IDBAdapter,

	  open: function (options) {
	    options = options || {};
	    if (!this._open) {
	      var self = this;

	      this._open = new Promise(function (resolve, reject) {
	        var request = indexedDB.open(self.opts.dbName);

	        request.onsuccess = function (event) {
	          self.db = event.target.result;

	          // get count & safari hack
	          self.count()
	            .then(function () {
	              if(is_safari){
	                return self.findHighestIndex();
	              }
	            })
	            .then(function (key) {
	              if(is_safari){
	                self.highestKey = key || 0;
	              }
	              resolve(self.db);
	            });
	        };

	        request.onerror = function (event) {
	          options._error = {event: event, message: 'open indexedDB error', callback: reject};
	          self.opts.onerror(options);
	        };

	        request.onupgradeneeded = function (event) {
	          var store = event.currentTarget.result.createObjectStore(self.opts.storeName, self.opts);

	          self.opts.indexes.forEach(function (index) {
	            store.createIndex(index.name, index.keyPath, {
	              unique: index.unique
	            });
	          });
	        };
	      });
	    }

	    return this._open;
	  },

	  close: function () {
	    this.db.close();
	    this.db = undefined;
	    this._open = undefined;
	  },

	  getTransaction: function (access) {
	    return this.db.transaction([this.opts.storeName], access);
	  },

	  getObjectStore: function (access) {
	    return this.getTransaction(access).objectStore(this.opts.storeName);
	  },

	  count: function (options) {
	    options = options || {};
	    var self = this, objectStore = options.objectStore || this.getObjectStore(consts.READ_ONLY);

	    return new Promise(function (resolve, reject) {
	      var request = objectStore.count();

	      request.onsuccess = function (event) {
	        self.length = event.target.result || 0;
	        resolve(event.target.result);
	      };

	      request.onerror = function (event) {
	        options._error = {event: event, message: 'count error', callback: reject};
	        self.opts.onerror(options);
	      };
	    });
	  },

	  put: function (data, options) {
	    options = options || {};
	    var objectStore = options.objectStore || this.getObjectStore(consts.READ_WRITE);
	    var self = this, keyPath = this.opts.keyPath;

	    // merge on index keyPath
	    if (options.index) {
	      return this.merge(data, options);
	    }

	    if(!data[keyPath]){
	      return this.add(data, options);
	    }

	    return new Promise(function (resolve, reject) {
	      var request = objectStore.put(data);

	      request.onsuccess = function (event) {
	        resolve(event.target.result);
	      };

	      request.onerror = function (event) {
	        options._error = {event: event, message: 'put error', callback: reject};
	        self.opts.onerror(options);
	      };
	    });
	  },

	  add: function(data, options){
	    options = options || {};
	    var objectStore = options.objectStore || this.getObjectStore(consts.READ_WRITE);
	    var self = this, keyPath = this.opts.keyPath;

	    if(is_safari){
	      data[keyPath] = ++this.highestKey;
	    }

	    return new Promise(function (resolve, reject) {
	      var request = objectStore.add(data);

	      request.onsuccess = function (event) {
	        resolve(event.target.result);
	      };

	      request.onerror = function (event) {
	        options._error = {event: event, message: 'add error', callback: reject};
	        self.opts.onerror(options);
	      };
	    });
	  },

	  get: function (key, options) {
	    options = options || {};
	    var self = this, objectStore = options.objectStore || this.getObjectStore(consts.READ_ONLY);

	    return new Promise(function (resolve, reject) {
	      var request = objectStore.get(key);

	      request.onsuccess = function (event) {
	        resolve(event.target.result);
	      };

	      request.onerror = function (event) {
	        options._error = {event: event, message: 'get error', callback: reject};
	        self.opts.onerror(options);
	      };
	    });
	  },

	  delete: function (key, options) {
	    options = options || {};
	    var self = this, objectStore = options.objectStore || this.getObjectStore(consts.READ_WRITE);

	    return new Promise(function (resolve, reject) {
	      var request = objectStore.delete(key);

	      request.onsuccess = function (event) {
	        resolve(event.target.result); // undefined
	      };

	      request.onerror = function (event) {
	        var err = new Error('delete error');
	        err.code = event.target.errorCode;
	        reject(err);
	      };
	      request.onerror = function (event) {
	        options._error = {event: event, message: 'delete error', callback: reject};
	        self.opts.onerror(options);
	      };
	    });
	  },

	  putBatch: function (dataArray, options) {
	    options = options || {};
	    options.objectStore = options.objectStore || this.getObjectStore(consts.READ_WRITE);
	    var batch = [];

	    _.each(dataArray, function (data) {
	      batch.push(this.put(data, options));
	    }.bind(this));

	    return Promise.all(batch);
	  },

	  /**
	   * 4/3/2016: Chrome can do a fast merge on one transaction, but other browsers can't
	   */
	  merge: function (data, options) {
	    options = options || {};
	    var self = this, keyPath = options.index;
	    var primaryKey = this.opts.keyPath;

	    var fn = function(local, remote, keyPath){
	      if(local){
	        remote[keyPath] = local[keyPath];
	      }
	      return remote;
	    };

	    if(_.isObject(options.index)){
	      keyPath = _.get(options, ['index', 'keyPath'], primaryKey);
	      if(_.isFunction(options.index.merge)){
	        fn = options.index.merge;
	      }
	    }

	    return this.getByIndex(keyPath, data[keyPath], options)
	      .then(function(result){
	        return self.put(fn(result, data, primaryKey));
	      });
	  },

	  getByIndex: function(keyPath, key, options){
	    options = options || {};
	    var objectStore = options.objectStore || this.getObjectStore(consts.READ_ONLY),
	        openIndex = objectStore.index(keyPath),
	        request = openIndex.get(key),
	        self = this;

	    return new Promise(function (resolve, reject) {
	      request.onsuccess = function (event) {
	        resolve(event.target.result);
	      };

	      request.onerror = function (event) {
	        options._error = {event: event, message: 'get by index error', callback: reject};
	        self.opts.onerror(options);
	      };
	    });
	  },

	  getBatch: function (keyArray, options) {
	    if(!options && !_.isArray(keyArray)){
	      options = keyArray;
	    }
	    options = options || {};

	    var objectStore = options.objectStore || this.getObjectStore(consts.READ_ONLY),
	        include = _.isArray(keyArray) ? keyArray: _.get(options, ['data', 'filter', 'in']),
	        limit   = _.get(options, ['data', 'filter', 'limit'], this.opts.pageSize),
	        offset  = _.get(options, ['data', 'filter', 'offset'], 0),
	        query   = _.get(options, ['data', 'filter', 'q']),
	        keyPath = options.index || this.opts.keyPath,
	        page    = _.get(options, ['data', 'page']),
	        self    = this;

	    if(_.isObject(keyPath)){
	      keyPath = keyPath.keyPath;
	    }

	    if (limit === -1) {
	      limit = Infinity;
	    }

	    if(page){
	      offset = (page - 1) * limit;
	    }

	    return new Promise(function (resolve, reject) {
	      var records = [], delayed = 0;
	      var request = (keyPath === self.opts.keyPath) ?
	        objectStore.openCursor() : objectStore.index(keyPath).openCursor();

	      request.onsuccess = function (event) {
	        var cursor = event.target.result;
	        if (cursor) {
	          if(cursor.value._state === 'READ_FAILED'){
	            delayed++;
	          }
	          if(
	            (!include || _.includes(include, cursor.value[keyPath])) &&
	            (!query || self._match(query, cursor.value, keyPath, options))
	          ){
	            records.push(cursor.value);
	          }
	          return cursor.continue();
	        }
	        _.set(options, 'idb.total', records.length);
	        _.set(options, 'idb.delayed', delayed);
	        resolve(_.slice(records, offset, offset + limit));
	      };

	      request.onerror = function (event) {
	        options._error = {event: event, message: 'getAll error', callback: reject};
	        self.opts.onerror(options);
	      };
	    });
	  },

	  clear: function (options) {
	    options = options || {};
	    var self = this, objectStore = options.objectStore || this.getObjectStore(consts.READ_WRITE);

	    return new Promise(function (resolve, reject) {
	      var request = objectStore.clear();

	      request.onsuccess = function (event) {
	        self.length = 0;
	        resolve(event.target.result);
	      };

	      request.onerror = function (event) {
	        options._error = {event: event, message: 'clear error', callback: reject};
	        self.opts.onerror(options);
	      };
	    });
	  },

	  findHighestIndex: function (keyPath, options) {
	    options = options || {};
	    var self = this, objectStore = options.objectStore || this.getObjectStore(consts.READ_ONLY);

	    return new Promise(function (resolve, reject) {
	      var request;
	      if(keyPath){
	        var openIndex = objectStore.index(keyPath);
	        request = openIndex.openCursor(null, consts.PREV);
	      } else {
	        request = objectStore.openCursor(null, consts.PREV);
	      }

	      request.onsuccess = function (event) {
	        var value = _.get(event, ['target', 'result', 'key']);
	        resolve(value);
	      };

	      request.onerror = function (event) {
	        options._error = {event: event, message: 'find highest key error', callback: reject};
	        self.opts.onerror(options);
	      };
	    });
	  },

	  _match: function(query, json, keyPath, options){
	    var fields = _.get(options, ['data', 'filter', 'fields'], keyPath);
	    return this.opts.matchMaker.call(this, json, query, {fields: fields});
	  }

	};

	module.exports = IDBAdapter;
	/* jshint +W071, +W074 */

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1);
	var match = __webpack_require__(12);

	var defaults = {
	  fields: ['title'] // json property to use for simple string search
	};

	var pick = function(json, props){
	  return _.chain(props)
	    .map(function (key) {
	      return _.get(json, key); // allows nested get
	    })
	    .value();
	};

	var methods = {

	  string: function(json, filter, options) {
	    var fields = _.isArray(options.fields) ? options.fields : [options.fields];
	    var needle = filter.query ? filter.query.toLowerCase() : '';
	    var haystacks = pick(json, fields);

	    return _.some(haystacks, function (haystack) {
	      return match(haystack, needle, options);
	    });
	  },

	  prefix: function(json, filter){
	    return this.string(json, filter, {fields: filter.prefix});
	  },

	  range: function(json, filter, options){
	    var fields = _.isArray(options.fields) ? options.fields : [options.fields];
	    var haystacks = pick(json, fields);

	    return _.some(haystacks, function (haystack) {
	      return _.inRange(haystack, filter.from, filter.to);
	    });
	  },

	  prange: function(json, filter){
	    return this.range(json, filter, {fields: filter.prefix});
	  },

	  or: function(json, filter, options){
	    var self = this;
	    return _.some(filter.queries, function(query){
	      return self[query.type](json, query, options);
	    });
	  },

	  and: function(json, filter, options){
	    var self = this;
	    return _.every(filter.queries, function(query){
	      return self[query.type](json, query, options);
	    });
	  }

	};

	module.exports = function(json, filterArray, options) {
	  var opts = _.defaults({}, options, defaults);

	  if (!_.isArray(filterArray)) {
	    filterArray = [{type: 'string', query: filterArray.toString()}];
	  }

	  return _.every(filterArray, function (filter) {
	    return methods[filter.type](json, filter, opts);
	  });
	};

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1);

	var toType = function(obj){
	  return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
	};

	var defaults = {

	};

	var match = {
	  'string': function(str, value, options){
	    if(options.exact || _.isEmpty(value)){
	      return str.toLowerCase() === value;
	    }
	    return str.toLowerCase().indexOf( value ) !== -1;
	  },

	  'number': function(number, value, options){
	    if(options.exact){
	      return number.toString() === value;
	    }
	    return number.toString().indexOf( value ) !== -1;
	  },

	  'boolean': function(bool, value){
	    return bool.toString() === value;
	  },

	  'array': function(array, value, options){
	    var self = this;
	    return _.some(array, function(elem){
	      var type = toType(elem);
	      return self[type](elem, value, options);
	    });
	  }
	};

	module.exports = function(haystack, needle, options){
	  var opts = _.defaults({}, options, defaults);
	  var type = toType(haystack);
	  if(match[type]){
	    return match[type](haystack, needle, opts);
	  }
	};

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var bb = __webpack_require__(2);
	var _ = __webpack_require__(1);

	module.exports = function(IDBModel){

	  return IDBModel.extend({

	    idAttribute: 'local_id',

	    remoteIdAttribute: 'id',

	    url: function(){
	      var remoteId = this.get(this.remoteIdAttribute),
	          urlRoot = _.result(this.collection, 'url');

	      if(remoteId){
	        return '' + urlRoot + '/' + remoteId + '/';
	      }
	      return urlRoot;
	    },

	    sync: function( method, model, options ){
	      options = options || {};
	      this.setLocalState( method );
	      if( options.remote ){
	        return this.remoteSync( method, model, options );
	      }
	      return bb.sync.call( this, method, model, options );
	    },

	    remoteSync: function( method, model, options ){
	      var self = this, opts = _.extend({}, options, {
	        remote: false,
	        success: false
	      });
	      return bb.sync.call( this, method, model, opts )
	        .then( function(){
	          var remoteMethod = self.getRemoteMethod();
	          opts.remote = true;
	          return bb.sync.call( self, remoteMethod, model, opts );
	        })
	        .then( function( resp ){
	          resp = options.parse ? model.parse(resp, options) : resp;
	          model.set( resp );
	          opts.remote = false;
	          opts.success = options.success;
	          return bb.sync.call( self, 'update', model, opts );
	        });
	    },

	    setLocalState: function( method ){
	      method = method === 'patch' ? 'update' : method;
	      if( method === 'update' && !this.hasRemoteId() ){
	        method = 'create';
	      }
	      if( method === 'create' && this.hasRemoteId() ){
	        method = 'update';
	      }
	      this.set({ _state: this.collection.states[method] });
	    },

	    getRemoteMethod: function(){
	      return _.invert( this.collection.states )[ this.get('_state') ];
	    },

	    hasRemoteId: function() {
	      return !!this.get( this.remoteIdAttribute );
	    },

	    toJSON: function( options ){
	      options = options || {};
	      var json = IDBModel.prototype.toJSON.apply( this, arguments );
	      if( options.remote && this.name ) {
	        json = this.prepareRemoteJSON(json);
	      }
	      return json;
	    },

	    prepareRemoteJSON: function(json){
	      json._state = undefined;
	      var nested = {};
	      nested[this.name] = json;
	      return nested;
	    },

	    parse: function( resp, options ) {
	      options = options || {};
	      if( options.remote ){
	        resp = resp && resp[this.name] ? resp[this.name] : resp;
	        resp._state = undefined;
	      }
	      return IDBModel.prototype.parse.call( this, resp, options );
	    }

	  });

	};

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1);

	module.exports = function(IDBCollection){

	  return IDBCollection.extend({

	    keyPath: 'local_id',

	    indexes: [
	      {name: 'id', keyPath: 'id', unique: true},
	      {name: 'updated_at', keyPath: 'updated_at'},
	      {name: '_state', keyPath: '_state'}
	    ],

	    // delayed states
	    states: {
	      //'patch'  : 'UPDATE_FAILED',
	      'update': 'UPDATE_FAILED',
	      'create': 'CREATE_FAILED',
	      'delete': 'DELETE_FAILED',
	      'read'  : 'READ_FAILED'
	    },

	    toJSON: function (options) {
	      options = options || {};
	      var json = IDBCollection.prototype.toJSON.apply(this, arguments);
	      if (options.remote && this.name) {
	        var nested = {};
	        nested[this.name] = json;
	        return nested;
	      }
	      return json;
	    },

	    parse: function (resp, options) {
	      options = options || {};
	      if (options.remote) {
	        resp = resp && resp[this.name] ? resp[this.name] : resp;
	      }
	      return IDBCollection.prototype.parse.call(this, resp, options);
	    },

	    fetch: function (options) {
	      options = _.extend({parse: true}, options);
	      var self = this, success = options.success;
	      var _fetch = options.remote ? this.fetchRemote : this.fetchLocal;

	      if(success){
	        options.success = undefined;
	      }

	      this.trigger('request', this, null, options);
	      return _fetch.call(this, options)
	        .then(function (response) {
	          var method = options.reset ? 'reset' : 'set';
	          self[method](response, options);
	          if (success) {
	            success.call(options.context, self, response, options);
	          }
	          if(options.idb){
	            self.total = options.idb.total;
	            self.delayed = options.idb.delayed;
	            self._hasNextPage = self.length < self.total || self.delayed > 0;
	          }
	          if(options.xhr){
	            self.total = options.xhr.getResponseHeader('X-WC-Total');
	            self._hasNextPage = self.length < self.total;
	          }
	          self.trigger('sync', self, response, options);
	          return response;
	        });
	    },

	    /**
	     *
	     */
	    fetchLocal: function (options) {
	      var self = this;
	      options = options || {};

	      return IDBCollection.prototype.getBatch.call(this, options)
	        .then(function (response) {
	          if(_.size(response) > 0){
	            return self.fetchDelayed(response);
	          }
	          if(self.isNew()){
	            return self.firstSync(options);
	          }
	          return self.fetchRemote(options);
	        });
	    },

	    /**
	     * Get remote data and merge with local data on id
	     * returns merged data
	     */
	    fetchRemote: function (options) {
	      // options = _.extend({remote: true}, options);
	      options = options || {};
	      options.remote = true;
	      var self = this;

	      return this.sync('read', this, options)
	        .then(function (response) {
	          response = self.parse(response, options);
	          return self.putBatch(response, { index: 'id' });
	        })
	        .then(function (keys) {
	          return self.getBatch(keys);
	        });
	    },

	    fetchRemoteIds: function (last_update, options) {
	      options = options || {};
	      var self = this, url = _.result(this, 'url') + '/ids';

	      var opts = _.defaults(options, {
	        url   : url,
	        remote: true,
	        data  : {
	          fields: 'id',
	          filter: {
	            limit         : -1,
	            updated_at_min: last_update
	          }
	        }
	      });

	      opts.success = undefined;

	      return this.sync('read', this, opts)
	        .then(function (response) {
	          response = self.parse(response, opts);
	          return self.putBatch(response, {
	            index: {
	              keyPath: 'id',
	              merge  : function (local, remote) {
	                if(!local || local.updated_at < remote.updated_at){
	                  local = local || remote;
	                  local._state = self.states.read;
	                }
	                return local;
	              }
	            }
	          });
	        })
	        .then(function (response) {
	          return response;
	        });
	    },

	    fetchUpdatedIds: function (options) {
	      var self = this;
	      return this.findHighestIndex('updated_at')
	        .then(function (last_update) {
	          return self.fetchRemoteIds(last_update, options);
	        });
	    },

	    firstSync: function(options){
	      var self = this, response;
	      return this.fetchRemote(options)
	        .then(function (response) {
	          self.fullSync();
	          return response;
	        });
	    },

	    fullSync: function(options){
	      return this.fetchRemoteIds(options);
	    },

	    fetchDelayed: function(response){
	      var delayed = this.getDelayed('read', response);
	      if(delayed){
	        var ids = _.map(delayed, 'id');
	        return this.fetchRemote({
	            data: {
	              filter: {
	                'in': ids.join(',')
	              }
	            }
	          })
	          .then(function(resp){
	            _.each(resp, function(attrs){
	              var key = _.findKey(response, {id: attrs.id});
	              if(key){
	                response[key] = attrs;
	              } else {
	                response.push(resp);
	              }
	            });
	            return response;
	          });
	      }
	      return response;
	    },

	    getDelayed: function(state, collection){
	      var delayed, _state = this.states[state];
	      collection = collection || this;
	      delayed = _.filter(collection, {_state: _state});
	      if(!_.isEmpty(delayed)){
	        return delayed;
	      }
	    }

	  });

	};

/***/ }
/******/ ]);