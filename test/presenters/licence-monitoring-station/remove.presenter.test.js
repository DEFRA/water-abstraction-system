'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const RemovePresenter = require('../../../app/presenters/licence-monitoring-station/remove.presenter.js')

const licenceId = '59efea40-6b01-48a8-a8ff-87a040535633'
const monitoringStationId = 'e887e448-b684-47cc-b642-70de2ad39ab7'

describe('Licence Monitoring Station - Remove presenter', () => {
  let licenceMonitoringStation

  beforeEach(() => {
    licenceMonitoringStation = _licenceMonitoringStation()
  })

  describe('when provided with the result of the fetch licence monitoring station service', () => {
    it('correctly presents the data', () => {
      const result = RemovePresenter.go(licenceMonitoringStation)

      expect(result).to.equal({
        backLink: `/system/monitoring-stations/${monitoringStationId}/licence/${licenceId}`,
        licenceConditionTitle: 'Hands off flow threshold',
        licenceRef: '99/999',
        linkedCondition: 'Aggregate condition link between licences, NALD ID 98765',
        monitoringStationId,
        pageTitle: 'You’re about to remove the tag for this licence',
        station: 'Test monitoring station',
        threshold: '175Ml/d',
        type: 'Reduce',
        Watercourse: 'Test catchment name'
      })
    })
  })

  describe('the "linkedCondition" property', () => {
    describe('when the monitoring station tag is NOT linked to a condition', () => {
      beforeEach(() => {
        licenceMonitoringStation.licenceVersionPurposeCondition = null
      })

      it('returns the string "Not linked to a condition"', () => {
        const result = RemovePresenter.go(licenceMonitoringStation)

        expect(result.linkedCondition).to.equal('Not linked to a condition')
      })
    })

    describe('when the monitoring station tag is linked to a condition', () => {
      beforeEach(() => {
        licenceMonitoringStation.licenceVersionPurposeCondition = {
          externalId: '12345:1:98765',
          licenceVersionPurposeConditionType: {
            displayTitle: 'The condition title'
          }
        }
      })

      it('returns the condition title and NALD ID, which is the last set of digits of the "externalId"', () => {
        const result = RemovePresenter.go(licenceMonitoringStation)

        expect(result.linkedCondition).to.equal('The condition title, NALD ID 98765')
      })
    })
  })

  describe('the "station" property', () => {
    describe('when the monitoring stations "riverName" property is blank', () => {
      beforeEach(() => {
        licenceMonitoringStation.monitoringStation.label = 'The Station'
        licenceMonitoringStation.monitoringStation.riverName = ''
      })

      it('returns the correct "station" name', () => {
        const result = RemovePresenter.go(licenceMonitoringStation)

        expect(result.station).to.equal('The Station')
      })
    })

    describe('when the monitoring stations "riverName" property is populated', () => {
      beforeEach(() => {
        licenceMonitoringStation.monitoringStation.label = 'The Station'
        licenceMonitoringStation.monitoringStation.riverName = 'River Piddle'
      })

      it('returns the correct "station" name', () => {
        const result = RemovePresenter.go(licenceMonitoringStation)

        expect(result.station).to.equal('River Piddle at The Station')
      })
    })
  })
})

function _licenceMonitoringStation() {
  return {
    id: '27a7dc96-fad9-4b38-9117-c09623e99a9f',
    measureType: 'flow',
    restrictionType: 'reduce',
    thresholdUnit: 'Ml/d',
    thresholdValue: 175,
    licence: {
      id: licenceId,
      licenceRef: '99/999'
    },
    licenceVersionPurposeCondition: {
      externalId: '12345:1:98765',
      licenceVersionPurposeConditionType: {
        displayTitle: 'Aggregate condition link between licences'
      }
    },
    monitoringStation: {
      id: monitoringStationId,
      catchmentName: 'Test catchment name',
      label: 'Test monitoring station',
      riverName: ''
    }
  }
}
