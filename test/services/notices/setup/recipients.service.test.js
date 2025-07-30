'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Things we need to stub
const FetchAbstractionAlertRecipientsService = require('../../../../app/services/notices/setup/fetch-abstraction-alert-recipients.service.js')
const FetchRecipientsService = require('../../../../app/services/notices/setup/fetch-recipients.service.js')

// Thing under test
const RecipientsService = require('../../../../app/services/notices/setup/recipients.service.js')

describe('Notices - Setup - Recipients service', () => {
  let recipients
  let session

  beforeEach(async () => {
    session = await SessionHelper.add({
      data: {
        journey: 'standard'
      }
    })

    recipients = RecipientsFixture.recipients()

    Sinon.stub(FetchRecipientsService, 'go').resolves([recipients.primaryUser])
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('correctly presents the data', async () => {
    const result = await RecipientsService.go(session)

    expect(result).to.equal([
      {
        licence_refs: recipients.primaryUser.licence_refs,
        contact: null,
        contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
        contact_type: 'Primary user',
        email: 'primary.user@important.com',
        message_type: 'Email'
      }
    ])
  })

  describe('when the journey is "alerts"', () => {
    beforeEach(async () => {
      session = await SessionHelper.add({
        data: {
          journey: 'alerts'
        }
      })

      recipients = RecipientsFixture.alertsRecipients()

      Sinon.stub(FetchAbstractionAlertRecipientsService, 'go').resolves([recipients.additionalContact])
    })

    it('correctly presents the data', async () => {
      const result = await RecipientsService.go(session)

      expect(result).to.equal([
        {
          contact: null,
          contact_hash_id: '90129f6aa5b98734aa3fefd3f8cf86a',
          contact_type: 'Additional contact',
          email: recipients.additionalContact.email,
          licence_refs: recipients.additionalContact.licence_refs,
          message_type: 'Email'
        }
      ])
    })
  })
})
