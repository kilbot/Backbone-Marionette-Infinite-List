var port = 3000;
var jsonServer = require('json-server')
var open = require('open');

// Returns an Express server
var server = jsonServer.create();

// Set default middlewares (logger, static, cors and no-cache)
server.use(jsonServer.defaults({
  static: process.cwd() // parent dir
}));

// Add routes
var routes = {
  products: require('./data/products.json')
};

// Returns an Express router
var router = jsonServer.router(routes);
router.render = function (req, res) {
  setTimeout(function(){
    res.send(res.locals.data);
  },3000);
};
server.use('/api', router);

server.listen(port);

open('http://localhost:' + port);