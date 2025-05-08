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
  let licenceMonitoringStation
  let licenceMonitoringStationSharedLicence
  let session

  beforeEach(() => {
    abstractionAlertSessionData = AbstractionAlertSessionData.monitoringStation()

    licenceMonitoringStation = abstractionAlertSessionData.licenceMonitoringStations[0]
    licenceMonitoringStationSharedLicence = abstractionAlertSessionData.licenceMonitoringStations[1]

    session = {
      ...abstractionAlertSessionData
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
              link: '/system',
              name: 'Remove'
            },
            alert: null,
            alertDate: null,
            licenceId: licenceMonitoringStation.licenceId,
            licenceRef: licenceMonitoringStation.licenceRef,
            restriction: 'Reduce',
            restrictionCount: 1,
            threshold: '1000 m'
          },
          {
            abstractionPeriod: '1 January to 31 March',
            action: {
              link: '/system',
              name: 'Remove'
            },
            alert: null,
            alertDate: null,
            licenceId: licenceMonitoringStationSharedLicence.licenceId,
            licenceRef: licenceMonitoringStationSharedLicence.licenceRef,
            restriction: 'Stop',
            restrictionCount: 2,
            threshold: '100 m3/s'
          },
          {
            abstractionPeriod: '1 January to 31 March',
            action: {
              link: '/system',
              name: 'Remove'
            },
            alert: null,
            alertDate: null,
            licenceId: licenceMonitoringStationSharedLicence.licenceId,
            licenceRef: licenceMonitoringStationSharedLicence.licenceRef,
            restriction: 'Stop',
            restrictionCount: 2,
            threshold: '100 m'
          }
        ]
      })
    })

    describe('the "restrictionHeading" property', () => {
      describe('when the monitoring station has only "flow" based licence monitoring station records', () => {
        beforeEach(() => {
          session.licenceMonitoringStations = [licenceMonitoringStation]
        })

        it('returns "Flow restriction type and threshold"', () => {
          const result = CheckLicenceMatchesPresenter.go(session)

          expect(result.restrictionHeading).to.equal('Flow restriction type and threshold')
        })
      })

      describe('when the monitoring station has only "level" based licence monitoring station records', () => {
        beforeEach(() => {
          session.licenceMonitoringStations = [
            {
              ...licenceMonitoringStation,
              measureType: 'level'
            }
          ]
        })

        it('returns "Flow restriction type and threshold"', () => {
          const result = CheckLicenceMatchesPresenter.go(session)

          expect(result.restrictionHeading).to.equal('Level restriction type and threshold')
        })
      })

      describe('when the monitoring station has both "flow" and "level" based licence monitoring station records', () => {
        it('returns "Flow and level restriction type and threshold"', () => {
          const result = CheckLicenceMatchesPresenter.go(session)

          expect(result.restrictionHeading).to.equal('Flow and level restriction type and threshold')
        })
      })
    })

    describe('the "restrictions" property', () => {
      describe('the "abstraction" property', () => {
        beforeEach(() => {
          session.licenceMonitoringStations = [licenceMonitoringStation]
        })

        it('returns the abstraction period', () => {
          const result = CheckLicenceMatchesPresenter.go(session)

          expect(result.restrictions[0].abstractionPeriod).to.equal('1 February to 1 January')
        })
      })

      describe('the "alert" property', () => {
        describe('when the licence monitoring station record has never had an alert sent', () => {
          it('returns null', () => {
            const result = CheckLicenceMatchesPresenter.go(session)

            expect(result.restrictions[0].alert).to.be.null()
          })
        })

        describe('when the licence monitoring station record has had an alert sent', () => {
          beforeEach(() => {
            session.licenceMonitoringStations = [
              {
                ...licenceMonitoringStation,
                statusUpdatedAt: '2020-01-01'
              }
            ]
          })

          it('returns the current "status" formatted for display', () => {
            const result = CheckLicenceMatchesPresenter.go(session)

            expect(result.restrictions[0].alert).to.equal('Resume')
          })
        })
      })

      describe('the "alertDate" property', () => {
        describe('when the licence monitoring station record has never had an alert sent', () => {
          it('returns null', () => {
            const result = CheckLicenceMatchesPresenter.go(session)

            expect(result.restrictions[0].alertDate).to.be.null()
          })
        })

        describe('when the licence monitoring station record has had an alert sent', () => {
          beforeEach(() => {
            session.licenceMonitoringStations = [
              {
                ...licenceMonitoringStation,
                statusUpdatedAt: '2020-01-01'
              }
            ]
          })

          it('returns the "statusUpdatedAt" formatted for display', () => {
            const result = CheckLicenceMatchesPresenter.go(session)

            expect(result.restrictions[0].alertDate).to.equal('1 January 2020')
          })
        })
      })

      describe('the "restriction" property', () => {
        describe("when the licence monitoring station record's restriction type is 'stop_or_reduce'", () => {
          beforeEach(() => {
            session.licenceMonitoringStations = [
              {
                ...licenceMonitoringStation,
                restrictionType: 'stop_or_reduce'
              }
            ]
          })

          it('returns "Stop or reduce"', () => {
            const result = CheckLicenceMatchesPresenter.go(session)

            expect(result.restrictions[0].restriction).to.equal('Stop or reduce')
          })
        })

        describe("when the licence monitoring station record's restriction type is 'reduce'", () => {
          beforeEach(() => {
            session.licenceMonitoringStations = [
              {
                ...licenceMonitoringStation,
                restrictionType: 'reduce'
              }
            ]
          })

          it('returns "Reduce"', () => {
            const result = CheckLicenceMatchesPresenter.go(session)

            expect(result.restrictions[0].restriction).to.equal('Reduce')
          })
        })

        describe("when the licence monitoring station record's restriction type is 'stop'", () => {
          beforeEach(() => {
            session.licenceMonitoringStations = [
              {
                ...licenceMonitoringStation,
                restrictionType: 'stop'
              }
            ]
          })

          it('returns "Stop"', () => {
            const result = CheckLicenceMatchesPresenter.go(session)

            expect(result.restrictions[0].restriction).to.equal('Stop')
          })
        })
      })

      describe('the "restrictionCount" property', () => {
        it('returns returns the count of licence monitoring stations for the licence linked to this monitoring station', () => {
          const result = CheckLicenceMatchesPresenter.go(session)

          expect(result.restrictions[1].restrictionCount).to.equal(2)
        })
      })
    })
  })
})
