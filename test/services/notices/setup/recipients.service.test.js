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

  describe('when getting the recipients', () => {
    describe('and all recipients are required', () => {
      beforeEach(async () => {
        session = await SessionHelper.add({
          data: {
            journey: 'standard'
          }
        })

        recipients = RecipientsFixture.recipients()

        Sinon.stub(FetchRecipientsService, 'go').resolves([recipients.primaryUser, recipients.returnsAgent])
      })

      afterEach(() => {
        Sinon.restore()
      })

      it('returns all the recipients formatted for display', async () => {
        const result = await RecipientsService.go(session)

        expect(result).to.equal([
          {
            contact: null,
            contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
            contact_type: 'Primary user',
            email: 'primary.user@important.com',
            licence_refs: recipients.primaryUser.licence_refs,
            message_type: 'Email'
          },
          {
            contact: null,
            contact_hash_id: '2e6918568dfbc1d78e2fbe279aaee990',
            contact_type: 'Returns agent',
            email: 'returns.agent@important.com',
            licence_refs: recipients.returnsAgent.licence_refs,
            message_type: 'Email'
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

          Sinon.stub(FetchRecipientsService, 'go').resolves([recipients.primaryUser, recipients.licenceHolder])
        })

        afterEach(() => {
          Sinon.restore()
        })

        it('returns only the selected recipients formatted for display', async () => {
          const result = await RecipientsService.go(session, false)

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
              message_type: 'Letter'
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

          Sinon.stub(FetchRecipientsService, 'go').resolves([recipients.primaryUser, recipients.returnsAgent])
        })

        afterEach(() => {
          Sinon.restore()
        })

        it('returns all the recipients formatted for display', async () => {
          const result = await RecipientsService.go(session, false)

          expect(result).to.equal([
            {
              contact: null,
              contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
              contact_type: 'Primary user',
              email: 'primary.user@important.com',
              licence_refs: recipients.primaryUser.licence_refs,
              message_type: 'Email'
            },
            {
              contact: null,
              contact_hash_id: '2e6918568dfbc1d78e2fbe279aaee990',
              contact_type: 'Returns agent',
              email: 'returns.agent@important.com',
              licence_refs: recipients.returnsAgent.licence_refs,
              message_type: 'Email'
            }
          ])
        })
      })
    })
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
