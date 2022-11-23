'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const Region = require('../../app/models/region.model.js')

describe('Region model', () => {
  it('returns data', async () => {
    const query = await Region.query()

    expect(query).to.exist()
  })
})
