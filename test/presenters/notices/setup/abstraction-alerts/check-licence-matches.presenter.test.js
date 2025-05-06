'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AbstractionAlertSessionData = require('../../../../fixtures/abstraction-alert-session-data.fixture.js')

// Thing under test
const CheckLicenceMatchesPresenter = require('../../../../../app/presenters/notices/setup/abstraction-alerts/check-licence-matches.presenter.js')

describe('Notices Setup - Abstraction Alerts - Check Licence Matches Presenter', () => {
  let abstractionAlertSessionData
  let licenceWithThreshold
  let session

  beforeEach(() => {
    abstractionAlertSessionData = AbstractionAlertSessionData.monitoringStation()

    licenceWithThreshold = abstractionAlertSessionData.licenceMonitoringStations[0]

    session = {
      ...abstractionAlertSessionData,
      alertThresholds: [licenceWithThreshold.id]
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CheckLicenceMatchesPresenter.go(session)

      expect(result).to.equal({
        licences: [
          {
            licenceRef: licenceWithThreshold.licence_ref,
            thresholds: [
              {
                abstractionPeriod: '1 February to 1 January',
                flow: 'reduce',
                threshold: '1000 m'
              }
            ]
          }
        ]
      })
    })

    describe('when the licence has one licence monitoring station', () => {
      it('returns the selected thresholds from the "alertThresholds"', () => {
        const result = CheckLicenceMatchesPresenter.go(session)

        expect(result.licences).to.equal([
          {
            licenceRef: licenceWithThreshold.licence_ref,
            thresholds: [
              {
                abstractionPeriod: '1 February to 1 January',
                flow: 'reduce',
                threshold: '1000 m'
              }
            ]
          }
        ])
      })
    })

    describe('when the licence has more than one threshold', () => {
      let licenceWithMultipleThresholds

      beforeEach(() => {
        abstractionAlertSessionData = AbstractionAlertSessionData.monitoringStation()

        licenceWithMultipleThresholds = abstractionAlertSessionData.licenceMonitoringStations[1]

        session = {
          ...abstractionAlertSessionData,
          alertThresholds: ['1', '2']
        }
      })

      it('returns the selected thresholds from the "alertThresholds"', () => {
        const result = CheckLicenceMatchesPresenter.go(session)

        expect(result.licences).to.equal([
          {
            licenceRef: licenceWithMultipleThresholds.licence_ref,
            thresholds: [
              {
                abstractionPeriod: '1 January to 3 March',
                flow: 'reduce',
                threshold: '100 m3/s'
              },
              {
                abstractionPeriod: '4 February to 4 April',
                flow: 'stop',
                threshold: '1000 m'
              }
            ]
          }
        ])
      })
    })
  })
})
