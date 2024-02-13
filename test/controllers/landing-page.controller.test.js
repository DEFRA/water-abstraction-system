'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// For running our service
const { init } = require('../../app/server.js')

describe('Landing Page controller', () => {
  let server

  // Create server before each test
  beforeEach(async () => {
    server = await init()
  })

  describe('when a request is made to correct URL', () => {
    it('displays the landing page', async () => {
      const options = {
        method: 'GET',
        url: '/landing-page'
      }

      const response = await server.inject(options)
      const payload = response.payload

      expect(response.statusCode).to.equal(200)

      expect(payload).to.include('Landing Page')
      expect(payload).to.include('Lorem ipsum')
    })
  })

  describe('when a request is made to an incorrect URL', () => {
    it('displays page not found', async () => {
      const OtherOptions = {
        method: 'GET',
        url: '/landing-pages'
      }

      const response = await server.inject(OtherOptions)
      const payload = response.payload

      expect(response.statusCode).to.equal(404)

      expect(payload).to.include('Page not found')
    })
  })
})
