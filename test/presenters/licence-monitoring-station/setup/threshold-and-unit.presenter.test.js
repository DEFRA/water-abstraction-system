// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import ThresholdAndUnitPresenter from '../../../../src/presenters/licence-monitoring-station/setup/threshold-and-unit.presenter.js'

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
      const result = ThresholdAndUnitPresenter(session)

      expect(result).toEqual({
        backLink: '/system/monitoring-stations/e1c44f9b-51c2-4aee-a518-5509d6f05869',
        displayUnits: [
          { checked: false, hint: { text: 'megalitres per day' }, text: 'Ml/d', value: 'Ml/d' },
          { checked: false, hint: { text: 'cubic metres per second' }, text: 'm3/s', value: 'm3/s' },
          { checked: false, hint: { text: 'cubic metres per day' }, text: 'm3/d', value: 'm3/d' },
          { checked: false, hint: { text: 'litres per second' }, text: 'l/s', value: 'l/s' },
          { checked: false, hint: { text: 'metres above ordnance datum' }, text: 'mAOD', value: 'mAOD' },
          { checked: false, hint: { text: 'metres below ordnance datum' }, text: 'mBOD', value: 'mBOD' },
          { checked: false, hint: { text: 'metres above sea datum' }, text: 'mASD', value: 'mASD' },
          { checked: false, hint: { text: 'metres' }, text: 'm', value: 'm' },
          { checked: false, hint: { text: 'south level datum' }, text: 'SLD', value: 'SLD' },
          { checked: false, hint: { text: 'cubic foot per second' }, text: 'ft3/s', value: 'ft3/s' },
          { checked: false, hint: { text: 'gallons per day' }, text: 'gpd', value: 'gpd' },
          { checked: false, hint: { text: 'million gallons per day' }, text: 'Mgpd', value: 'Mgpd' }
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
        const result = ThresholdAndUnitPresenter(session)

        expect(result.backLink).toEqual(
          '/system/licence-monitoring-station/setup/56b6545a-c8e9-4ecd-95fb-927677954f22/check'
        )
      })
    })

    describe('when the user has come from somewhere else', () => {
      it('returns a link back to the "Monitoring Station" page', () => {
        const result = ThresholdAndUnitPresenter(session)

        expect(result.backLink).toEqual('/system/monitoring-stations/e1c44f9b-51c2-4aee-a518-5509d6f05869')
      })
    })
  })

  describe('the "displayUnits" property', () => {
    describe('when the user has previously entered the unit', () => {
      beforeEach(() => {
        session.unit = 'mASD'
      })

      it('returns the "displayUnits" property populated to re-select the option', () => {
        const result = ThresholdAndUnitPresenter(session)

        expect(result.displayUnits).toEqual([
          { checked: false, hint: { text: 'megalitres per day' }, text: 'Ml/d', value: 'Ml/d' },
          { checked: false, hint: { text: 'cubic metres per second' }, text: 'm3/s', value: 'm3/s' },
          { checked: false, hint: { text: 'cubic metres per day' }, text: 'm3/d', value: 'm3/d' },
          { checked: false, hint: { text: 'litres per second' }, text: 'l/s', value: 'l/s' },
          { checked: false, hint: { text: 'metres above ordnance datum' }, text: 'mAOD', value: 'mAOD' },
          { checked: false, hint: { text: 'metres below ordnance datum' }, text: 'mBOD', value: 'mBOD' },
          { checked: true, hint: { text: 'metres above sea datum' }, text: 'mASD', value: 'mASD' },
          { checked: false, hint: { text: 'metres' }, text: 'm', value: 'm' },
          { checked: false, hint: { text: 'south level datum' }, text: 'SLD', value: 'SLD' },
          { checked: false, hint: { text: 'cubic foot per second' }, text: 'ft3/s', value: 'ft3/s' },
          { checked: false, hint: { text: 'gallons per day' }, text: 'gpd', value: 'gpd' },
          { checked: false, hint: { text: 'million gallons per day' }, text: 'Mgpd', value: 'Mgpd' }
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
        const result = ThresholdAndUnitPresenter(session)

        expect(result.threshold).toEqual('1000')
      })
    })
  })
})
