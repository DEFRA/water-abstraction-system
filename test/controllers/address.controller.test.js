'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

const { postRequestOptions } = require('../support/general.js')

// Things we need to stub
const PostcodeService = require('../../app/services/address/postcode.service.js')
const SubmitPostcodeService = require('../../app/services/address/submit-postcode.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Address controller', () => {
  let options
  let postOptions
  let server

  // Create server before running the tests
  before(async () => {
    server = await init()
  })

  beforeEach(async () => {
    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    Sinon.stub(server.logger, 'error')

    // We silence sending a notification to our Errbit instance using Airbrake
    Sinon.stub(server.app.airbrake, 'notify').resolvesThis()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('/address/{id}/postcode', () => {
    describe('GET', () => {
      beforeEach(() => {
        options = {
          method: 'GET',
          url: '/address/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/postcode',
          auth: {
            strategy: 'session',
            credentials: { scope: ['billing'] }
          }
        }

        const pageData = _postcodePageData()
        Sinon.stub(PostcodeService, 'go').returns(pageData)
      })

      it('returns the page successfully', async () => {
        const response = await server.inject(options)

        expect(response.statusCode).to.equal(200)
      })
    })

    describe('POST', () => {
      beforeEach(() => {
        postOptions = postRequestOptions('/address/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/postcode', {})
      })

      describe('when the request succeeds', () => {
        beforeEach(() => {
          Sinon.stub(SubmitPostcodeService, 'go').returns({})
        })

        it('redirects to the postcode lookup page', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(`/system/address/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/lookup`)
        })
      })

      describe('when the request fails', () => {
        beforeEach(() => {
          const pageData = _postcodePageData(true)

          Sinon.stub(SubmitPostcodeService, 'go').returns(pageData)
        })

        it('re-renders the postcode page with an error', async () => {
          const response = await server.inject(postOptions)

          expect(response.statusCode).to.equal(200)

          expect(response.payload).to.contain('There is a problem')
          expect(response.payload).to.contain('Enter a UK postcode')
        })
      })
    })
  })
})

function _postcodePageData(error = false) {
  const pageData = {
    activeNavBar: 'search',
    sessionId: 'fecd5f15-bacf-4b3d-bdcd-ef279a97b061'
  }

  if (error) {
    pageData.error = {
      errorList: [{ href: '#postcode', text: 'Enter a UK postcode' }],
      postcode: { text: 'Enter a UK postcode' }
    }
  }

  return pageData
}
