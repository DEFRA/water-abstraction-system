'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AbstractionAlertSessionData = require('../../../fixtures/abstraction-alert-session-data.fixture.js')
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')

// Thing under test
const AbstractionAlertsNotificationsPresenter = require('../../../../app/presenters/notices/setup/abstraction-alerts-notifications.presenter.js')

describe('Notices - Setup - Abstraction alert notifications presenter', () => {
  const referenceCode = 'TEST-123'
  const eventId = 'c1cae668-3dad-4806-94e2-eb3f27222ed9'

  let abstractionAlertSessionData
  let clock
  let recipients
  let session
  let testRecipients

  beforeEach(() => {
    recipients = RecipientsFixture.alertsRecipients()

    testRecipients = [...Object.values(recipients)]

    abstractionAlertSessionData = AbstractionAlertSessionData.get()

    const relevantLicenceMonitoringStations = AbstractionAlertSessionData.relevantLicenceMonitoringStations([
      recipients.primaryUser.licence_refs,
      recipients.licenceHolder.licence_refs
    ])

    session = {
      ...abstractionAlertSessionData,
      journey: 'abstraction-alerts',
      referenceCode,
      relevantLicenceMonitoringStations
    }

    clock = Sinon.useFakeTimers(new Date(`2025-01-01`))
  })

  afterEach(() => {
    clock.restore()
  })

  it('correctly transform the recipients (and associated licence monitoring stations) into notifications', () => {
    const result = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

    expect(result).to.equal([
      {
        createdAt: '2025-01-01T00:00:00.000Z',
        eventId: 'c1cae668-3dad-4806-94e2-eb3f27222ed9',
        reference: 'TEST-123',
        templateId: '6ec7265d-8ebb-4217-a62b-9bf0216f8c9f',
        licences: `["${recipients.additionalContact.licence_refs}"]`,
        messageType: 'email',
        messageRef: 'water_abstraction_alert_reduce_warning_email',
        personalisation: {
          condition_text: '',
          flow_or_level: 'level',
          issuer_email_address: '',
          licence_ref: recipients.additionalContact.licence_refs,
          monitoring_station_name: 'Death star',
          source: '* Source of supply: Meridian Trench',
          threshold_unit: 'm',
          threshold_value: 1000
        },
        recipient: 'additional.contact@important.com'
      },
      {
        createdAt: '2025-01-01T00:00:00.000Z',
        eventId: 'c1cae668-3dad-4806-94e2-eb3f27222ed9',
        reference: 'TEST-123',
        templateId: '6ec7265d-8ebb-4217-a62b-9bf0216f8c9f',
        licences: `["${recipients.primaryUser.licence_refs}"]`,
        messageType: 'email',
        messageRef: 'water_abstraction_alert_reduce_warning_email',
        personalisation: {
          condition_text: '',
          flow_or_level: 'level',
          issuer_email_address: '',
          licence_ref: recipients.primaryUser.licence_refs,
          monitoring_station_name: 'Death star',
          source: '* Source of supply: Meridian Trench',
          threshold_unit: 'm',
          threshold_value: 1000
        },

        recipient: 'primary.user@important.com'
      },
      {
        createdAt: '2025-01-01T00:00:00.000Z',
        eventId: 'c1cae668-3dad-4806-94e2-eb3f27222ed9',
        reference: 'TEST-123',
        templateId: '27499bbd-e854-4f13-884e-30e0894526b6',
        licences: `["${recipients.licenceHolder.licence_refs}"]`,
        messageType: 'letter',
        messageRef: 'water_abstraction_alert_reduce_warning',
        personalisation: {
          name: 'Mr H J Licence holder',
          address_line_1: '1',
          address_line_2: 'Privet Drive',
          address_line_3: 'Little Whinging',
          address_line_4: 'Surrey',
          address_line_5: 'WD25 7LR',
          // common personalisation
          condition_text: '',
          flow_or_level: 'flow',
          issuer_email_address: '',
          licence_ref: recipients.licenceHolder.licence_refs,
          monitoring_station_name: 'Death star',
          source: '* Source of supply: Meridian Trench',
          threshold_unit: 'm3/s',
          threshold_value: 100
        }
      }
    ])
  })

  describe('when a licence has more than one licence monitoring stations to send alerts to', () => {
    beforeEach(() => {
      session.relevantLicenceMonitoringStations = AbstractionAlertSessionData.relevantLicenceMonitoringStations([
        recipients.primaryUser.licence_refs,
        recipients.primaryUser.licence_refs
      ])
    })

    it('correctly transform the recipients (and associated licence monitoring stations) into notifications for the same recipient', () => {
      const result = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

      expect(result).to.equal([
        {
          createdAt: '2025-01-01T00:00:00.000Z',
          eventId: 'c1cae668-3dad-4806-94e2-eb3f27222ed9',
          reference: 'TEST-123',
          templateId: '6ec7265d-8ebb-4217-a62b-9bf0216f8c9f',
          licences: `["${recipients.additionalContact.licence_refs}"]`,
          messageType: 'email',
          messageRef: 'water_abstraction_alert_reduce_warning_email',
          personalisation: {
            condition_text: '',
            flow_or_level: 'level',
            issuer_email_address: '',
            licence_ref: recipients.additionalContact.licence_refs,
            monitoring_station_name: 'Death star',
            source: '* Source of supply: Meridian Trench',
            threshold_unit: 'm',
            threshold_value: 1000
          },
          recipient: 'additional.contact@important.com'
        },
        {
          createdAt: '2025-01-01T00:00:00.000Z',
          eventId: 'c1cae668-3dad-4806-94e2-eb3f27222ed9',
          licences: `["${recipients.primaryUser.licence_refs}"]`,
          messageRef: 'water_abstraction_alert_reduce_warning_email',
          messageType: 'email',
          personalisation: {
            condition_text: '',
            flow_or_level: 'level',
            issuer_email_address: '',
            licence_ref: recipients.primaryUser.licence_refs,
            monitoring_station_name: 'Death star',
            source: '* Source of supply: Meridian Trench',
            threshold_unit: 'm',
            threshold_value: 1000
          },
          recipient: 'primary.user@important.com',
          reference: 'TEST-123',
          templateId: '6ec7265d-8ebb-4217-a62b-9bf0216f8c9f'
        },
        {
          createdAt: '2025-01-01T00:00:00.000Z',
          eventId: 'c1cae668-3dad-4806-94e2-eb3f27222ed9',
          reference: 'TEST-123',
          templateId: '6ec7265d-8ebb-4217-a62b-9bf0216f8c9f',
          licences: `["${recipients.additionalContact.licence_refs}"]`,
          messageType: 'email',
          messageRef: 'water_abstraction_alert_reduce_warning_email',
          personalisation: {
            condition_text: '',
            flow_or_level: 'flow',
            issuer_email_address: '',
            licence_ref: recipients.additionalContact.licence_refs,
            monitoring_station_name: 'Death star',
            source: '* Source of supply: Meridian Trench',
            threshold_unit: 'm3/s',
            threshold_value: 100
          },
          recipient: 'additional.contact@important.com'
        },
        {
          createdAt: '2025-01-01T00:00:00.000Z',
          eventId: 'c1cae668-3dad-4806-94e2-eb3f27222ed9',
          licences: `["${recipients.primaryUser.licence_refs}"]`,
          messageRef: 'water_abstraction_alert_reduce_warning_email',
          messageType: 'email',
          personalisation: {
            condition_text: '',
            flow_or_level: 'flow',
            issuer_email_address: '',
            licence_ref: recipients.primaryUser.licence_refs,
            monitoring_station_name: 'Death star',
            source: '* Source of supply: Meridian Trench',
            threshold_unit: 'm3/s',
            threshold_value: 100
          },
          recipient: 'primary.user@important.com',
          reference: 'TEST-123',
          templateId: '6ec7265d-8ebb-4217-a62b-9bf0216f8c9f'
        }
      ])
    })
  })

  describe('when a "primaryUser" has abstraction alerts', () => {
    beforeEach(() => {
      session.relevantLicenceMonitoringStations = AbstractionAlertSessionData.relevantLicenceMonitoringStations([
        recipients.primaryUser.licence_refs
      ])

      testRecipients[0].licence_refs = recipients.licenceHolder.licence_refs
    })

    it('correctly transform the recipients (and associated licence monitoring stations) into notifications', () => {
      const result = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

      expect(result).to.equal([
        {
          createdAt: '2025-01-01T00:00:00.000Z',
          eventId: 'c1cae668-3dad-4806-94e2-eb3f27222ed9',
          reference: 'TEST-123',
          templateId: '6ec7265d-8ebb-4217-a62b-9bf0216f8c9f',
          licences: `["${recipients.primaryUser.licence_refs}"]`,
          messageType: 'email',
          messageRef: 'water_abstraction_alert_reduce_warning_email',
          personalisation: {
            condition_text: '',
            flow_or_level: 'level',
            issuer_email_address: '',
            licence_ref: recipients.primaryUser.licence_refs,
            monitoring_station_name: 'Death star',
            source: '* Source of supply: Meridian Trench',
            threshold_unit: 'm',
            threshold_value: 1000
          },
          recipient: 'primary.user@important.com'
        }
      ])
    })

    describe('when there is an "additional contact"', () => {
      beforeEach(() => {
        testRecipients[0].licence_refs = recipients.primaryUser.licence_refs
      })

      it('correctly transform the recipients (and associated licence monitoring stations) into notifications', () => {
        const result = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

        expect(result).to.equal([
          {
            createdAt: '2025-01-01T00:00:00.000Z',
            eventId: 'c1cae668-3dad-4806-94e2-eb3f27222ed9',
            reference: 'TEST-123',
            templateId: '6ec7265d-8ebb-4217-a62b-9bf0216f8c9f',
            licences: `["${recipients.additionalContact.licence_refs}"]`,
            messageType: 'email',
            messageRef: 'water_abstraction_alert_reduce_warning_email',
            personalisation: {
              condition_text: '',
              flow_or_level: 'level',
              issuer_email_address: '',
              licence_ref: recipients.additionalContact.licence_refs,
              monitoring_station_name: 'Death star',
              source: '* Source of supply: Meridian Trench',
              threshold_unit: 'm',
              threshold_value: 1000
            },

            recipient: 'additional.contact@important.com'
          },
          {
            createdAt: '2025-01-01T00:00:00.000Z',
            eventId: 'c1cae668-3dad-4806-94e2-eb3f27222ed9',
            reference: 'TEST-123',
            templateId: '6ec7265d-8ebb-4217-a62b-9bf0216f8c9f',
            licences: `["${recipients.primaryUser.licence_refs}"]`,
            messageType: 'email',
            messageRef: 'water_abstraction_alert_reduce_warning_email',
            personalisation: {
              condition_text: '',
              flow_or_level: 'level',
              issuer_email_address: '',
              licence_ref: recipients.primaryUser.licence_refs,
              monitoring_station_name: 'Death star',
              source: '* Source of supply: Meridian Trench',
              threshold_unit: 'm',
              threshold_value: 1000
            },

            recipient: 'primary.user@important.com'
          }
        ])
      })
    })
  })

  describe('when a "licenceHolder" has abstraction alerts', () => {
    beforeEach(() => {
      session.relevantLicenceMonitoringStations = AbstractionAlertSessionData.relevantLicenceMonitoringStations([
        recipients.licenceHolder.licence_refs
      ])
    })

    it('correctly transform the recipients (and associated licence monitoring stations) into notifications', () => {
      const result = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

      expect(result).to.equal([
        {
          createdAt: '2025-01-01T00:00:00.000Z',
          eventId: 'c1cae668-3dad-4806-94e2-eb3f27222ed9',
          reference: 'TEST-123',
          templateId: '27499bbd-e854-4f13-884e-30e0894526b6',
          licences: `["${recipients.licenceHolder.licence_refs}"]`,
          messageType: 'letter',
          messageRef: 'water_abstraction_alert_reduce_warning',
          personalisation: {
            name: 'Mr H J Licence holder',
            address_line_1: '1',
            address_line_2: 'Privet Drive',
            address_line_3: 'Little Whinging',
            address_line_4: 'Surrey',
            address_line_5: 'WD25 7LR',
            // common personalisation
            condition_text: '',
            flow_or_level: 'level',
            issuer_email_address: '',
            licence_ref: recipients.licenceHolder.licence_refs,
            monitoring_station_name: 'Death star',
            source: '* Source of supply: Meridian Trench',
            threshold_unit: 'm',
            threshold_value: 1000
          }
        }
      ])
    })

    describe('when there is an "additional contact"', () => {
      beforeEach(() => {
        testRecipients[0].licence_refs = recipients.licenceHolder.licence_refs
      })

      it('correctly transform the recipients (and associated licence monitoring stations) into notifications', () => {
        const result = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

        expect(result).to.equal([
          {
            createdAt: '2025-01-01T00:00:00.000Z',
            eventId: 'c1cae668-3dad-4806-94e2-eb3f27222ed9',
            reference: 'TEST-123',
            templateId: '6ec7265d-8ebb-4217-a62b-9bf0216f8c9f',
            licences: `["${recipients.additionalContact.licence_refs}"]`,
            messageType: 'email',
            messageRef: 'water_abstraction_alert_reduce_warning_email',
            personalisation: {
              condition_text: '',
              flow_or_level: 'level',
              issuer_email_address: '',
              licence_ref: recipients.additionalContact.licence_refs,
              monitoring_station_name: 'Death star',
              source: '* Source of supply: Meridian Trench',
              threshold_unit: 'm',
              threshold_value: 1000
            },
            recipient: 'additional.contact@important.com'
          },
          {
            createdAt: '2025-01-01T00:00:00.000Z',
            eventId: 'c1cae668-3dad-4806-94e2-eb3f27222ed9',
            reference: 'TEST-123',
            templateId: '27499bbd-e854-4f13-884e-30e0894526b6',
            licences: `["${recipients.licenceHolder.licence_refs}"]`,
            messageType: 'letter',
            messageRef: 'water_abstraction_alert_reduce_warning',
            personalisation: {
              name: 'Mr H J Licence holder',
              address_line_1: '1',
              address_line_2: 'Privet Drive',
              address_line_3: 'Little Whinging',
              address_line_4: 'Surrey',
              address_line_5: 'WD25 7LR',
              // common personalisation
              condition_text: '',
              flow_or_level: 'level',
              issuer_email_address: '',
              licence_ref: recipients.licenceHolder.licence_refs,
              monitoring_station_name: 'Death star',
              source: '* Source of supply: Meridian Trench',
              threshold_unit: 'm',
              threshold_value: 1000
            }
          }
        ])
      })
    })
  })

  describe('the "personalisation" object', () => {
    beforeEach(() => {
      session.relevantLicenceMonitoringStations = AbstractionAlertSessionData.relevantLicenceMonitoringStations([
        recipients.primaryUser.licence_refs
      ])

      testRecipients[0].licence_refs = recipients.licenceHolder.licence_refs
    })

    it('correctly sets the "personalisation" object', () => {
      const [result] = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

      expect(result.personalisation).to.equal({
        condition_text: '',
        flow_or_level: 'level',
        issuer_email_address: '',
        licence_ref: recipients.primaryUser.licence_refs,
        monitoring_station_name: 'Death star',
        source: '* Source of supply: Meridian Trench',
        threshold_unit: 'm',
        threshold_value: 1000
      })
    })

    describe('when the "source"', () => {
      describe('has a value', () => {
        it('correctly sets "source"', () => {
          const [result] = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

          expect(result.personalisation.source).to.equal('* Source of supply: Meridian Trench')
        })
      })

      describe('is an empty string ""', () => {
        beforeEach(() => {
          session.monitoringStationRiverName = ''
        })

        it('correctly sets defaults the "source"', () => {
          const [result] = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

          expect(result.personalisation.source).to.equal('')
        })
      })

      describe('is null', () => {
        beforeEach(() => {
          session.monitoringStationRiverName = null
        })

        it('correctly sets defaults the "source"', () => {
          const [result] = AbstractionAlertsNotificationsPresenter.go(testRecipients, session, eventId)

          expect(result.personalisation.source).to.equal('')
        })
      })
    })
  })
})
