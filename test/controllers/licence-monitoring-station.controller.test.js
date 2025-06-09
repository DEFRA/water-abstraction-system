'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { postRequestOptions } = require('../support/general.js')

// Things we need to stub
const RemoveService = require('../../app/services/licence-monitoring-station/remove.service.js')
const SubmitRemoveService = require('../../app/services/licence-monitoring-station/submit-remove.service.js')

// For running our service
const { init } = require('../../app/server.js')

const licenceMonitoringStationId = 'ab4aff2b-cb01-4070-b896-948d80d61f96'

describe('Licence Monitoring Station - Controller', () => {
  let server

  // Create server before running the tests
  before(async () => {
    server = await init()
  })

  beforeEach(() => {
    // We silence any calls to server.logger.error made in the plugin to try and keep the test output as clean as
    // possible
    Sinon.stub(server.logger, 'error')

    // We silence sending a notification to our Errbit instance using Airbrake
    Sinon.stub(server.app.airbrake, 'notify').resolvesThis()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('licence-monitoring-station/{licenceMonitoringStationId}/remove', () => {
    const path = 'remove'

    describe('GET', () => {
      describe('when the request succeeds', () => {
        beforeEach(() => {
          Sinon.stub(RemoveService, 'go').resolves({ pageTitle: 'You’re about to remove the tag for this licence' })
        })

        it('returns the page successfully', async () => {
          const response = await server.inject(_getOptions(path))

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('You’re about to remove the tag for this licence')
        })
      })
    })

    describe('POST', () => {
      describe('when the request succeeds', () => {
        const monitoringStationId = '8685eadf-15a5-4270-b57e-b9196a23218a'

        beforeEach(() => {
          Sinon.stub(SubmitRemoveService, 'go').resolves()
        })

        it('redirects to the view monitoring station page', async () => {
          const response = await server.inject(_postOptions(path, { monitoringStationId }))

          expect(response.statusCode).to.equal(302)
          expect(response.headers.location).to.equal(`/system/monitoring-stations/${monitoringStationId}`)
        })
      })
    })
  })
})

function _getOptions(path) {
  const url = `/licence-monitoring-station/${licenceMonitoringStationId}/${path}`

  return {
    method: 'GET',
    url,
    auth: {
      strategy: 'session',
      credentials: { scope: ['manage_gauging_station_licence_links'] }
    }
  }
}

function _postOptions(path, payload) {
  return postRequestOptions(
    `/licence-monitoring-station/${licenceMonitoringStationId}/${path}`,
    payload,
    'manage_gauging_station_licence_links'
  )
}
