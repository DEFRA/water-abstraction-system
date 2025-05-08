'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const BasePresenter = require('../../../app/presenters/monitoring-stations/base.presenter.js')

describe('Monitoring Stations - Base presenter', () => {
  let licenceMonitoringStations

  beforeEach(() => {
    licenceMonitoringStations = [
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
  })

  describe('#restrictionHeading', () => {
    describe('when the monitoring station has only "flow" based licence monitoring station records', () => {
      it('returns "Flow restriction type and threshold"', () => {
        const result = BasePresenter.restrictionHeading(licenceMonitoringStations)

        expect(result).to.equal('Flow restriction type and threshold')
      })
    })

    describe('when the monitoring station has only "level" based licence monitoring station records', () => {
      beforeEach(() => {
        licenceMonitoringStations[0].measureType = 'level'
      })

      it('returns "Flow restriction type and threshold"', () => {
        const result = BasePresenter.restrictionHeading(licenceMonitoringStations)

        expect(result).to.equal('Level restriction type and threshold')
      })
    })

    describe('when the monitoring station has both "flow" and "level" based licence monitoring station records', () => {
      beforeEach(() => {
        const secondLicenceMonitoringStation = { ...licenceMonitoringStations[0] }

        secondLicenceMonitoringStation.id = '6f498459-8b7e-48f9-bc88-293dce414e8d'
        secondLicenceMonitoringStation.measureType = 'level'

        licenceMonitoringStations.push(secondLicenceMonitoringStation)
      })

      it('returns "Flow and level restriction type and threshold"', () => {
        const result = BasePresenter.restrictionHeading(licenceMonitoringStations)

        expect(result).to.equal('Flow and level restriction type and threshold')
      })
    })
  })

  describe('the "restrictions" property', () => {
    describe('the "abstraction" property', () => {
      it('returns the abstraction period', () => {
        const result = BasePresenter.restrictions(licenceMonitoringStations)

        expect(result[0].abstractionPeriod).to.equal('1 April to 31 August')
      })
    })

    describe('the "action" property', () => {
      describe('when the licence monitoring station has an action', () => {
        beforeEach(() => {
          licenceMonitoringStations[0].action = {
            link: `/system/licence-monitoring-station/${licenceMonitoringStations[0].id}`,
            text: 'View'
          }
        })

        it('returns the action object', () => {
          const result = BasePresenter.restrictions(licenceMonitoringStations)

          expect(result[0].action).to.equal({
            link: `/system/licence-monitoring-station/${licenceMonitoringStations[0].id}`,
            text: 'View'
          })
        })
      })

      describe('when the licence monitoring station has no action', () => {
        it('returns the action object', () => {
          const result = BasePresenter.restrictions(licenceMonitoringStations)

          expect(result[0].action).to.be.undefined()
        })
      })
    })

    describe('the "alert" property', () => {
      describe('when the licence monitoring station record has never had an alert sent', () => {
        it('returns null', () => {
          const result = BasePresenter.restrictions(licenceMonitoringStations)

          expect(result[0].alert).to.be.null()
        })
      })

      describe('when the licence monitoring station record has had an alert sent', () => {
        beforeEach(() => {
          licenceMonitoringStations[0].statusUpdatedAt = new Date('2024-06-17')
        })

        it('returns the current "status" formatted for display', () => {
          const result = BasePresenter.restrictions(licenceMonitoringStations)

          expect(result[0].alert).to.equal('Resume')
        })
      })
    })

    describe('the "alertDate" property', () => {
      describe('when the licence monitoring station record has never had an alert sent', () => {
        it('returns null', () => {
          const result = BasePresenter.restrictions(licenceMonitoringStations)

          expect(result[0].alertDate).to.be.null()
        })
      })

      describe('when the licence monitoring station record has had an alert sent', () => {
        beforeEach(() => {
          licenceMonitoringStations[0].statusUpdatedAt = new Date('2024-06-17')
        })

        it('returns the "statusUpdatedAt" formatted for display', () => {
          const result = BasePresenter.restrictions(licenceMonitoringStations)

          expect(result[0].alertDate).to.equal('17 June 2024')
        })
      })
    })

    describe('the "restriction" property', () => {
      describe("when the licence monitoring station record's restriction type is 'stop_or_reduce'", () => {
        beforeEach(() => {
          licenceMonitoringStations[0].restrictionType = 'stop_or_reduce'
        })

        it('returns "Stop or reduce"', () => {
          const result = BasePresenter.restrictions(licenceMonitoringStations)

          expect(result[0].restriction).to.equal('Stop or reduce')
        })
      })

      describe("when the licence monitoring station record's restriction type is 'reduce'", () => {
        beforeEach(() => {
          licenceMonitoringStations[0].restrictionType = 'reduce'
        })

        it('returns "Reduce"', () => {
          const result = BasePresenter.restrictions(licenceMonitoringStations)

          expect(result[0].restriction).to.equal('Reduce')
        })
      })

      describe("when the licence monitoring station record's restriction type is 'stop'", () => {
        beforeEach(() => {
          licenceMonitoringStations[0].restrictionType = 'stop'
        })

        it('returns "Stop"', () => {
          const result = BasePresenter.restrictions(licenceMonitoringStations)

          expect(result[0].restriction).to.equal('Stop')
        })
      })
    })

    describe('the "restrictionCount" property', () => {
      beforeEach(() => {
        const secondLicenceMonitoringStation = { ...licenceMonitoringStations[0] }

        secondLicenceMonitoringStation.id = '6f498459-8b7e-48f9-bc88-293dce414e8d'
        licenceMonitoringStations.push(secondLicenceMonitoringStation)
      })

      it('returns returns the count of licence monitoring stations for the licence linked to this monitoring station', () => {
        const result = BasePresenter.restrictions(licenceMonitoringStations)

        expect(result[0].restrictionCount).to.equal(2)
      })
    })
  })
})
