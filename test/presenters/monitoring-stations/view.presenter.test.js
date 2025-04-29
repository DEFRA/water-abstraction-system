'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')

// Thing under test
const ViewPresenter = require('../../../app/presenters/monitoring-stations/view.presenter.js')

describe('Monitoring Stations - View presenter', () => {
  let auth
  let monitoringStation

  beforeEach(() => {
    auth = {
      credentials: {
        scope: ['billing', 'hof_notifications', 'manage_gauging_station_licence_links']
      }
    }

    monitoringStation = {
      id: 'f122d4bb-42bd-4af9-a081-1656f5a30b63',
      gridReference: 'TL2664640047',
      label: 'BUSY POINT',
      riverName: null,
      stationReference: null,
      wiskiId: null,
      licenceMonitoringStations: [
        {
          id: '3ee344db-784c-4d21-8d53-e50833f7e848',
          abstractionPeriodEndDay: '31',
          abstractionPeriodEndMonth: '08',
          abstractionPeriodStartDay: '01',
          abstractionPeriodStartMonth: '04',
          licence: {
            id: '3cd1481c-e96a-45fc-8f2b-1849564b95a5',
            licenceRef: 'AT/TEST'
          },
          licenceId: '3cd1481c-e96a-45fc-8f2b-1849564b95a5',
          licenceVersionPurposeCondition: null,
          measureType: 'flow',
          restrictionType: 'reduce',
          status: 'resume',
          statusUpdatedAt: null,
          thresholdUnit: 'm3/s',
          thresholdValue: 100
        }
      ]
    }

    Sinon.stub(FeatureFlagsConfig, 'enableMonitoringStationsAlertNotifications').value(true)
  })

  describe('when provided with the result of the fetch monitoring service', () => {
    it('correctly presents the data', () => {
      const result = ViewPresenter.go(monitoringStation, auth)

      expect(result).to.equal({
        enableLicenceMonitoringStationsSetup: true,
        links: {
          createAlert: `/system/notifications/setup?journey=abstraction-alert&monitoringStationId=${monitoringStation.id}`
        },
        gridReference: 'TL2664640047',
        monitoringStationId: 'f122d4bb-42bd-4af9-a081-1656f5a30b63',
        pageTitle: 'BUSY POINT',
        permissionToManageLinks: true,
        permissionToSendAlerts: true,
        restrictionHeading: 'Flow restriction type and threshold',
        restrictions: [
          {
            abstractionPeriod: '1 April to 31 August',
            alert: null,
            alertDate: null,
            licenceId: '3cd1481c-e96a-45fc-8f2b-1849564b95a5',
            licenceRef: 'AT/TEST',
            restriction: 'Reduce',
            restrictionCount: 1,
            threshold: '100 m3/s'
          }
        ],
        stationReference: '',
        wiskiId: ''
      })
    })
  })

  describe('the "links" property', () => {
    describe('when the link is "createAlert" ', () => {
      describe('and the "enableMonitoringStationsAlertNotifications" flag  is true', () => {
        it('returns the link', () => {
          const result = ViewPresenter.go(monitoringStation, auth)

          expect(result.links.createAlert).to.equal(
            `/system/notifications/setup?journey=abstraction-alert&monitoringStationId=${monitoringStation.id}`
          )
        })
      })

      describe('and the "enableMonitoringStationsAlertNotifications" flag  is false', () => {
        beforeEach(() => {
          Sinon.stub(FeatureFlagsConfig, 'enableMonitoringStationsAlertNotifications').value(false)
        })

        it('returns the legacy link', () => {
          const result = ViewPresenter.go(monitoringStation, auth)

          expect(result.links.createAlert).to.equal(
            `/monitoring-stations/${monitoringStation.id}/send-alert/alert-type`
          )
        })
      })
    })

    describe('the "gridReference" property', () => {
      describe('when a monitoring station has a grid reference', () => {
        it('returns the grid reference', () => {
          const result = ViewPresenter.go(monitoringStation, auth)

          expect(result.gridReference).to.equal('TL2664640047')
        })
      })

      describe('when a monitoring station does not have a grid reference', () => {
        beforeEach(() => {
          monitoringStation.gridReference = null
        })

        it('returns an empty string', () => {
          const result = ViewPresenter.go(monitoringStation, auth)

          expect(result.gridReference).to.equal('')
        })
      })
    })

    describe('the "pageTitle" property', () => {
      describe('when a monitoring station has an associated river', () => {
        beforeEach(() => {
          monitoringStation.riverName = 'Test river'
        })

        it('returns the river name followed by the monitoring station name', () => {
          const result = ViewPresenter.go(monitoringStation, auth)

          expect(result.pageTitle).to.equal('Test river at BUSY POINT')
        })
      })

      describe('when a monitoring station does not have an associated river', () => {
        it('returns just the monitoring station name', () => {
          const result = ViewPresenter.go(monitoringStation, auth)

          expect(result.pageTitle).to.equal('BUSY POINT')
        })
      })
    })

    describe('the "permissionToManageLinks" property', () => {
      describe('when a user has the "manage_gauging_station_licence_links" role', () => {
        it('returns true for "permissionToManageLinks"', () => {
          const result = ViewPresenter.go(monitoringStation, auth)

          expect(result.permissionToManageLinks).to.equal(true)
        })
      })

      describe('when a user does not have the "manage_gauging_station_licence_links" role', () => {
        beforeEach(() => {
          auth.credentials.scope = ['billing', 'hof_notifications']
        })

        it('returns false for "permissionToManageLinks"', () => {
          const result = ViewPresenter.go(monitoringStation, auth)

          expect(result.permissionToManageLinks).to.equal(false)
        })
      })
    })

    describe('the "permissionToSendAlerts" property', () => {
      describe('when a user has the "hof_notifications" role', () => {
        it('returns true for "permissionToSendAlerts"', () => {
          const result = ViewPresenter.go(monitoringStation, auth)

          expect(result.permissionToSendAlerts).to.equal(true)
        })
      })

      describe('when a user does not have the "hof_notifications" role', () => {
        beforeEach(() => {
          auth.credentials.scope = ['billing', 'manage_gauging_station_licence_links']
        })

        it('returns false for "permissionToSendAlerts"', () => {
          const result = ViewPresenter.go(monitoringStation, auth)

          expect(result.permissionToSendAlerts).to.equal(false)
        })
      })
    })

    describe('the "restrictionHeading" property', () => {
      describe('when the monitoring station has only "flow" based licence monitoring station records', () => {
        it('returns "Flow restriction type and threshold"', () => {
          const result = ViewPresenter.go(monitoringStation, auth)

          expect(result.restrictionHeading).to.equal('Flow restriction type and threshold')
        })
      })

      describe('when the monitoring station has only "level" based licence monitoring station records', () => {
        beforeEach(() => {
          monitoringStation.licenceMonitoringStations[0].measureType = 'level'
        })

        it('returns "Flow restriction type and threshold"', () => {
          const result = ViewPresenter.go(monitoringStation, auth)

          expect(result.restrictionHeading).to.equal('Level restriction type and threshold')
        })
      })

      describe('when the monitoring station has both "flow" and "level" based licence monitoring station records', () => {
        beforeEach(() => {
          const secondLicenceMonitoringStation = { ...monitoringStation.licenceMonitoringStations[0] }

          secondLicenceMonitoringStation.id = '6f498459-8b7e-48f9-bc88-293dce414e8d'
          secondLicenceMonitoringStation.measureType = 'level'
          monitoringStation.licenceMonitoringStations.push(secondLicenceMonitoringStation)
        })

        it('returns "Flow and level restriction type and threshold"', () => {
          const result = ViewPresenter.go(monitoringStation, auth)

          expect(result.restrictionHeading).to.equal('Flow and level restriction type and threshold')
        })
      })
    })

    describe('the "restrictions" property', () => {
      describe('the "abstraction" property', () => {
        describe('when the licence monitoring station record is not linked to a licence condition', () => {
          it('returns the abstraction period set when the licence was tagged formatted for display', () => {
            const result = ViewPresenter.go(monitoringStation, auth)

            expect(result.restrictions[0].abstractionPeriod).to.equal('1 April to 31 August')
          })
        })

        describe('when the licence monitoring station record is linked to a licence condition', () => {
          beforeEach(() => {
            monitoringStation.licenceMonitoringStations[0].licenceVersionPurposeCondition = {
              id: '1af72066-8340-4fb5-a06b-29c1301a6ac4',
              licenceVersionPurpose: {
                id: '0df7030f-435f-4d32-aaa8-de36bb34e9e6',
                abstractionPeriodEndDay: '31',
                abstractionPeriodEndMonth: '12',
                abstractionPeriodStartDay: '01',
                abstractionPeriodStartMonth: '09'
              }
            }
          })

          it("returns the abstraction period from the condition's licence purpose formatted for display", () => {
            const result = ViewPresenter.go(monitoringStation, auth)

            expect(result.restrictions[0].abstractionPeriod).to.equal('1 September to 31 December')
          })
        })
      })

      describe('the "alert" property', () => {
        describe('when the licence monitoring station record has never had an alert sent', () => {
          it('returns null', () => {
            const result = ViewPresenter.go(monitoringStation, auth)

            expect(result.restrictions[0].alert).to.be.null()
          })
        })

        describe('when the licence monitoring station record has had an alert sent', () => {
          beforeEach(() => {
            monitoringStation.licenceMonitoringStations[0].statusUpdatedAt = new Date('2024-06-17')
          })

          it('returns the current "status" formatted for display', () => {
            const result = ViewPresenter.go(monitoringStation, auth)

            expect(result.restrictions[0].alert).to.equal('Resume')
          })
        })
      })

      describe('the "alertDate" property', () => {
        describe('when the licence monitoring station record has never had an alert sent', () => {
          it('returns null', () => {
            const result = ViewPresenter.go(monitoringStation, auth)

            expect(result.restrictions[0].alertDate).to.be.null()
          })
        })

        describe('when the licence monitoring station record has had an alert sent', () => {
          beforeEach(() => {
            monitoringStation.licenceMonitoringStations[0].statusUpdatedAt = new Date('2024-06-17')
          })

          it('returns the "statusUpdatedAt" formatted for display', () => {
            const result = ViewPresenter.go(monitoringStation, auth)

            expect(result.restrictions[0].alertDate).to.equal('17 June 2024')
          })
        })
      })

      describe('the "restriction" property', () => {
        describe("when the licence monitoring station record's restriction type is 'stop_or_reduce'", () => {
          beforeEach(() => {
            monitoringStation.licenceMonitoringStations[0].restrictionType = 'stop_or_reduce'
          })

          it('returns "Stop or reduce"', () => {
            const result = ViewPresenter.go(monitoringStation, auth)

            expect(result.restrictions[0].restriction).to.equal('Stop or reduce')
          })
        })

        describe("when the licence monitoring station record's restriction type is 'reduce'", () => {
          beforeEach(() => {
            monitoringStation.licenceMonitoringStations[0].restrictionType = 'reduce'
          })

          it('returns "Reduce"', () => {
            const result = ViewPresenter.go(monitoringStation, auth)

            expect(result.restrictions[0].restriction).to.equal('Reduce')
          })
        })

        describe("when the licence monitoring station record's restriction type is 'stop'", () => {
          beforeEach(() => {
            monitoringStation.licenceMonitoringStations[0].restrictionType = 'stop'
          })

          it('returns "Stop"', () => {
            const result = ViewPresenter.go(monitoringStation, auth)

            expect(result.restrictions[0].restriction).to.equal('Stop')
          })
        })
      })

      describe('the "restrictionCount" property', () => {
        beforeEach(() => {
          const secondLicenceMonitoringStation = { ...monitoringStation.licenceMonitoringStations[0] }

          secondLicenceMonitoringStation.id = '6f498459-8b7e-48f9-bc88-293dce414e8d'
          monitoringStation.licenceMonitoringStations.push(secondLicenceMonitoringStation)
        })

        it('returns returns the count of licence monitoring stations for the licence linked to this monitoring station', () => {
          const result = ViewPresenter.go(monitoringStation, auth)

          expect(result.restrictions[0].restrictionCount).to.equal(2)
        })
      })
    })

    describe('the "stationReference" property', () => {
      describe('when a monitoring station has a station reference', () => {
        beforeEach(() => {
          monitoringStation.stationReference = 'STN12345'
        })

        it('returns the station reference', () => {
          const result = ViewPresenter.go(monitoringStation, auth)

          expect(result.stationReference).to.equal('STN12345')
        })
      })

      describe('when a monitoring station does not have a station reference', () => {
        it('returns an empty string', () => {
          const result = ViewPresenter.go(monitoringStation, auth)

          expect(result.stationReference).to.equal('')
        })
      })
    })

    describe('the "wiskiId" property', () => {
      describe('when a monitoring station has a WSKI Id', () => {
        beforeEach(() => {
          monitoringStation.wiskiId = 'WSK12345'
        })

        it('returns the WSKI Id', () => {
          const result = ViewPresenter.go(monitoringStation, auth)

          expect(result.wiskiId).to.equal('WSK12345')
        })
      })

      describe('when a monitoring station does not have a WSKI Id', () => {
        it('returns an empty string', () => {
          const result = ViewPresenter.go(monitoringStation, auth)

          expect(result.wiskiId).to.equal('')
        })
      })
    })
  })
})
