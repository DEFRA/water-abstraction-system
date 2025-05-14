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
  let licenceMonitoringStationOne
  let licenceMonitoringStationThree
  let licenceMonitoringStationTwo
  let session

  beforeEach(async () => {
    const abstractionAlertSessionData = AbstractionAlertSessionData.monitoringStation()
    licenceMonitoringStationOne = abstractionAlertSessionData.licenceMonitoringStations[0]
    licenceMonitoringStationTwo = abstractionAlertSessionData.licenceMonitoringStations[1]
    licenceMonitoringStationThree = abstractionAlertSessionData.licenceMonitoringStations[2]

    session = {
      ...abstractionAlertSessionData,
      alertThresholds: [
        licenceMonitoringStationOne.thresholdGroup,
        licenceMonitoringStationTwo.thresholdGroup,
        licenceMonitoringStationThree.thresholdGroup
      ]
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CheckLicenceMatchesPresenter.go(session)

      expect(result).to.equal({
        backLink: `/system/notices/setup/${session.id}/abstraction-alerts/alert-thresholds`,
        caption: 'Death star',
        pageTitle: 'Check the licence matches for the selected thresholds',
        restrictionHeading: 'Flow and level restriction type and threshold',
        restrictions: [
          {
            abstractionPeriod: '1 February to 1 January',
            action: {
              link: `/system/notices/setup/${session.id}/abstraction-alerts/remove/${licenceMonitoringStationOne.id}`,
              text: 'Remove'
            },
            alert: null,
            alertDate: null,
            licenceId: licenceMonitoringStationOne.licence.id,
            licenceRef: licenceMonitoringStationOne.licence.licenceRef,
            restriction: 'Reduce',
            restrictionCount: 1,
            threshold: '1000 m'
          },
          {
            abstractionPeriod: '1 January to 31 March',
            action: {
              link: `/system/notices/setup/${session.id}/abstraction-alerts/remove/${licenceMonitoringStationTwo.id}`,
              text: 'Remove'
            },
            alert: null,
            alertDate: null,
            licenceId: licenceMonitoringStationTwo.licence.id,
            licenceRef: licenceMonitoringStationTwo.licence.licenceRef,
            restriction: 'Stop',
            restrictionCount: 1,
            threshold: '100 m3/s'
          },
          {
            abstractionPeriod: '1 January to 31 March',
            action: {
              link: `/system/notices/setup/${session.id}/abstraction-alerts/remove/${licenceMonitoringStationThree.id}`,
              text: 'Remove'
            },
            alert: null,
            alertDate: null,
            licenceId: licenceMonitoringStationThree.licence.id,
            licenceRef: licenceMonitoringStationThree.licence.licenceRef,
            restriction: 'Stop',
            restrictionCount: 1,
            threshold: '100 m'
          }
        ]
      })
    })

    describe('the "restrictions" property', () => {
      describe('when there are selected "alertThresholds"', () => {
        beforeEach(() => {
          session.alertThresholds = [licenceMonitoringStationOne.thresholdGroup]
        })

        it('returns only the thresholds previously selected', () => {
          const result = CheckLicenceMatchesPresenter.go(session)

          expect(result.restrictions).to.equal([
            {
              abstractionPeriod: '1 February to 1 January',
              action: {
                link: `/system/notices/setup/${session.id}/abstraction-alerts/remove/${licenceMonitoringStationOne.id}`,
                text: 'Remove'
              },
              alert: null,
              alertDate: null,
              licenceId: licenceMonitoringStationOne.licence.id,
              licenceRef: licenceMonitoringStationOne.licence.licenceRef,
              restriction: 'Reduce',
              restrictionCount: 1,
              threshold: '1000 m'
            }
          ])
        })

        describe('the "action" property', () => {
          it('returns the correct action', () => {
            const result = CheckLicenceMatchesPresenter.go(session)

            expect(result.restrictions[0].action).to.equal({
              link: `/system/notices/setup/${session.id}/abstraction-alerts/remove/${licenceMonitoringStationOne.id}`,
              text: 'Remove'
            })
          })
        })

        describe('the "alertDate" property', () => {
          describe('when the "statusUpdatedAt" is not a date', () => {
            it('returns the correct action', () => {
              const result = CheckLicenceMatchesPresenter.go(session)

              expect(result.restrictions[0].alertDate).to.equal(null)
            })
          })

          describe('when the "statusUpdatedAt" is a string', () => {
            let statusUpdatedAt

            beforeEach(() => {
              statusUpdatedAt = new Date('2025-05-12')

              session.licenceMonitoringStations[0].statusUpdatedAt = statusUpdatedAt
            })
            it('returns the correct action', () => {
              const result = CheckLicenceMatchesPresenter.go(session)

              expect(result.restrictions[0].alertDate).to.equal('12 May 2025')
            })
          })
        })
      })
    })
  })
})
