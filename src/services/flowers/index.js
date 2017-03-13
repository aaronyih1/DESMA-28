'use strict';

const path = require('path');
const NeDB = require('nedb');
const service = require('feathers-nedb');
const hooks = require('./hooks');

module.exports = function(){
  const app = this;

  const db = new NeDB({
    filename: path.join(app.get('nedb'), 'flowers.db'),
    autoload: true
  });

  let options = {
    Model: db,
    paginate: {
      default: 5,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use('/flowers', service(options));

  // Get our initialize service to that we can bind hooks
  const flowersService = app.service('/flowers');

  // Set up our before hooks
  flowersService.before(hooks.before);

  // Set up our after hooks
  flowersService.after(hooks.after);
};
