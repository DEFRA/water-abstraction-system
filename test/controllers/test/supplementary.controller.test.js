'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, after } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { init } = require('../../../app/server')

describe('Test supplementary controller', () => {
  let server

  beforeEach(async () => {
    server = await init()
  })

  after(() => {
    Sinon.restore()
  })

  describe('Returning selected charge versions: GET /test/supplementary', () => {
    let response

    const options = {
      method: 'GET',
      url: '/test/supplementary'
    }

    beforeEach(async () => {
      response = await server.inject(options)
    })

    it('returns a 200 status code', async () => {
      expect(response.statusCode).to.equal(200)
    })

    it('returns a JSON response', async () => {
      const jsonBody = JSON.parse(response.payload)
      expect(jsonBody).to.equal({
        chargeVersions: [
          { id: '986d5b14-8686-429e-9ae7-1164c1300f8d', licenceRef: 'AT/SROC/SUPB/01' },
          { id: 'ca0e4a77-bb13-4eef-a1a1-2ccf9e302cc4', licenceRef: 'AT/SROC/SUPB/03' }
        ]
      })
    })
  })
})
