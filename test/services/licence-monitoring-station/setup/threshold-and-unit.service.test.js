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
            { value: 'Ml/d', text: 'Ml/d', hint: { text: 'megalitres per day' }, checked: false },
            { value: 'm3/s', text: 'm3/s', hint: { text: 'cubic metres per second' }, checked: false },
            { value: 'm3/d', text: 'm3/d', hint: { text: 'cubic metres per day' }, checked: false },
            { value: 'l/s', text: 'l/s', hint: { text: 'litres per second' }, checked: false },
            { value: 'mAOD', text: 'mAOD', hint: { text: 'metres above ordnance datum' }, checked: false },
            { value: 'mBOD', text: 'mBOD', hint: { text: 'metres below ordnance datum' }, checked: false },
            { value: 'mASD', text: 'mASD', hint: { text: 'metres above sea datum' }, checked: false },
            { value: 'm', text: 'm', hint: { text: 'metres' }, checked: false },
            { value: 'SLD', text: 'SLD', hint: { text: 'south level datum' }, checked: false },
            { value: 'ft3/s', text: 'ft3/s', hint: { text: 'cubic foot per second' }, checked: false },
            { value: 'gpd', text: 'gpd', hint: { text: 'gallons per day' }, checked: false },
            { value: 'Mgpd', text: 'Mgpd', hint: { text: 'million gallons per day' }, checked: false }
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
