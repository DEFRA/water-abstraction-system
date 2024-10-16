'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ViewMonitoringStationPresenter = require('../../../app/presenters/monitoring-stations/view-monitoring-stations.presenter.js')

describe('View Monitoring Stations presenter', () => {
  let monitoringStationData
  let auth

  beforeEach(() => {
    auth = _auth()
    monitoringStationData = _testFetchMonitoringStationData()
  })

  describe('when provided with populated monitoring station and licence data', () => {
    it('correctly presents the data', () => {
      const result = ViewMonitoringStationPresenter.go(auth, monitoringStationData)

      expect(result).to.equal({
        pageTitle: 'MEVAGISSEY FIRE STATION',
        monitoringStationId: 'f122d4bb-42bd-4af9-a081-1656f5a30b63',
        monitoringStationName: 'MEVAGISSEY FIRE STATION',
        gridReference: 'TL2664640047',
        permissionToManageLinks: true,
        permissionToSendAlerts: true,
        wiskiId: '',
        stationReference: '',
        licences: [
          {
            id: '3cd1481c-e96a-45fc-8f2b-1849564b95a5',
            licenceRef: 'AT/TEST',
            linkages: [
              {
                abstractionPeriod: '1 April to 31 August',
                alertType: 'Reduce',
                alertUpdatedAt: '3 June 2021',
                createdAt: new Date('2021-06-03T12:00:04.000Z'),
                id: '3cd1481c-e96a-45fc-8f2b-1849564b95a5',
                lastUpdatedAt: null,
                licenceRef: 'AT/TEST',
                restrictionType: 'Flow',
                threshold: '100 m3/s'
              }
            ]
          }
        ]
      })
    })

    describe('the "gridReference" property', () => {
      describe('when the grid reference is not null', () => {
        it('returns the grid reference', () => {
          const result = ViewMonitoringStationPresenter.go(auth, monitoringStationData)

          expect(result.gridReference).to.equal('TL2664640047')
        })
      })

      describe('when the grid reference is null', () => {
        beforeEach(() => {
          monitoringStationData.gridReference = null
        })

        it('returns an empty string', () => {
          const result = ViewMonitoringStationPresenter.go(auth, monitoringStationData)

          expect(result.gridReference).to.equal('')
        })
      })
    })

    describe('the "licence" property', () => {
      describe('the "linkages" property', () => {
        describe('the "abstractionPeriod" property', () => {
          it('returns the licence abstraction period', () => {
            const result = ViewMonitoringStationPresenter.go(auth, monitoringStationData)

            expect(result.licences[0].linkages[0].abstractionPeriod).to.equal('1 April to 31 August')
          })
        })

        describe('the "alertType" property', () => {
          describe('when the "alertType" is "reduce"', () => {
            beforeEach(() => {
              monitoringStationData.licenceMonitoringStations[0].alertType = 'reduce'
            })

            it('returns "Reduce" as the "alertType"', () => {
              const result = ViewMonitoringStationPresenter.go(auth, monitoringStationData)

              expect(result.licences[0].linkages[0].alertType).to.equal('Reduce')
            })
          })

          describe('when the "alertType" is "stop"', () => {
            beforeEach(() => {
              monitoringStationData.licenceMonitoringStations[0].alertType = 'stop'
            })

            it('returns "Stop" as the "alertType"', () => {
              const result = ViewMonitoringStationPresenter.go(auth, monitoringStationData)

              expect(result.licences[0].linkages[0].alertType).to.equal('Stop')
            })
          })

          describe('when the "alertType" is "stop_or_reduce"', () => {
            beforeEach(() => {
              monitoringStationData.licenceMonitoringStations[0].alertType = 'stop_or_reduce'
            })

            it('returns "Stop or reduce" as the "alertType"', () => {
              const result = ViewMonitoringStationPresenter.go(auth, monitoringStationData)

              expect(result.licences[0].linkages[0].alertType).to.equal('Stop or reduce')
            })
          })
        })

        describe('the "alertUpdatedAt" property', () => {
          describe('when the licence has a populated "createdAt" property', () => {
            beforeEach(() => {
              monitoringStationData.licenceMonitoringStations[0].statusUpdatedAt = null
              monitoringStationData.licenceMonitoringStations[0].createdAt = new Date('2021-07-21 09:03:56.848')
            })

            it('returns "alertUpdatedAt" as the same value as the "statusUpdatedAt" property', () => {
              const result = ViewMonitoringStationPresenter.go(auth, monitoringStationData)

              expect(result.licences[0].linkages[0].alertUpdatedAt).to.equal('21 July 2021')
            })
          })

          describe('when the licence has a populated "statusUpdatedAt" property', () => {
            beforeEach(() => {
              monitoringStationData.licenceMonitoringStations[0].statusUpdatedAt = new Date('2021-06-30 09:03:56.848')
            })

            it('returns "alertUpdatedAt" as the same value as the "statusUpdatedAt" property', () => {
              const result = ViewMonitoringStationPresenter.go(auth, monitoringStationData)

              expect(result.licences[0].linkages[0].alertUpdatedAt).to.equal('30 June 2021')
            })
          })
        })

        describe('the "restrictionType" property', () => {
          describe('when the licence "restrictionType" property is "flow"', () => {
            beforeEach(() => {
              monitoringStationData.licenceMonitoringStations[0].restrictionType = 'flow'
            })

            it('returns "Flow" as the "restrictionType" property', () => {
              const result = ViewMonitoringStationPresenter.go(auth, monitoringStationData)

              expect(result.licences[0].linkages[0].restrictionType).to.equal('Flow')
            })
          })

          describe('when the licence "restrictionType" property is "level"', () => {
            beforeEach(() => {
              monitoringStationData.licenceMonitoringStations[0].restrictionType = 'level'
            })

            it('returns "Level" as the "restrictionType" property', () => {
              const result = ViewMonitoringStationPresenter.go(auth, monitoringStationData)

              expect(result.licences[0].linkages[0].restrictionType).to.equal('Level')
            })
          })
        })

        describe('the "threshold" property', () => {
          it('returns the licence threshold', () => {
            const result = ViewMonitoringStationPresenter.go(auth, monitoringStationData)

            expect(result.licences[0].linkages[0].threshold).to.equal('100 m3/s')
          })
        })

        describe('when a there are multiple licences in the "linkages" property', () => {
          beforeEach(() => {
            monitoringStationData.licenceMonitoringStations.push({
              abstractionPeriodStartDay: '02',
              abstractionPeriodStartMonth: '05',
              abstractionPeriodEndDay: '30',
              abstractionPeriodEndMonth: '09',
              alertType: 'stop_or_reduce',
              createdAt: new Date('2020-06-03 12:00:04.000'),
              restrictionType: 'level',
              statusUpdatedAt: null,
              thresholdUnit: 'm3/s',
              thresholdValue: 500,
              licence: {
                id: '3cd1481c-e96a-45fc-8f2b-1849564b95a5',
                licenceRef: 'AT/TEST'
              }
            })

            monitoringStationData.licenceMonitoringStations.push({
              abstractionPeriodStartDay: '01',
              abstractionPeriodStartMonth: '02',
              abstractionPeriodEndDay: '22',
              abstractionPeriodEndMonth: '07',
              alertType: 'reduce',
              createdAt: new Date('2021-06-03 12:00:04.000'),
              restrictionType: 'flow',
              statusUpdatedAt: null,
              thresholdUnit: 'm3/s',
              thresholdValue: 250,
              licence: {
                id: 'fb46704b-0e8c-488e-9b58-faf87b6d9a01',
                licenceRef: 'AT/TEST/2'
              }
            })
          })

          it('returns the licences in order of `licenceRef` and groups licences with the same `licence.id` in order of `createdAt` descending', () => {
            const result = ViewMonitoringStationPresenter.go(auth, monitoringStationData)

            expect(result).to.equal({
              pageTitle: 'MEVAGISSEY FIRE STATION',
              monitoringStationId: 'f122d4bb-42bd-4af9-a081-1656f5a30b63',
              monitoringStationName: 'MEVAGISSEY FIRE STATION',
              gridReference: 'TL2664640047',
              permissionToManageLinks: true,
              permissionToSendAlerts: true,
              wiskiId: '',
              stationReference: '',
              licences: [
                {
                  id: '3cd1481c-e96a-45fc-8f2b-1849564b95a5',
                  licenceRef: 'AT/TEST',
                  linkages: [{
                    abstractionPeriod: '1 April to 31 August',
                    alertType: 'Reduce',
                    alertUpdatedAt: '3 June 2021',
                    createdAt: new Date('2021-06-03T12:00:04.000Z'),
                    lastUpdatedAt: null,
                    id: '3cd1481c-e96a-45fc-8f2b-1849564b95a5',
                    licenceRef: 'AT/TEST',
                    restrictionType: 'Flow',
                    threshold: '100 m3/s'
                  },
                  {
                    abstractionPeriod: '2 May to 30 September',
                    alertType: 'Stop or reduce',
                    alertUpdatedAt: '3 June 2020',
                    createdAt: new Date('2020-06-03T12:00:04.000Z'),
                    lastUpdatedAt: null,
                    id: '3cd1481c-e96a-45fc-8f2b-1849564b95a5',
                    licenceRef: 'AT/TEST',
                    restrictionType: 'Level',
                    threshold: '500 m3/s'
                  }]
                },
                {
                  id: 'fb46704b-0e8c-488e-9b58-faf87b6d9a01',
                  licenceRef: 'AT/TEST/2',
                  linkages: [{
                    abstractionPeriod: '1 February to 22 July',
                    alertType: 'Reduce',
                    alertUpdatedAt: '3 June 2021',
                    createdAt: new Date('2021-06-03T12:00:04.000Z'),
                    lastUpdatedAt: null,
                    id: 'fb46704b-0e8c-488e-9b58-faf87b6d9a01',
                    licenceRef: 'AT/TEST/2',
                    restrictionType: 'Flow',
                    threshold: '250 m3/s'
                  }]
                }
              ]
            })
          })
        })
      })
    })

    describe('the "pageTitle" property', () => {
      describe('when a monitoring station has an associated river', () => {
        beforeEach(() => {
          monitoringStationData.riverName = 'Test river'
        })

        it('returns the river name followed by the monitoring station name', () => {
          const result = ViewMonitoringStationPresenter.go(auth, monitoringStationData)

          expect(result.pageTitle).to.equal('Test river at MEVAGISSEY FIRE STATION')
        })
      })

      describe('when a monitoring station does not have an associated river', () => {
        it('returns the monitoring station name', () => {
          const result = ViewMonitoringStationPresenter.go(auth, monitoringStationData)

          expect(result.pageTitle).to.equal('MEVAGISSEY FIRE STATION')
        })
      })
    })

    describe('the "permissionToManageLinks" property', () => {
      describe('when a user has the "manage_gauging_station_licence_links" role', () => {
        it('returns true for "permissionToManageLinks"', () => {
          const result = ViewMonitoringStationPresenter.go(auth, monitoringStationData)

          expect(result.permissionToManageLinks).to.equal(true)
        })
      })

      describe('when a user does not have the "manage_gauging_station_licence_links" role', () => {
        beforeEach(() => {
          auth.credentials.scope = [
            'billing',
            'hof_notifications'
          ]
        })

        it('returns false for "permissionToManageLinks"', () => {
          const result = ViewMonitoringStationPresenter.go(auth, monitoringStationData)

          expect(result.permissionToManageLinks).to.equal(false)
        })
      })
    })

    describe('the "permissionToSendAlerts" property', () => {
      describe('when a user has the "hof_notifications" role', () => {
        it('returns true for "permissionToSendAlerts"', () => {
          const result = ViewMonitoringStationPresenter.go(auth, monitoringStationData)

          expect(result.permissionToSendAlerts).to.equal(true)
        })
      })

      describe('when a user does not have the "hof_notifications" role', () => {
        beforeEach(() => {
          auth.credentials.scope = [
            'billing',
            'manage_gauging_station_licence_links'
          ]
        })

        it('returns false for "permissionToSendAlerts"', () => {
          const result = ViewMonitoringStationPresenter.go(auth, monitoringStationData)

          expect(result.permissionToSendAlerts).to.equal(false)
        })
      })
    })

    describe('the "stationReference" property', () => {
      describe('when the station reference is not null', () => {
        beforeEach(() => {
          monitoringStationData.stationReference = 'Crabble Mill GS'
        })

        it('returns the station reference', () => {
          const result = ViewMonitoringStationPresenter.go(auth, monitoringStationData)

          expect(result.stationReference).to.equal('Crabble Mill GS')
        })
      })

      describe('when the station reference is null', () => {
        it('returns an empty string', () => {
          const result = ViewMonitoringStationPresenter.go(auth, monitoringStationData)

          expect(result.stationReference).to.equal('')
        })
      })
    })

    describe('the "wiskiId" property', () => {
      describe('when the WISKI ID is not null', () => {
        beforeEach(() => {
          monitoringStationData.wiskiId = 'E5082'
        })

        it('returns the WISKI ID', () => {
          const result = ViewMonitoringStationPresenter.go(auth, monitoringStationData)

          expect(result.wiskiId).to.equal('E5082')
        })
      })

      describe('when the WISKI ID is null', () => {
        it('returns an empty string', () => {
          const result = ViewMonitoringStationPresenter.go(auth, monitoringStationData)

          expect(result.wiskiId).to.equal('')
        })
      })
    })
  })
})

function _auth () {
  return {
    credentials: {
      scope: [
        'billing',
        'hof_notifications',
        'manage_gauging_station_licence_links'
      ]
    }
  }
}

function _testFetchMonitoringStationData () {
  return {
    id: 'f122d4bb-42bd-4af9-a081-1656f5a30b63',
    gridReference: 'TL2664640047',
    label: 'MEVAGISSEY FIRE STATION',
    riverName: null,
    stationReference: null,
    wiskiId: null,
    licenceMonitoringStations: [
      {
        abstractionPeriodStartDay: '01',
        abstractionPeriodStartMonth: '04',
        abstractionPeriodEndDay: '31',
        abstractionPeriodEndMonth: '08',
        alertType: 'reduce',
        createdAt: new Date('2021-06-03 12:00:04.000'),
        restrictionType: 'flow',
        statusUpdatedAt: null,
        thresholdUnit: 'm3/s',
        thresholdValue: 100,
        licence: {
          id: '3cd1481c-e96a-45fc-8f2b-1849564b95a5',
          licenceRef: 'AT/TEST'
        }
      }
    ]
  }
}
