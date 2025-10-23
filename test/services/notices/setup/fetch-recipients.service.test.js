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
const FetchLetterRecipientsService = require('../../../../app/services/notices/setup/fetch-letter-recipients.service.js')
const FetchReturnsRecipientsService = require('../../../../app/services/notices/setup/fetch-returns-recipients.service.js')

// Thing under test
const FetchRecipientsService = require('../../../../app/services/notices/setup/fetch-recipients.service.js')

describe('Notices - Setup - Fetch recipients service', () => {
  let recipients
  let session

  afterEach(() => {
    Sinon.restore()
  })

  describe('when getting the recipients', () => {
    describe('and all recipients are required', () => {
      beforeEach(async () => {
        recipients = RecipientsFixture.recipients()

        session = await SessionHelper.add({
          data: {
            journey: 'standard'
          }
        })

        Sinon.stub(FetchReturnsRecipientsService, 'go').resolves([recipients.primaryUser, recipients.returnsAgent])
      })

      it('returns all the recipients formatted for display', async () => {
        const result = await FetchRecipientsService.go(session)

        expect(result).to.equal([
          {
            contact: null,
            contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
            contact_type: 'Primary user',
            email: 'primary.user@important.com',
            licence_refs: recipients.primaryUser.licence_refs,
            message_type: 'Email',
            return_log_ids: recipients.primaryUser.return_log_ids
          },
          {
            contact: null,
            contact_hash_id: '2e6918568dfbc1d78e2fbe279aaee990',
            contact_type: 'Returns agent',
            email: 'returns.agent@important.com',
            licence_refs: recipients.returnsAgent.licence_refs,
            message_type: 'Email',
            return_log_ids: recipients.returnsAgent.return_log_ids
          }
        ])
      })
    })

    describe('and all recipients are not required', () => {
      describe('when there are selected recipients', () => {
        beforeEach(async () => {
          recipients = RecipientsFixture.recipients()

          session = await SessionHelper.add({
            data: {
              journey: 'standard',
              selectedRecipients: [recipients.licenceHolder.contact_hash_id]
            }
          })

          Sinon.stub(FetchReturnsRecipientsService, 'go').resolves([recipients.primaryUser, recipients.licenceHolder])
        })

        it('returns only the selected recipients formatted for display', async () => {
          const result = await FetchRecipientsService.go(session)

          expect(result).to.equal([
            {
              contact: {
                addressLine1: '1',
                addressLine2: 'Privet Drive',
                addressLine3: null,
                addressLine4: null,
                country: null,
                county: 'Surrey',
                forename: 'Harry',
                initials: 'H J',
                name: 'Licence holder',
                postcode: 'WD25 7LR',
                role: 'Licence holder',
                salutation: 'Mr',
                town: 'Little Whinging',
                type: 'Person'
              },
              contact_hash_id: '22f6457b6be9fd63d8a9a8dd2ed61214',
              contact_type: 'Licence holder',
              email: null,
              licence_refs: recipients.licenceHolder.licence_refs,
              message_type: 'Letter',
              return_log_ids: recipients.licenceHolder.return_log_ids
            }
          ])
        })
      })

      describe('when there are no selected recipients', () => {
        beforeEach(async () => {
          recipients = RecipientsFixture.recipients()

          session = await SessionHelper.add({
            data: {
              journey: 'standard'
            }
          })

          Sinon.stub(FetchReturnsRecipientsService, 'go').resolves([recipients.primaryUser, recipients.returnsAgent])
        })

        it('returns all the recipients formatted for display', async () => {
          const result = await FetchRecipientsService.go(session)

          expect(result).to.equal([
            {
              contact: null,
              contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
              contact_type: 'Primary user',
              email: 'primary.user@important.com',
              licence_refs: recipients.primaryUser.licence_refs,
              message_type: 'Email',
              return_log_ids: recipients.primaryUser.return_log_ids
            },
            {
              contact: null,
              contact_hash_id: '2e6918568dfbc1d78e2fbe279aaee990',
              contact_type: 'Returns agent',
              email: 'returns.agent@important.com',
              licence_refs: recipients.returnsAgent.licence_refs,
              message_type: 'Email',
              return_log_ids: recipients.returnsAgent.return_log_ids
            }
          ])
        })
      })
    })

    describe('and there are "additionalRecipients"', () => {
      beforeEach(async () => {
        recipients = RecipientsFixture.recipients()

        session = await SessionHelper.add({
          data: {
            journey: 'standard',
            additionalRecipients: [recipients.licenceHolder]
          }
        })

        Sinon.stub(FetchReturnsRecipientsService, 'go').resolves([recipients.primaryUser, recipients.returnsAgent])
      })

      it('returns all the recipients (including "additionalRecipients") formatted for display', async () => {
        const result = await FetchRecipientsService.go(session)

        expect(result).to.equal([
          {
            contact: null,
            contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
            contact_type: 'Primary user',
            email: 'primary.user@important.com',
            licence_refs: recipients.primaryUser.licence_refs,
            message_type: 'Email',
            return_log_ids: recipients.primaryUser.return_log_ids
          },
          {
            contact: null,
            contact_hash_id: '2e6918568dfbc1d78e2fbe279aaee990',
            contact_type: 'Returns agent',
            email: 'returns.agent@important.com',
            licence_refs: recipients.returnsAgent.licence_refs,
            message_type: 'Email',
            return_log_ids: recipients.returnsAgent.return_log_ids
          },
          {
            contact: {
              addressLine1: '1',
              addressLine2: 'Privet Drive',
              addressLine3: null,
              addressLine4: null,
              country: null,
              county: 'Surrey',
              forename: 'Harry',
              initials: 'H J',
              name: 'Licence holder',
              postcode: 'WD25 7LR',
              role: 'Licence holder',
              salutation: 'Mr',
              town: 'Little Whinging',
              type: 'Person'
            },
            contact_hash_id: '22f6457b6be9fd63d8a9a8dd2ed61214',
            contact_type: 'Licence holder',
            email: null,
            licence_refs: recipients.licenceHolder.licence_refs,
            message_type: 'Letter',
            return_log_ids: recipients.licenceHolder.return_log_ids
          }
        ])
      })
    })
  })

  describe('when the notice types is "abstractionAlerts"', () => {
    beforeEach(async () => {
      session = await SessionHelper.add({
        data: {
          noticeType: 'abstractionAlerts'
        }
      })

      recipients = RecipientsFixture.alertsRecipients()

      Sinon.stub(FetchAbstractionAlertRecipientsService, 'go').resolves([recipients.additionalContact])
    })

    it('correctly presents the data', async () => {
      const result = await FetchRecipientsService.go(session)

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

  describe('and the "noticeType" is "paperReturn"', () => {
    beforeEach(async () => {
      recipients = RecipientsFixture.recipients()

      session = await SessionHelper.add({
        data: {
          noticeType: 'paperReturn'
        }
      })

      Sinon.stub(FetchLetterRecipientsService, 'go').resolves([recipients.licenceHolder])
    })

    it('returns only letter recipients', async () => {
      const result = await FetchRecipientsService.go(session)

      expect(result).to.equal([
        {
          contact: {
            addressLine1: '1',
            addressLine2: 'Privet Drive',
            addressLine3: null,
            addressLine4: null,
            country: null,
            county: 'Surrey',
            forename: 'Harry',
            initials: 'H J',
            name: 'Licence holder',
            postcode: 'WD25 7LR',
            role: 'Licence holder',
            salutation: 'Mr',
            town: 'Little Whinging',
            type: 'Person'
          },
          contact_hash_id: '22f6457b6be9fd63d8a9a8dd2ed61214',
          contact_type: 'Licence holder',
          email: null,
          licence_refs: recipients.licenceHolder.licence_refs,
          message_type: 'Letter',
          return_log_ids: recipients.licenceHolder.return_log_ids
        }
      ])
    })
  })
})
