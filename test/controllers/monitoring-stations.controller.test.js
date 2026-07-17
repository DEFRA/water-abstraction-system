// Test framework
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import http2 from 'node:http2'

import LoggerStub from '../support/stubs/logger.stub.js'

// Things we need to stub
import * as ViewLicenceService from '../../app/services/monitoring-stations/view-licence.service.js'
import * as ViewService from '../../app/services/monitoring-stations/view.service.js'

// For running our service
import { init } from '../../app/server.js'

const { HTTP_STATUS_OK } = http2.constants

describe('Monitoring stations controller', () => {
  let options
  let server

  // Create server before running the tests
  beforeAll(async () => {
    server = await init()
  })

  beforeEach(async () => {
    // We silence any calls to server.logger made in the plugin to try and keep the test output as clean as possible
    LoggerStub(server.logger)

    // We silence sending a notification to our Errbit instance using Airbrake
    vi.spyOn(server.app.airbrake, 'notify').mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  afterAll(async () => {
    await server.stop()
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

        vi.spyOn(ViewService, 'default').mockResolvedValue({
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

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Bodney Bridge')
        })
      })
    })
  })

  describe('/monitoring-station/{monitoringStationId}/licence/{licenceId}', () => {
    describe('GET', () => {
      beforeEach(async () => {
        options = {
          method: 'GET',
          url: '/monitoring-stations/499247a2-bebf-4a94-87dc-b83af2a133f3/licence/bf1befed-2ece-4805-89fd-3056a5cf5020',
          auth: {
            strategy: 'session',
            credentials: { scope: ['manage_gauging_station_licence_links'] }
          }
        }

        vi.spyOn(ViewLicenceService, 'default').mockResolvedValue({
          backLink: '/system/monitoring-stations/499247a2-bebf-4a94-87dc-b83af2a133f3',
          lastAlertSent: 'Warning letter on 13 August 2024 sent to Big Farm Co Ltd',
          licenceTags: [
            {
              created: 'Created on 23 April 2025 by environment.officer@wrls.gov.uk',
              effectOfRestriction: 'There are some effects of restriction on the licence',
              licenceVersionStatus: 'superseded',
              linkedCondition: 'Flow cessation condition',
              tag: 'Reduce tag',
              threshold: '175Ml/d',
              type: 'Reduce'
            }
          ],
          monitoringStationName: 'The Station',
          pageTitle: 'Details for 99/9999',
          permissionToManageLinks: true
        })
      })

      describe('when the request succeeds', () => {
        it('returns the page successfully', async () => {
          const response = await server.inject(options)

          expect(response.statusCode).toEqual(HTTP_STATUS_OK)
          expect(response.payload).toContain('Details for 99/9999')
        })
      })
    })
  })
})
