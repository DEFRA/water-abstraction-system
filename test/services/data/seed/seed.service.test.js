'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Things we need to stub
const { db } = require('../../../../db/db.js')

// Thing under test
const SeedService = require('../../../../app/services/data/seed/seed.service.js')

describe('Seed service', () => {
  let knexRunStub

  beforeEach(async () => {
    knexRunStub = Sinon.stub().resolves()

    Sinon.replaceGetter(db, 'seed', () => {
      return { run: knexRunStub }
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('uses the knex instance we configure to run the seed process', async () => {
    await SeedService.go()

    expect(knexRunStub.called).to.be.true()
  })
})
