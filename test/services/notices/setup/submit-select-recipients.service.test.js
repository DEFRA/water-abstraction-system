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
const SubmitSelectRecipientsService = require('../../../../app/services/notices/setup/submit-select-recipients.service.js')

describe('Notices - Setup - Submit Select Recipients Service', () => {
  let payload
  let recipients
  let referenceCode
  let session
  let sessionData
  let yarStub

  beforeEach(async () => {
    payload = { recipients: ['123'] }

    referenceCode = 'RINV-CPFRQ4'

    sessionData = { referenceCode }

    session = await SessionHelper.add({ data: sessionData })

    recipients = RecipientsFixture.recipients()

    Sinon.stub(FetchRecipientsService, 'go').resolves([recipients.primaryUser])

    yarStub = { flash: Sinon.stub().returns([{ title: 'Test', text: 'Notification' }]) }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('saves the submitted value', async () => {
      await SubmitSelectRecipientsService.go(session.id, payload, yarStub)

      const refreshedSession = await session.$query()

      expect(refreshedSession.selectedRecipients).to.equal(['123'])
    })

    it('sets a flash message', async () => {
      await SubmitSelectRecipientsService.go(session.id, payload, yarStub)

      // Check we add the flash message
      const [flashType, bannerMessage] = yarStub.flash.args[0]

      expect(flashType).to.equal('notification')
      expect(bannerMessage).to.equal({
        text: 'The recipients have been changed. Check details before sending invitations.',
        title: 'Updated',
        titleText: 'Updated'
      })
    })

    it('continues the journey', async () => {
      const result = await SubmitSelectRecipientsService.go(session.id, payload, yarStub)

      expect(result).to.equal({})
    })
  })

  describe('when validation fails', () => {
    describe('because there are no recipients', () => {
      beforeEach(async () => {
        payload = {}
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitSelectRecipientsService.go(session.id, payload, yarStub)

        expect(result).to.equal({
          backLink: {
            href: `/system/notices/setup/${session.id}/check`,
            text: 'Back'
          },
          contactTypeLink: `/system/notices/setup/${session.id}/contact-type`,
          error: {
            errorList: [
              {
                href: '#recipients',
                text: 'Select at least one recipient'
              }
            ],
            recipients: {
              text: 'Select at least one recipient'
            }
          },

          pageTitle: 'Select Recipients',
          pageTitleCaption: `Notice RINV-CPFRQ4`,
          recipients: [
            {
              checked: false,
              contact: [recipients.primaryUser.email],
              contact_hash_id: recipients.primaryUser.contact_hash_id
            }
          ]
        })
      })
    })
  })
})
