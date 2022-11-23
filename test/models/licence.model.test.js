'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const Licence = require('../../app/models/licence.model.js')

describe('Licence model', () => {
  it('returns data', async () => {
    const query = await Licence.query()

    expect(query).to.exist()
  })
})
