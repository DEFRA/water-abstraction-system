'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ViewPresenter = require('../../../app/presenters/monitoring-stations/view.presenter.js')

describe('Monitoring Stations - View presenter', () => {
  let auth
  let licenceMonitoringStations
  let monitoringStation

  beforeEach(() => {
    auth = {
      credentials: {
        scope: ['billing', 'hof_notifications', 'manage_gauging_station_licence_links']
      }
    }

    monitoringStation = {
      catchmentName: null,
      gridReference: 'TL2664640047',
      id: 'f122d4bb-42bd-4af9-a081-1656f5a30b63',
      label: 'BUSY POINT',
      riverName: null,
      stationReference: null,
      wiskiId: null
    }

    licenceMonitoringStations = [
      {
        abstractionPeriodEndDay: '31',
        abstractionPeriodEndMonth: '08',
        abstractionPeriodStartDay: '01',
        abstractionPeriodStartMonth: '04',
        id: '3ee344db-784c-4d21-8d53-e50833f7e848',
        measureType: 'flow',
        restrictionType: 'reduce',
        thresholdUnit: 'm3/s',
        thresholdValue: 100,
        latestNotification: null,
        licence: {
          id: '3cd1481c-e96a-45fc-8f2b-1849564b95a5',
          licenceRef: 'AT/TEST'
        },
        licenceVersionPurposeCondition: null
      }
    ]
  })

  it('correctly presents the data', () => {
    const result = ViewPresenter.go(monitoringStation, licenceMonitoringStations, auth)

    expect(result).to.equal({
      backLink: { href: '/licences', text: 'Go back to search' },
      buttons: {
        createAlert: { href: '/system/notices/setup/alerts?monitoringStationId=f122d4bb-42bd-4af9-a081-1656f5a30b63' },
        tagLicence: { value: 'f122d4bb-42bd-4af9-a081-1656f5a30b63' }
      },
      gridReference: 'TL2664640047',
      pageTitle: 'BUSY POINT',
      pageTitleCaption: null,
      restrictionHeading: 'Flow restriction type and threshold',
      restrictions: [
        {
          action: {
            link: '/system/monitoring-stations/f122d4bb-42bd-4af9-a081-1656f5a30b63/licence/3cd1481c-e96a-45fc-8f2b-1849564b95a5',
            text: 'View'
          },
          abstractionPeriod: '1 April to 31 August',
          alert: '',
          alertDate: '',
          licenceId: '3cd1481c-e96a-45fc-8f2b-1849564b95a5',
          licenceRef: 'AT/TEST',
          restriction: 'Reduce',
          restrictionCount: 1,
          threshold: '100m3/s'
        }
      ],
      stationReference: '',
      wiskiId: ''
    })
  })

  describe('the "buttons" property', () => {
    describe('the "createAlert" button', () => {
      describe('when there are no restrictions', () => {
        beforeEach(() => {
          licenceMonitoringStations = []
        })

        it('returns null', () => {
          const result = ViewPresenter.go(monitoringStation, licenceMonitoringStations, auth)

          expect(result.buttons.createAlert).to.be.null()
        })
      })

      describe('when there are no restrictions', () => {
        describe('but the user does not have permission to create abstraction alerts', () => {
          beforeEach(() => {
            auth.credentials.scope = ['billing', 'manage_gauging_station_licence_links']
          })

          it('returns null', () => {
            const result = ViewPresenter.go(monitoringStation, licenceMonitoringStations, auth)

            expect(result.buttons.createAlert).to.be.null()
          })
        })

        describe('and the user has permission to create abstraction alerts', () => {
          it('returns the "href" needed for the button', () => {
            const result = ViewPresenter.go(monitoringStation, licenceMonitoringStations, auth)

            expect(result.buttons.createAlert).to.equal({
              href: '/system/notices/setup/alerts?monitoringStationId=f122d4bb-42bd-4af9-a081-1656f5a30b63'
            })
          })
        })
      })
    })
  })

  describe('the "gridReference" property', () => {
    describe('when a monitoring station has a grid reference', () => {
      it('returns the grid reference', () => {
        const result = ViewPresenter.go(monitoringStation, licenceMonitoringStations, auth)

        expect(result.gridReference).to.equal('TL2664640047')
      })
    })

    describe('when a monitoring station does not have a grid reference', () => {
      beforeEach(() => {
        monitoringStation.gridReference = null
      })

      it('returns an empty string', () => {
        const result = ViewPresenter.go(monitoringStation, licenceMonitoringStations, auth)

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
        const result = ViewPresenter.go(monitoringStation, licenceMonitoringStations, auth)

        expect(result.pageTitle).to.equal('Test river at BUSY POINT')
      })
    })

    describe('when a monitoring station does not have an associated river', () => {
      it('returns just the monitoring station name', () => {
        const result = ViewPresenter.go(monitoringStation, licenceMonitoringStations, auth)

        expect(result.pageTitle).to.equal('BUSY POINT')
      })
    })
  })

  describe('the "pageTitleCaption" property', () => {
    describe('when a monitoring station has catchment name', () => {
      beforeEach(() => {
        monitoringStation.catchmentName = 'Test catchment'
      })

      it('returns the catchment name', () => {
        const result = ViewPresenter.go(monitoringStation, licenceMonitoringStations, auth)

        expect(result.pageTitleCaption).to.equal('Test catchment')
      })
    })

    describe('when a monitoring station does not have an associated river', () => {
      it('returns null', () => {
        const result = ViewPresenter.go(monitoringStation, licenceMonitoringStations, auth)

        expect(result.pageTitleCaption).to.be.null()
      })
    })
  })

  describe('the "restrictions" property', () => {
    describe('the "abstractionPeriod" property', () => {
      describe('when the licence monitoring station record is not linked to a licence condition', () => {
        it('returns the abstraction period set when the licence was tagged formatted for display', () => {
          const result = ViewPresenter.go(monitoringStation, licenceMonitoringStations, auth)

          expect(result.restrictions[0].abstractionPeriod).to.equal('1 April to 31 August')
        })
      })

      describe('when the licence monitoring station record is linked to a licence condition', () => {
        beforeEach(() => {
          licenceMonitoringStations[0].licenceVersionPurposeCondition = {
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
          const result = ViewPresenter.go(monitoringStation, licenceMonitoringStations, auth)

          expect(result.restrictions[0].abstractionPeriod).to.equal('1 September to 31 December')
        })
      })
    })
  })

  describe('the "stationReference" property', () => {
    describe('when a monitoring station has a station reference', () => {
      beforeEach(() => {
        monitoringStation.stationReference = 'STN12345'
      })

      it('returns the station reference', () => {
        const result = ViewPresenter.go(monitoringStation, licenceMonitoringStations, auth)

        expect(result.stationReference).to.equal('STN12345')
      })
    })

    describe('when a monitoring station does not have a station reference', () => {
      it('returns an empty string', () => {
        const result = ViewPresenter.go(monitoringStation, licenceMonitoringStations, auth)

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
        const result = ViewPresenter.go(monitoringStation, licenceMonitoringStations, auth)

        expect(result.wiskiId).to.equal('WSK12345')
      })
    })

    describe('when a monitoring station does not have a WSKI Id', () => {
      it('returns an empty string', () => {
        const result = ViewPresenter.go(monitoringStation, licenceMonitoringStations, auth)

        expect(result.wiskiId).to.equal('')
      })
    })
  })
})
