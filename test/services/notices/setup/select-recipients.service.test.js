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
const FetchRecipientsService = require('../../../../app/services/notices/setup/fetch-recipients.service.js')

// Thing under test
const SelectRecipientsService = require('../../../../app/services/notices/setup/select-recipients.service.js')

describe('Notices - Setup - Select Recipients Service', () => {
  let session
  let sessionData
  let recipients
  let referenceCode

  beforeEach(async () => {
    recipients = RecipientsFixture.recipients()

    referenceCode = 'RINV-CPFRQ4'

    sessionData = {
      referenceCode,
      selectedRecipients: [recipients.primaryUser.contact_hash_id]
    }

    session = await SessionHelper.add({ data: sessionData })

    Sinon.stub(FetchRecipientsService, 'go').resolves([recipients.primaryUser])
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await SelectRecipientsService.go(session.id)

      expect(result).to.equal({
        backLink: {
          href: `/system/notices/setup/${session.id}/check`,
          text: 'Back'
        },
        contactTypeLink: `/system/notices/setup/${session.id}/contact-type`,
        pageTitle: 'Select Recipients',
        pageTitleCaption: `Notice RINV-CPFRQ4`,
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
