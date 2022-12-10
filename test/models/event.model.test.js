'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const Event = require('../../app/models/event.model')

describe('Event model', () => {
  it('can successfully run a query', async () => {
    const query = await Event.query()

    expect(query).to.exist()
  })
})
