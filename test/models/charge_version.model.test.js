'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ChargeVersion = require('../../app/models/charge_version.model')

describe('ChargeVersion model', () => {
  it('returns data', async () => {
    const query = await ChargeVersion.query()

    expect(query).to.exist()
  })
})
