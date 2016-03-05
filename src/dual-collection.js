var DualCollection = require('backbone-dual-storage');

module.exports = DualCollection.extend({
  name: 'products',
  url: 'http://localhost:3000/api/products'
});