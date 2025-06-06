'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ThresholdAndUnitPresenter = require('../../../../app/presenters/licence-monitoring-station/setup/threshold-and-unit.presenter.js')

describe('Licence Monitoring Station Setup - Threshold and Unit presenter', () => {
  let session

  beforeEach(() => {
    session = {
      id: '56b6545a-c8e9-4ecd-95fb-927677954f22',
      label: 'Monitoring Station Label',
      monitoringStationId: 'e1c44f9b-51c2-4aee-a518-5509d6f05869'
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data', () => {
      const result = ThresholdAndUnitPresenter.go(session)

      expect(result).to.equal({
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
        sessionId: '56b6545a-c8e9-4ecd-95fb-927677954f22',
        threshold: null
      })
    })
  })

  describe('the "backLink" property', () => {
    describe('when the user has come from the "check" page', () => {
      beforeEach(() => {
        session.checkPageVisited = true
      })

      it('returns a link back to the "check" page', () => {
        const result = ThresholdAndUnitPresenter.go(session)

        expect(result.backLink).to.equal(
          '/system/licence-monitoring-station/setup/56b6545a-c8e9-4ecd-95fb-927677954f22/check'
        )
      })
    })

    describe('when the user has come from somewhere else', () => {
      it('returns a link back to the "Monitoring Station" page', () => {
        const result = ThresholdAndUnitPresenter.go(session)

        expect(result.backLink).to.equal('/system/monitoring-stations/e1c44f9b-51c2-4aee-a518-5509d6f05869')
      })
    })
  })

  describe('the "displayUnits" property', () => {
    describe('when the user has previously entered the unit', () => {
      beforeEach(() => {
        session.unit = 'mASD'
      })

      it('returns the "displayUnits" property populated to re-select the option', () => {
        const result = ThresholdAndUnitPresenter.go(session)

        expect(result.displayUnits).to.equal([
          { value: 'Ml/d', text: 'Ml/d', hint: { text: 'megalitres per day' }, checked: false },
          { value: 'm3/s', text: 'm3/s', hint: { text: 'cubic metres per second' }, checked: false },
          { value: 'm3/d', text: 'm3/d', hint: { text: 'cubic metres per day' }, checked: false },
          { value: 'l/s', text: 'l/s', hint: { text: 'litres per second' }, checked: false },
          { value: 'mAOD', text: 'mAOD', hint: { text: 'metres above ordnance datum' }, checked: false },
          { value: 'mBOD', text: 'mBOD', hint: { text: 'metres below ordnance datum' }, checked: false },
          { value: 'mASD', text: 'mASD', hint: { text: 'metres above sea datum' }, checked: true },
          { value: 'm', text: 'm', hint: { text: 'metres' }, checked: false },
          { value: 'SLD', text: 'SLD', hint: { text: 'south level datum' }, checked: false },
          { value: 'ft3/s', text: 'ft3/s', hint: { text: 'cubic foot per second' }, checked: false },
          { value: 'gpd', text: 'gpd', hint: { text: 'gallons per day' }, checked: false },
          { value: 'Mgpd', text: 'Mgpd', hint: { text: 'million gallons per day' }, checked: false }
        ])
      })
    })
  })

  describe('the "threshold" property', () => {
    describe('when the user has previously entered threshold amount', () => {
      beforeEach(() => {
        session.threshold = '1000'
      })

      it('returns the "threshold" property populated to re-select the option', () => {
        const result = ThresholdAndUnitPresenter.go(session)

        expect(result.threshold).to.equal('1000')
      })
    })
  })
})
