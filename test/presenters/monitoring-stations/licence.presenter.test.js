'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const LicencePresenter = require('../../../app/presenters/monitoring-stations/licence.presenter.js')

describe('Monitoring Stations - Licence presenter', () => {
  let lastAlert
  let monitoringStationLicenceTags

  beforeEach(() => {
    lastAlert = undefined
    monitoringStationLicenceTags = _monitoringStationLicenceTags()
  })

  describe('when provided with the result of the fetch licence tag details service', () => {
    it('correctly presents the data', () => {
      const result = LicencePresenter.go(lastAlert, monitoringStationLicenceTags)

      expect(result).to.equal({
        backLink: '/system/monitoring-stations/863c375f-4f8d-4633-af0e-a2298f6f174e',
        lastAlertSent: 'N/A',
        licenceTags: [
          {
            created: 'Created on 23 April 2025 by environment.officer@wrls.gov.uk',
            effectOfRestriction: null,
            licenceMonitoringStationId: '27a7dc96-fad9-4b38-9117-c09623e99a9f',
            licenceVersionStatus: null,
            linkedCondition: 'Not linked to a condition',
            tag: 'Reduce tag',
            threshold: '175Ml/d',
            type: 'Reduce'
          }
        ],
        monitoringStationName: 'The Station',
        pageTitle: 'Details for 99/999'
      })
    })
  })

  describe('the "lastAlertSent" property', () => {
    describe('when a water abstraction alert has NOT been sent for the licence', () => {
      beforeEach(() => {
        lastAlert = null
      })

      it('returns the string "N/A"', () => {
        const result = LicencePresenter.go(lastAlert, monitoringStationLicenceTags)

        expect(result.lastAlertSent).to.equal('N/A')
      })
    })

    describe('when a water abstraction alert has been sent for the licence', () => {
      describe('and the alert was sent by "letter"', () => {
        beforeEach(() => {
          lastAlert = {
            id: '14372235-7726-47d3-b736-e1e2a3aeef9e',
            alertType: 'reduce',
            contact: 'Big Farm Co Ltd',
            createdAt: new Date('2024-08-13'),
            messageRef: 'water_abstraction_alert_stop_warning',
            messageType: 'letter',
            recipient: null,
            sendingAlertType: 'warning',
            status: 'sent'
          }
        })

        it('returns details of the alert sent to the "contact"', () => {
          const result = LicencePresenter.go(lastAlert, monitoringStationLicenceTags)

          expect(result.lastAlertSent).to.equal('Warning letter on 13 August 2024 sent to Big Farm Co Ltd')
        })
      })

      describe('and the alert was sent by "email"', () => {
        beforeEach(() => {
          lastAlert = {
            id: '14372235-7726-47d3-b736-e1e2a3aeef9e',
            alertType: 'reduce',
            contact: 'Big Farm Co Ltd',
            createdAt: new Date('2024-08-13'),
            messageRef: 'water_abstraction_alert_stop_warning',
            messageType: 'email',
            recipient: 'environment.officer@wrls.gov.uk',
            sendingAlertType: 'warning',
            status: 'sent'
          }
        })

        it('returns details of the alert sent to the "recipient"', () => {
          const result = LicencePresenter.go(lastAlert, monitoringStationLicenceTags)

          expect(result.lastAlertSent).to.equal(
            'Warning email on 13 August 2024 sent to environment.officer@wrls.gov.uk'
          )
        })
      })
    })
  })

  describe('the "licenceTags" property', () => {
    describe('when the licence monitoring station record is NOT linked to a condition', () => {
      beforeEach(() => {
        monitoringStationLicenceTags.licenceMonitoringStations[0].licenceVersionPurposeCondition = undefined
      })

      it('correctly formats the licence monitoring station record', () => {
        const result = LicencePresenter.go(lastAlert, monitoringStationLicenceTags)

        expect(result.licenceTags).to.equal([
          {
            created: 'Created on 23 April 2025 by environment.officer@wrls.gov.uk',
            effectOfRestriction: null,
            licenceMonitoringStationId: '27a7dc96-fad9-4b38-9117-c09623e99a9f',
            licenceVersionStatus: null,
            linkedCondition: 'Not linked to a condition',
            tag: 'Reduce tag',
            threshold: '175Ml/d',
            type: 'Reduce'
          }
        ])
      })
    })

    describe('when the licence monitoring station record is linked to a condition', () => {
      beforeEach(() => {
        monitoringStationLicenceTags.licenceMonitoringStations[0].licenceVersionPurposeCondition = {
          externalId: '12345:1:98765',
          notes: 'licenceVersionPurposeCondition notes',
          licenceVersionPurposeConditionType: {
            displayTitle: 'Flow cessation condition'
          },
          licenceVersionPurpose: {
            licenceVersion: {
              status: 'current'
            }
          }
        }
      })

      it('correctly formats the licence monitoring station record', () => {
        const result = LicencePresenter.go(lastAlert, monitoringStationLicenceTags)

        expect(result.licenceTags).to.equal([
          {
            created: 'Created on 23 April 2025 by environment.officer@wrls.gov.uk',
            effectOfRestriction: 'licenceVersionPurposeCondition notes',
            licenceMonitoringStationId: '27a7dc96-fad9-4b38-9117-c09623e99a9f',
            licenceVersionStatus: 'current',
            linkedCondition: 'Flow cessation condition, NALD ID 98765',
            tag: 'Reduce tag',
            threshold: '175Ml/d',
            type: 'Reduce'
          }
        ])
      })
    })

    describe('when the licence monitoring station record is NOT linked to a user', () => {
      beforeEach(() => {
        monitoringStationLicenceTags.licenceMonitoringStations[0].user = null
      })

      it('correctly formats the licence monitoring station created string', () => {
        const result = LicencePresenter.go(lastAlert, monitoringStationLicenceTags)

        expect(result.licenceTags[0].created).to.equal('Created on 23 April 2025')
      })
    })

    describe('when the licence monitoring station record is linked to a user', () => {
      beforeEach(() => {
        monitoringStationLicenceTags.licenceMonitoringStations[0].user = { username: 'a.user@wrls.gov.uk' }
      })

      it('correctly formats the licence monitoring station created string', () => {
        const result = LicencePresenter.go(lastAlert, monitoringStationLicenceTags)

        expect(result.licenceTags[0].created).to.equal('Created on 23 April 2025 by a.user@wrls.gov.uk')
      })
    })
  })

  describe('the "monitoringStationName" property', () => {
    describe('when the monitoring stations "riverName" property is blank', () => {
      beforeEach(() => {
        monitoringStationLicenceTags.label = 'The Station'
        monitoringStationLicenceTags.riverName = ''
      })

      it('returns the correct "monitoringStationName"', () => {
        const result = LicencePresenter.go(lastAlert, monitoringStationLicenceTags)

        expect(result.monitoringStationName).to.equal('The Station')
      })
    })

    describe('when the monitoring stations "riverName" property is populated', () => {
      beforeEach(() => {
        monitoringStationLicenceTags.label = 'The Station'
        monitoringStationLicenceTags.riverName = 'River Piddle'
      })

      it('returns the correct "monitoringStationName"', () => {
        const result = LicencePresenter.go(lastAlert, monitoringStationLicenceTags)

        expect(result.monitoringStationName).to.equal('River Piddle at The Station')
      })
    })
  })
})

function _monitoringStationLicenceTags() {
  return {
    id: '863c375f-4f8d-4633-af0e-a2298f6f174e',
    label: 'The Station',
    riverName: '',
    licenceMonitoringStations: [
      {
        id: '27a7dc96-fad9-4b38-9117-c09623e99a9f',
        createdAt: new Date('2025-04-23'),
        licenceId: '33615d39-cc4e-4747-9c27-2dfa49fe73bf',
        restrictionType: 'reduce',
        thresholdUnit: 'Ml/d',
        thresholdValue: 175,
        licence: {
          licenceRef: '99/999'
        },
        user: {
          username: 'environment.officer@wrls.gov.uk'
        },
        licenceVersionPurposeCondition: undefined
      }
    ]
  }
}
