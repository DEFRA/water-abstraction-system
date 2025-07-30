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
const RecipientsService = require('../../../../app/services/notices/setup/recipients.service.js')

// Thing under test
const SelectRecipientsService = require('../../../../app/services/notices/setup/select-recipients.service.js')

describe('Select Recipients Service', () => {
  let session
  let sessionData
  let recipients

  beforeEach(async () => {
    sessionData = {}

    session = await SessionHelper.add({ data: sessionData })

    recipients = RecipientsFixture.recipients()

    Sinon.stub(RecipientsService, 'go').resolves([recipients.primaryUser])
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await SelectRecipientsService.go(session.id)

      expect(result).to.equal({
        backLink: `/system/notices/setup/${session.id}/check`,
        pageTitle: 'Select Recipients',
        recipients: [
          {
            checked: true,
            contact: [recipients.primaryUser.email],
            contact_hash_id: recipients.primaryUser.contact_hash_id
          }
        ]
      })
    })
  })
})
