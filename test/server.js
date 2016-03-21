var port = 3000;
var jsonServer = require('json-server')
var open = require('open');
var customers = require('./data/customers.json');
var _ = require('lodash');

// Returns an Express server
var server = jsonServer.create();

// Set default middlewares (logger, static, cors and no-cache)
server.use(jsonServer.defaults({
  static: process.cwd() // parent dir
}));

server.get('/api/customers', function(req, res){
  console.log(req.query);
  var response = _.clone(customers);
  var pageSize = _.get(req.query, ['filter', 'limit'], 10);
  var query = _.get(req.query, ['filter', 'q']);
  var include = _.get(req.query, ['filter', 'in']);
  var start = pageSize * (req.query.page || 1) - pageSize;

  if(query){
    response = _.filter(response, function(model){
      return model.first_name.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        model.last_name.toLowerCase().indexOf(query.toLowerCase()) !== -1;
    });
  }

  if(include){
    var ids = include.split(',');
    response = _.filter(response, function(model){
      return _.includes(ids, model.id.toString());
    });
  }

  setTimeout(function(){
    res.send({
      'customers': _.slice(response, start, start + pageSize)
    });
  },3000);
});

server.get('/api/customers/ids', function(req, res){
  console.log(req.query);
  var response =_.map(customers, _.partial(_.ary(_.pick, 2), _, ['id', 'updated_at']));
  setTimeout(function(){
    res.send({
      'customers': response
    });
  },3000);
});

server.listen(port);
open('http://localhost:' + port);