'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitCheckService = require('../../../../app/services/notifications/setup/submit-check.service.js')

describe('Notifications Setup - Submit Check service', () => {
  let clock
  let recipients
  let session

  before(async () => {
    recipients = RecipientsFixture.recipients()

    session = await SessionHelper.add({
      data: {
        journey: 'invitations',
        recipients: [recipients.primaryUser, recipients.licenceHolder],
        referenceCode: 'RINV-123',
        removeLicences: '',
        returnsPeriod: 'quarterFour'
      }
    })

    clock = Sinon.useFakeTimers(new Date(`2025-01-01`))
  })

  afterEach(() => {
    clock.restore()
  })

  it('correctly presents the data', async () => {
    const result = await SubmitCheckService.go(session.id)

    expect(result).to.equal([recipients.primaryUser, recipients.licenceHolder])
  })
})
