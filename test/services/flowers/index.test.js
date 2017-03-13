'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('flowers service', function() {
  it('registered the flowers service', () => {
    assert.ok(app.service('flowers'));
  });
});
