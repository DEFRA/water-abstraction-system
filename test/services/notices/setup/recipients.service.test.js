'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')

// Thing under test
const RecipientsService = require('../../../../app/services/notices/setup/recipients.service.js')

describe('Notices - Setup - Recipients service', () => {
  let recipients
  let recipientsFixture
  let session

  beforeEach(() => {
    recipientsFixture = RecipientsFixture.recipients()

    recipients = [...Object.values(recipientsFixture)]

    session = {}
  })

  describe('when getting the recipients', () => {
    describe('and all recipients are required', () => {
      beforeEach(() => {
        recipients = [recipientsFixture.primaryUser, recipientsFixture.returnsAgent, recipientsFixture.licenceHolder]
      })

      it('returns all the recipients formatted for display', () => {
        const result = RecipientsService.go(session, recipients)

        expect(result).to.equal([
          {
            contact: null,
            contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
            contact_type: 'Primary user',
            email: 'primary.user@important.com',
            licence_refs: recipientsFixture.primaryUser.licence_refs,
            return_log_ids: recipientsFixture.primaryUser.return_log_ids
          },
          {
            contact: null,
            contact_hash_id: '2e6918568dfbc1d78e2fbe279aaee990',
            contact_type: 'Returns agent',
            email: 'returns.agent@important.com',
            licence_refs: recipientsFixture.returnsAgent.licence_refs,
            return_log_ids: recipientsFixture.returnsAgent.return_log_ids
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
            licence_refs: recipientsFixture.licenceHolder.licence_refs,
            return_log_ids: recipientsFixture.licenceHolder.return_log_ids
          }
        ])
      })
    })

    describe('and all recipients are not required', () => {
      describe('when there are selected recipients', () => {
        beforeEach(() => {
          session = {
            selectedRecipients: [recipientsFixture.licenceHolder.contact_hash_id]
          }
        })

        it('returns only the selected recipients formatted for display', () => {
          const result = RecipientsService.go(session, recipients)

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
              licence_refs: recipientsFixture.licenceHolder.licence_refs,
              return_log_ids: recipientsFixture.licenceHolder.return_log_ids
            }
          ])
        })
      })

      describe('when there are no selected recipients', () => {
        beforeEach(() => {
          recipients = [recipientsFixture.primaryUser, recipientsFixture.returnsAgent]
        })

        it('returns all the recipients formatted for display', () => {
          const result = RecipientsService.go(session, recipients)

          expect(result).to.equal([
            {
              contact: null,
              contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
              contact_type: 'Primary user',
              email: 'primary.user@important.com',
              licence_refs: recipientsFixture.primaryUser.licence_refs,
              return_log_ids: recipientsFixture.primaryUser.return_log_ids
            },
            {
              contact: null,
              contact_hash_id: '2e6918568dfbc1d78e2fbe279aaee990',
              contact_type: 'Returns agent',
              email: 'returns.agent@important.com',
              licence_refs: recipientsFixture.returnsAgent.licence_refs,
              return_log_ids: recipientsFixture.returnsAgent.return_log_ids
            }
          ])
        })
      })
    })

    describe('and there are "additionalRecipients"', () => {
      beforeEach(() => {
        session = {
          additionalRecipients: [recipientsFixture.licenceHolder]
        }

        recipients = [recipientsFixture.primaryUser, recipientsFixture.returnsAgent]
      })

      it('returns all the recipients (including "additionalRecipients") formatted for display', () => {
        const result = RecipientsService.go(session, recipients)

        expect(result).to.equal([
          {
            contact: null,
            contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
            contact_type: 'Primary user',
            email: 'primary.user@important.com',
            licence_refs: recipientsFixture.primaryUser.licence_refs,
            return_log_ids: recipientsFixture.primaryUser.return_log_ids
          },
          {
            contact: null,
            contact_hash_id: '2e6918568dfbc1d78e2fbe279aaee990',
            contact_type: 'Returns agent',
            email: 'returns.agent@important.com',
            licence_refs: recipientsFixture.returnsAgent.licence_refs,
            return_log_ids: recipientsFixture.returnsAgent.return_log_ids
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
            licence_refs: recipientsFixture.licenceHolder.licence_refs,
            return_log_ids: recipientsFixture.licenceHolder.return_log_ids
          }
        ])
      })
    })
  })
})
