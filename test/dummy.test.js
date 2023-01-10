'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('./support/helpers/database.helper.js')
const EventHelper = require('./support/helpers/water/event.helper.js')

describe('Messing with the model', () => {
  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  it('Works', async () => {
    const event = await EventHelper.add()
    console.log('🚀 ~ file: dummy.test.js:21 ~ it ~ event', event)

    expect(event.createdAt).to.exist()
    expect(event.updatedAt).to.exist()

    expect(event.created).not.to.exist()
    expect(event.modified).not.to.exist()
  })
})
