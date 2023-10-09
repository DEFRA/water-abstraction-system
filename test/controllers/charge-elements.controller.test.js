'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const AddLicencesToWorkflowService = require('../../app/services/charge-elements/add-licences-to-workflow.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Charge Elements controller', () => {
  let server

  beforeEach(async () => {
    // Create server before each test
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

  describe('POST /charge-elements/time-limited', () => {
    const options = {
      method: 'POST',
      url: '/charge-elements/time-limited'
    }

    const validResponse = [
      {
        licenceId: '092c43c1-07b5-4d87-82d6-68a325bf26ba',
        licenceVersionId: '0df27617-9958-425d-9386-b06d0d1f686c',
        status: 'to_setup',
        data: {
          chargeVersion: null
        },
        createdAt: '2023-10-09T12:34:46.552Z',
        updatedAt: '2023-10-09T12:34:46.552Z'
      }
    ]

    describe('when the request succeeds', () => {
      beforeEach(async () => {
        Sinon.stub(AddLicencesToWorkflowService, 'go').resolves(validResponse)
      })

      it('displays the correct message', async () => {
        const response = await server.inject(options)

        const responsePayload = JSON.parse(response.payload)

        expect(response.statusCode).to.equal(200)
        expect(responsePayload).to.equal(validResponse)
      })
    })

    describe('when the request fails', () => {
      describe('because the AddLicencesToWorkflowService errors', () => {
        beforeEach(async () => {
          Sinon.stub(AddLicencesToWorkflowService, 'go').rejects()
        })

        it('returns a 500 status', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(500)
        })
      })
    })
  })
})
