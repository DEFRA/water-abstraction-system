'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const FetchLicenceTagDetailsService = require('../../../app/services/monitoring-stations/fetch-licence-tag-details.service.js')

// Thing under test
const LicenceService = require('../../../app/services/monitoring-stations/licence.service.js')

describe('Monitoring Stations - Licence service', () => {
  const lastAlert = undefined
  const licenceId = '33615d39-cc4e-4747-9c27-2dfa49fe73bf'
  const monitoringStationId = '863c375f-4f8d-4633-af0e-a2298f6f174e'
  const monitoringStationLicenceTags = {
    id: monitoringStationId,
    label: 'The Station',
    riverName: '',
    licenceMonitoringStations: [
      {
        id: '27a7dc96-fad9-4b38-9117-c09623e99a9f',
        createdAt: new Date('2025-04-23'),
        licenceId,
        restrictionType: 'reduce',
        thresholdUnit: 'Ml/d',
        thresholdValue: 175,
        licence: {
          licenceRef: '99/999'
        },
        user: {
          username: 'environment.officer@wrls.gov.uk'
        },
        licenceVersionPurposeCondition: undefined
      }
    ]
  }

  beforeEach(() => {
    Sinon.stub(FetchLicenceTagDetailsService, 'go').resolves({ lastAlert, monitoringStationLicenceTags })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns the page data for the view', async () => {
      const result = await LicenceService.go(licenceId, monitoringStationId)

      expect(result).to.equal({
        activeNavBar: 'search',
        backLink: '/system/monitoring-stations/863c375f-4f8d-4633-af0e-a2298f6f174e',
        lastAlertSent: 'N/A',
        licenceTags: [
          {
            created: 'Created on 23 April 2025 by environment.officer@wrls.gov.uk',
            effectOfRestriction: null,
            licenceVersionStatus: null,
            linkedCondition: 'Not linked to a condition',
            tag: 'Reduce tag',
            threshold: '175Ml/d',
            type: 'Reduce'
          }
        ],
        monitoringStationName: 'The Station',
        pageTitle: 'Details for 99/999'
      })
    })
  })
})
