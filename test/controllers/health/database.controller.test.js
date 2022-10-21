// Test framework dependencies
import Lab from '@hapi/lab'
import Code from '@hapi/code'
import Sinon from 'sinon'

// For running our service
import { init } from '../../../app/server.js'

const { describe, it, beforeEach, after } = exports.lab = Lab.script()
const { expect } = Code

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

      expect(response.statusCode).to.equal(200)
    })
  })
})
