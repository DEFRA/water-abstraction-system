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
        latestNotification: null,
        licence: {
          id: '3cd1481c-e96a-45fc-8f2b-1849564b95a5',
          licenceRef: 'AT/TEST'
        },
        licenceVersionPurposeCondition: null,
        measureType: 'flow',
        restrictionType: 'reduce',
        thresholdUnit: 'm3/s',
        thresholdValue: 100
      }
    ]
  })

  describe('#restrictionHeading', () => {
    describe('when the monitoring station has only "flow" based licence monitoring station records', () => {
      it('returns "Flow restriction type and threshold"', () => {
        const result = BasePresenter.determineRestrictionHeading(licenceMonitoringStations)

        expect(result).to.equal('Flow restriction type and threshold')
      })
    })

    describe('when the monitoring station has only "level" based licence monitoring station records', () => {
      beforeEach(() => {
        licenceMonitoringStations[0].measureType = 'level'
      })

      it('returns "Flow restriction type and threshold"', () => {
        const result = BasePresenter.determineRestrictionHeading(licenceMonitoringStations)

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
        const result = BasePresenter.determineRestrictionHeading(licenceMonitoringStations)

        expect(result).to.equal('Flow and level restriction type and threshold')
      })
    })
  })

  describe('#formatRestrictions', () => {
    it('returns each licence monitoring station formatted as a restriction for display', () => {
      const results = BasePresenter.formatRestrictions(licenceMonitoringStations)

      expect(results).to.equal([
        {
          abstractionPeriod: '1 April to 31 August',
          action: null,
          alert: null,
          alertDate: '',
          licenceId: licenceMonitoringStations[0].licence.id,
          licenceRef: licenceMonitoringStations[0].licence.licenceRef,
          restriction: 'Reduce',
          restrictionCount: 1,
          threshold: '100m3/s'
        }
      ])
    })

    describe('when a licence monitoring station has an action', () => {
      beforeEach(() => {
        licenceMonitoringStations[0].action = {
          link: `/system/licence-monitoring-station/${licenceMonitoringStations[0].id}`,
          text: 'View'
        }
      })

      it('sets the action in the result', () => {
        const results = BasePresenter.formatRestrictions(licenceMonitoringStations)

        expect(results[0].action).to.equal(licenceMonitoringStations[0].action)
      })
    })

    describe('when a licence monitoring station has a latest Notification', () => {
      beforeEach(() => {
        licenceMonitoringStations[0].latestNotification = {
          createdAt: null,
          id: 'b027843b-5139-4905-848f-f10bdc37012d',
          sendingAlertType: 'warning'
        }
      })

      describe('which is properly formed (created_at is present)', () => {
        beforeEach(() => {
          licenceMonitoringStations[0].latestNotification.createdAt = new Date('2025-09-10')
        })

        it('sets the alert details in the result', () => {
          const results = BasePresenter.formatRestrictions(licenceMonitoringStations)

          expect(results[0].alert).to.equal('Warning')
          expect(results[0].alertDate).to.equal('10 September 2025')
        })
      })

      describe('which is not properly formed (created_at is not present - an edge case from a legacy notification)', () => {
        it('sets only the alert in the result', () => {
          const results = BasePresenter.formatRestrictions(licenceMonitoringStations)

          expect(results[0].alert).to.equal('Warning')
          expect(results[0].alertDate).to.equal('')
        })
      })
    })

    describe('when there are multiple licence monitoring stations linked to the same licence', () => {
      beforeEach(() => {
        // Leave the second licence monitoring station linked to the same licence as the first
        const secondLicenceMonitoringStation = {
          ...licenceMonitoringStations[0],
          id: '6f498459-8b7e-48f9-bc88-293dce414e8d'
        }

        // Set the third licence monitoring station linked to a different licence
        const thirdLicenceMonitoringStation = {
          ...licenceMonitoringStations[0],
          id: '48f98f60-f4da-40a7-b02d-8df8b713e04b',
          licence: {
            id: 'a6faa6df-eac9-4013-a783-3d6fa102bdc1',
            licenceRef: 'AT/TEST/03'
          }
        }

        licenceMonitoringStations.push(secondLicenceMonitoringStation)
        licenceMonitoringStations.push(thirdLicenceMonitoringStation)
      })

      it('returns the count of licence monitoring stations (LMS) for the licence the LMS is linked to', () => {
        const result = BasePresenter.formatRestrictions(licenceMonitoringStations)

        expect(result[0].restrictionCount).to.equal(2)
        expect(result[1].restrictionCount).to.equal(2)
        expect(result[2].restrictionCount).to.equal(1)
      })
    })
  })

  describe('#formatRestrictionType', () => {
    describe('when the "RestrictionType" is "stop_or_reduce"', () => {
      it('returns the restriction type in sentence case', () => {
        const result = BasePresenter.formatRestrictionType('stop_or_reduce')

        expect(result).to.equal('Stop or reduce')
      })
    })

    describe('when the "RestrictionType" is not "stop_or_reduce"', () => {
      it('returns the restriction type in sentence case', () => {
        const result = BasePresenter.formatRestrictionType('stop')

        expect(result).to.equal('Stop')
      })
    })
  })
})
