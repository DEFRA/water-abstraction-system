'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')

// Thing under test
const AbstractionAlertsNotificationsPresenter = require('../../../../app/presenters/notices/setup/abstraction-alerts-notifications.presenter.js')

describe.only('Notices - Setup - Abstraction alert notifications presenter', () => {
  const referenceCode = 'TEST-123'
  const eventId = 'c1cae668-3dad-4806-94e2-eb3f27222ed9'

  let clock
  let session
  let recipients
  let testRecipients

  beforeEach(() => {
    recipients = RecipientsFixture.alertsRecipients()

    testRecipients = [...Object.values(recipients)]

    session = {
      journey: 'abstraction-alerts',
      referenceCode
    }

    clock = Sinon.useFakeTimers(new Date(`2025-01-01`))
  })

  afterEach(() => {
    clock.restore()
  })

  it('correctly transform the recipients into notifications', () => {
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
        personalisation: {},
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
          address_line_5: 'WD25 7LR'
        }
      },
      {
        createdAt: '2025-01-01T00:00:00.000Z',
        eventId: 'c1cae668-3dad-4806-94e2-eb3f27222ed9',
        reference: 'TEST-123',
        templateId: '6ec7265d-8ebb-4217-a62b-9bf0216f8c9f',
        licences: `["${recipients.primaryUser.licence_refs}"]`,
        messageType: 'email',
        messageRef: 'water_abstraction_alert_reduce_warning_email',
        personalisation: {},
        recipient: 'primary.user@important.com'
      }
    ])
  })
})
