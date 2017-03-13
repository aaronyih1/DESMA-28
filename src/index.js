'use strict';

const app = require('./app');
const port = app.get('port');
const server = app.listen(process.env.PORT || 8080);

server.on('listening', () =>
  console.log(`Feathers application started on ${app.get('host')}:${port}`)
);