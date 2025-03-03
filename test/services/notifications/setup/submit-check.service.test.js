'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')
const RecipientsService = require('../../../../app/services/notifications/setup/fetch-recipients.service.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitCheckService = require('../../../../app/services/notifications/setup/submit-check.service.js')

describe('Notifications Setup - Submit Check service', () => {
  let recipients
  let session

  before(async () => {
    recipients = RecipientsFixture.recipients()

    session = await SessionHelper.add({
      data: {
        journey: 'invitations',
        referenceCode: 'RINV-123',
        returnsPeriod: 'quarterFour'
      }
    })

    recipients = RecipientsFixture.recipients()

    Sinon.stub(RecipientsService, 'go').resolves([recipients.primaryUser])
  })

  it('correctly presents the data', async () => {
    const result = await SubmitCheckService.go(session.id)

    expect(result).to.equal([
      {
        contact: null,
        contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
        contact_type: 'Primary user',
        email: 'primary.user@important.com',
        licence_refs: recipients.primaryUser.licence_refs,
        message_type: 'Email'
      }
    ])
  })
})
