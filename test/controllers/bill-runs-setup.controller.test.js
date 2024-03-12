'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const InitiateSessionService = require('../../app/services/bill-runs/setup/initiate-session.service.js')
const RegionService = require('../../app/services/bill-runs/setup/region.service.js')
const SubmitRegionService = require('../../app/services/bill-runs/setup/submit-region.service.js')
const SubmitTypeService = require('../../app/services/bill-runs/setup/submit-type.service.js')
const TypeService = require('../../app/services/bill-runs/setup/type.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Bill Runs Setup controller', () => {
  let options
  let server

  // Create server before each test
  beforeEach(async () => {
    server = await init()

    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    Sinon.stub(server.logger, 'error')

    // We silence sending a notification to our Errbit instance using Airbrake
    Sinon.stub(server.app.airbrake, 'notify').resolvesThis()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('/bill-runs/setup', () => {
    describe('GET', () => {
      const session = { id: 'e009b394-8405-4358-86af-1a9eb31298a5', data: {} }

      beforeEach(async () => {
        options = _getOptions('')
        options.url = '/bill-runs/setup'
      })

      describe('when a request is valid', () => {
        beforeEach(async () => {
          Sinon.stub(InitiateSessionService, 'go').resolves(session)
        })

        it('redirects to select bill run type page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(`/system/bill-runs/setup/${session.id}/type`)
        })
      })
    })
  })

  describe('/bill-runs/setup/{sessionId}/region', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getOptions('region')

        Sinon.stub(RegionService, 'go').resolves({
          sessionId: 'e009b394-8405-4358-86af-1a9eb31298a5',
          regions: [
            { id: 'e21b987c-7a5f-4eb3-a794-e4aae4a96a28', displayName: 'Riverlands' },
            { id: '19a027c6-4aad-47d3-80e3-3917a4579a5b', displayName: 'Stormlands' }
          ],
          selectedRegion: null
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Select the region')
        })
      })
    })

    describe('POST', () => {
      describe('when a request is valid', () => {
        beforeEach(async () => {
          options = _postOptions('region', { region: '19a027c6-4aad-47d3-80e3-3917a4579a5b' })
        })

        describe('and the bill run setup is complete', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitRegionService, 'go').resolves({ setupComplete: true })
          })

          it('redirects to the generate bill run endpoint', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/bill-runs/setup/e009b394-8405-4358-86af-1a9eb31298a5/generate')
          })
        })

        describe('and the bill run setup is not complete', () => {
          beforeEach(async () => {
            Sinon.stub(SubmitRegionService, 'go').resolves({ setupComplete: false })
          })

          it('redirects to the select financial year', async () => {
            const response = await server.inject(options)

            expect(response.statusCode).to.equal(302)
            expect(response.headers.location).to.equal('/system/bill-runs/setup/e009b394-8405-4358-86af-1a9eb31298a5/year')
          })
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(async () => {
          options = _postOptions('region', { region: '' })

          Sinon.stub(SubmitRegionService, 'go').resolves({
            sessionId: 'e009b394-8405-4358-86af-1a9eb31298a5',
            regions: [{ id: 'e21b987c-7a5f-4eb3-a794-e4aae4a96a28', displayName: 'Riverlands' }],
            selectedRegion: null,
            error: { text: 'Select a region' }
          })
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Select a region')
          expect(response.payload).to.contain('There is a problem')
        })
      })
    })
  })

  describe('/bill-runs/setup/{sessionId}/type', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = _getOptions('type')

        Sinon.stub(TypeService, 'go').resolves({
          sessionId: 'e009b394-8405-4358-86af-1a9eb31298a5',
          selectedType: null
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Select a bill run type')
        })
      })
    })

    describe('POST', () => {
      describe('when a request is valid', () => {
        beforeEach(async () => {
          options = _postOptions('type', { type: 'annual' })

          Sinon.stub(SubmitTypeService, 'go').resolves({})
        })

        it('redirects to select a region page', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal('/system/bill-runs/setup/e009b394-8405-4358-86af-1a9eb31298a5/region')
        })
      })

      describe('when a request is invalid', () => {
        beforeEach(async () => {
          options = _postOptions('type', { type: '' })

          Sinon.stub(SubmitTypeService, 'go').resolves({
            sessionId: 'e009b394-8405-4358-86af-1a9eb31298a5',
            selectedType: null,
            error: { text: 'Select a bill run type' }
          })
        })

        it('re-renders the page with an error message', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Select a bill run type')
          expect(response.payload).to.contain('There is a problem')
        })
      })
    })
  })
})

function _getOptions (path) {
  return {
    method: 'GET',
    url: `/bill-runs/setup/e009b394-8405-4358-86af-1a9eb31298a5/${path}`,
    auth: {
      strategy: 'session',
      credentials: { scope: ['billing'] }
    }
  }
}

function _postOptions (path, payload) {
  return {
    method: 'POST',
    url: `/bill-runs/setup/e009b394-8405-4358-86af-1a9eb31298a5/${path}`,
    auth: {
      strategy: 'session',
      credentials: { scope: ['billing'] }
    },
    payload
  }
}
