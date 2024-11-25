'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const ViewService = require('../../app/services/monitoring-stations/view.service.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Monitoring stations controller', () => {
  let options
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

  describe('/monitoring-station/{monitoringStationId}', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = {
          method: 'GET',
          url: '/monitoring-stations/499247a2-bebf-4a94-87dc-b83af2a133f3',
          auth: {
            strategy: 'session',
            credentials: { scope: [] }
          }
        }

        Sinon.stub(ViewService, 'go').resolves({
          activeNavBar: 'search',
          pageTitle: 'Bodney Bridge',
          monitoringStationId: '499247a2-bebf-4a94-87dc-b83af2a133f3',
          monitoringStationName: 'Bodney Bridge',
          gridReference: 'TL82959885',
          permissionToManageLinks: true,
          permissionToSendAlerts: true,
          wiskiId: 'L33802',
          stationReference: 'E23746',
          licences: [
            {
              licenceId: 'bf1befed-2ece-4805-89fd-3056a5cf5020',
              licenceRef: '01/0157',
              linkages: [
                {
                  abstractionPeriod: '01 May to 12 August',
                  alertType: 'Stop',
                  alertUpdatedAt: '26 September 2024',
                  createdAt: '2023-12-14 21:33:04.006',
                  lastUpdatedAt: '2024-09-26 01:39:11.340',
                  id: '76ada4a6-00f6-4e9a-b930-a3512b0f4d77',
                  licenceRef: 'AT/Test',
                  restrictionType: 'Level',
                  threshold: '500 Ml/d'
                }
              ]
            }
          ]
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).to.equal(200)
          expect(response.payload).to.contain('Bodney Bridge')
        })
      })
    })
  })
})
