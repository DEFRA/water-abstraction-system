'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, after } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { init } = require('../../../app/server')

describe('Database controller', () => {
  let server

  beforeEach(async () => {
    server = await init()
  })

  after(() => {
    Sinon.restore()
  })

  describe('Listing table stats: GET /health/database', () => {
    const options = {
      method: 'GET',
      url: '/health/database'
    }

    it('returns stats about each table', async () => {
      const response = await server.inject(options)

      const payload = JSON.parse(response.payload)

      expect(response.statusCode).to.equal(200)

      // We expect at least 5 tables to exist and be returned in the results
      expect(payload.length).to.be.at.least(5)
      expect(payload[0].relname).to.exist()
    })
  })
})
