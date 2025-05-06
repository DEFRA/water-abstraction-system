'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const ThresholdAndUnitService = require('../../../../app/services/licence-monitoring-station/setup/threshold-and-unit.service.js')

describe('Licence Monitoring Station Setup - Threshold and Unit service', () => {
  let session

  before(async () => {
    session = await SessionHelper.add({
      data: {
        monitoringStationId: 'e1c44f9b-51c2-4aee-a518-5509d6f05869',
        label: 'Monitoring Station Label'
      }
    })
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await ThresholdAndUnitService.go(session.id)

      expect(result.sessionId).to.equal(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await ThresholdAndUnitService.go(session.id)

      expect(result).to.equal(
        {
          activeNavBar: 'search',
          backLink: '/system/monitoring-stations/e1c44f9b-51c2-4aee-a518-5509d6f05869',
          displayUnits: [
            { value: 'Ml/d', text: 'Ml/d', selected: false },
            { value: 'm3/s', text: 'm3/s', selected: false },
            { value: 'm3/d', text: 'm3/d', selected: false },
            { value: 'l/s', text: 'l/s', selected: false },
            { value: 'mAOD', text: 'mAOD', selected: false },
            { value: 'mBOD', text: 'mBOD', selected: false },
            { value: 'mASD', text: 'mASD', selected: false },
            { value: 'm', text: 'm', selected: false },
            { value: 'SLD', text: 'SLD', selected: false },
            { value: 'ft3/s', text: 'ft3/s', selected: false },
            { value: 'gpd', text: 'gpd', selected: false },
            { value: 'Mgpd', text: 'Mgpd', selected: false },
            { value: 'select', text: 'Select an option', selected: true }
          ],
          monitoringStationLabel: 'Monitoring Station Label',
          pageTitle: 'What is the licence hands-off flow or level threshold?',
          threshold: null
        },
        { skip: ['sessionId'] }
      )
    })
  })
})
