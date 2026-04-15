'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../support/fixtures/recipients.fixture.js')
const SessionModelStub = require('../../../support/stubs/session.stub.js')
const { generateNoticeReferenceCode } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const FetchRecipientsService = require('../../../../app/services/notices/setup/fetch-recipients.service.js')
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitSelectRecipientsService = require('../../../../app/services/notices/setup/submit-select-recipients.service.js')

describe('Notices - Setup - Submit Select Recipients service', () => {
  let payload
  let recipients
  let referenceCode
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    payload = { recipients: ['123'] }

    referenceCode = generateNoticeReferenceCode('RINV-')

    sessionData = { referenceCode }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)

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

      expect(session.selectedRecipients).to.equal(['123'])
      expect(session.$update.called).to.be.true()
    })

    it('sets a flash message', async () => {
      await SubmitSelectRecipientsService.go(session.id, payload, yarStub)

      // Check we add the flash message
      const [flashType, bannerMessage] = yarStub.flash.args[0]

      expect(flashType).to.equal('notification')
      expect(bannerMessage).to.equal({
        text: 'The recipients have been changed. Check details before sending invitations.',
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
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitSelectRecipientsService.go(session.id, payload, yarStub)

        expect(result).to.equal({
          backLink: {
            href: `/system/notices/setup/${session.id}/check`,
            text: 'Back'
          },
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
          pageTitleCaption: `Notice ${referenceCode}`,
          recipients: [
            {
              checked: false,
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
})
