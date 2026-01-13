'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../support/fixtures/recipients.fixtures.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')
const { generateNoticeReferenceCode } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const FetchRecipientsService = require('../../../../app/services/notices/setup/fetch-recipients.service.js')

// Thing under test
const ViewSelectRecipientsService = require('../../../../app/services/notices/setup/view-select-recipients.service.js')

describe('Notices - Setup - View Select Recipients service', () => {
  let session
  let sessionData
  let recipients
  let referenceCode

  beforeEach(async () => {
    recipients = RecipientsFixture.recipients()

    referenceCode = generateNoticeReferenceCode('RINV-')

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
      const result = await ViewSelectRecipientsService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'notices',
        backLink: {
          href: `/system/notices/setup/${session.id}/check`,
          text: 'Back'
        },
        pageTitle: 'Select Recipients',
        pageTitleCaption: `Notice ${referenceCode}`,
        recipients: [
          {
            checked: true,
            contact: [recipients.primaryUser.email],
            contact_hash_id: recipients.primaryUser.contact_hash_id
          }
        ],
        setupAddress: {
          href: `/system/notices/setup/${session.id}/contact-type`,
          text: 'Set up a single use address or email address'
        }
      })
    })
  })
})
