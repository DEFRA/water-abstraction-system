'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../support/fixtures/recipients.fixture.js')

// Thing under test
const MergeRecipientsService = require('../../../../app/services/notices/setup/merge-recipients.service.js')

describe('Notices - Setup - Merge Recipients service', () => {
  let additionalRecipient
  let fetchedRecipients
  let session

  beforeEach(() => {
    fetchedRecipients = [RecipientsFixture.returnsNoticePrimaryUser(), RecipientsFixture.returnsNoticeReturnsAgent()]
  })

  describe('when the session has no additional recipients', () => {
    beforeEach(() => {
      session = {}
    })

    describe('and no selected recipients', () => {
      it('returns just the fetched recipients', () => {
        const results = MergeRecipientsService.go(session, fetchedRecipients)

        expect(results).to.equal([
          {
            contact: fetchedRecipients[0].contact,
            contact_hash_id: fetchedRecipients[0].contact_hash_id,
            contact_type: fetchedRecipients[0].contact_type,
            due_date_status: fetchedRecipients[0].due_date_status,
            email: fetchedRecipients[0].email,
            latest_due_date: fetchedRecipients[0].latest_due_date,
            licence_refs: fetchedRecipients[0].licence_refs,
            message_type: fetchedRecipients[0].message_type,
            notificationDueDate: fetchedRecipients[0].notificationDueDate,
            return_log_ids: fetchedRecipients[0].return_log_ids
          },
          {
            contact: fetchedRecipients[1].contact,
            contact_hash_id: fetchedRecipients[1].contact_hash_id,
            contact_type: fetchedRecipients[1].contact_type,
            due_date_status: fetchedRecipients[1].due_date_status,
            email: fetchedRecipients[1].email,
            latest_due_date: fetchedRecipients[1].latest_due_date,
            licence_refs: fetchedRecipients[1].licence_refs,
            message_type: fetchedRecipients[1].message_type,
            notificationDueDate: fetchedRecipients[1].notificationDueDate,
            return_log_ids: fetchedRecipients[1].return_log_ids
          }
        ])
      })
    })

    describe('and selected recipients', () => {
      beforeEach(() => {
        session.selectedRecipients = [fetchedRecipients[0].contact_hash_id]
      })

      it('returns just the selected fetched recipients', () => {
        const results = MergeRecipientsService.go(session, fetchedRecipients)

        expect(results).to.equal([
          {
            contact: fetchedRecipients[0].contact,
            contact_hash_id: fetchedRecipients[0].contact_hash_id,
            contact_type: fetchedRecipients[0].contact_type,
            due_date_status: fetchedRecipients[0].due_date_status,
            email: fetchedRecipients[0].email,
            latest_due_date: fetchedRecipients[0].latest_due_date,
            licence_refs: fetchedRecipients[0].licence_refs,
            message_type: fetchedRecipients[0].message_type,
            notificationDueDate: fetchedRecipients[0].notificationDueDate,
            return_log_ids: fetchedRecipients[0].return_log_ids
          }
        ])
      })
    })
  })

  describe('when the session has additional recipients', () => {
    describe('and no selected recipients', () => {
      describe('and the additional recipient is not a duplicate', () => {
        beforeEach(() => {
          additionalRecipient = RecipientsFixture.additionalEmailRecipient()

          session = {
            additionalRecipients: [additionalRecipient]
          }
        })

        it('returns all fetched and additional recipients', () => {
          const results = MergeRecipientsService.go(session, fetchedRecipients)

          expect(results).to.equal([
            {
              contact: fetchedRecipients[0].contact,
              contact_hash_id: fetchedRecipients[0].contact_hash_id,
              contact_type: fetchedRecipients[0].contact_type,
              due_date_status: fetchedRecipients[0].due_date_status,
              email: fetchedRecipients[0].email,
              latest_due_date: fetchedRecipients[0].latest_due_date,
              licence_refs: fetchedRecipients[0].licence_refs,
              message_type: fetchedRecipients[0].message_type,
              notificationDueDate: fetchedRecipients[0].notificationDueDate,
              return_log_ids: fetchedRecipients[0].return_log_ids
            },
            {
              contact: fetchedRecipients[1].contact,
              contact_hash_id: fetchedRecipients[1].contact_hash_id,
              contact_type: fetchedRecipients[1].contact_type,
              due_date_status: fetchedRecipients[1].due_date_status,
              email: fetchedRecipients[1].email,
              latest_due_date: fetchedRecipients[1].latest_due_date,
              licence_refs: fetchedRecipients[1].licence_refs,
              message_type: fetchedRecipients[1].message_type,
              notificationDueDate: fetchedRecipients[1].notificationDueDate,
              return_log_ids: fetchedRecipients[1].return_log_ids
            },
            {
              contact: additionalRecipient.contact,
              contact_hash_id: additionalRecipient.contact_hash_id,
              contact_type: additionalRecipient.contact_type,
              due_date_status: additionalRecipient.due_date_status,
              email: additionalRecipient.email,
              latest_due_date: additionalRecipient.latest_due_date,
              licence_ref: additionalRecipient.licence_ref,
              licence_refs: additionalRecipient.licence_refs,
              message_type: additionalRecipient.message_type,
              notificationDueDate: additionalRecipient.notificationDueDate,
              return_log_ids: fetchedRecipients[0].return_log_ids
            }
          ])
        })
      })

      describe('and the additional recipient is a duplicate of a fetched recipient', () => {
        beforeEach(() => {
          const { email, licence_ref: licenceRef } = fetchedRecipients[0]

          additionalRecipient = RecipientsFixture.additionalEmailRecipient(licenceRef, email)

          session = {
            additionalRecipients: [additionalRecipient]
          }
        })

        it('returns only the fetched recipients', () => {
          const results = MergeRecipientsService.go(session, fetchedRecipients)

          expect(results).to.equal([
            {
              contact: fetchedRecipients[0].contact,
              contact_hash_id: fetchedRecipients[0].contact_hash_id,
              contact_type: fetchedRecipients[0].contact_type,
              due_date_status: fetchedRecipients[0].due_date_status,
              email: fetchedRecipients[0].email,
              latest_due_date: fetchedRecipients[0].latest_due_date,
              licence_refs: fetchedRecipients[0].licence_refs,
              message_type: fetchedRecipients[0].message_type,
              notificationDueDate: fetchedRecipients[0].notificationDueDate,
              return_log_ids: fetchedRecipients[0].return_log_ids
            },
            {
              contact: fetchedRecipients[1].contact,
              contact_hash_id: fetchedRecipients[1].contact_hash_id,
              contact_type: fetchedRecipients[1].contact_type,
              due_date_status: fetchedRecipients[1].due_date_status,
              email: fetchedRecipients[1].email,
              latest_due_date: fetchedRecipients[1].latest_due_date,
              licence_refs: fetchedRecipients[1].licence_refs,
              message_type: fetchedRecipients[1].message_type,
              notificationDueDate: fetchedRecipients[1].notificationDueDate,
              return_log_ids: fetchedRecipients[1].return_log_ids
            }
          ])
        })
      })

      describe('and the additional recipient is a duplicate of another additional recipient', () => {
        beforeEach(() => {
          additionalRecipient = RecipientsFixture.additionalEmailRecipient()

          const { email, licence_ref: licenceRef } = additionalRecipient
          const duplicateAdditionalRecipient = RecipientsFixture.additionalEmailRecipient(licenceRef, email)

          session = {
            additionalRecipients: [additionalRecipient, duplicateAdditionalRecipient]
          }
        })

        it('returns all fetched recipients and additional recipients without duplicates', () => {
          const results = MergeRecipientsService.go(session, fetchedRecipients)

          expect(results).to.equal([
            {
              contact: fetchedRecipients[0].contact,
              contact_hash_id: fetchedRecipients[0].contact_hash_id,
              contact_type: fetchedRecipients[0].contact_type,
              due_date_status: fetchedRecipients[0].due_date_status,
              email: fetchedRecipients[0].email,
              latest_due_date: fetchedRecipients[0].latest_due_date,
              licence_refs: fetchedRecipients[0].licence_refs,
              message_type: fetchedRecipients[0].message_type,
              notificationDueDate: fetchedRecipients[0].notificationDueDate,
              return_log_ids: fetchedRecipients[0].return_log_ids
            },
            {
              contact: fetchedRecipients[1].contact,
              contact_hash_id: fetchedRecipients[1].contact_hash_id,
              contact_type: fetchedRecipients[1].contact_type,
              due_date_status: fetchedRecipients[1].due_date_status,
              email: fetchedRecipients[1].email,
              latest_due_date: fetchedRecipients[1].latest_due_date,
              licence_refs: fetchedRecipients[1].licence_refs,
              message_type: fetchedRecipients[1].message_type,
              notificationDueDate: fetchedRecipients[1].notificationDueDate,
              return_log_ids: fetchedRecipients[1].return_log_ids
            },
            {
              contact: additionalRecipient.contact,
              contact_hash_id: additionalRecipient.contact_hash_id,
              contact_type: additionalRecipient.contact_type,
              due_date_status: additionalRecipient.due_date_status,
              email: additionalRecipient.email,
              latest_due_date: additionalRecipient.latest_due_date,
              licence_ref: additionalRecipient.licence_ref,
              licence_refs: additionalRecipient.licence_refs,
              message_type: additionalRecipient.message_type,
              notificationDueDate: additionalRecipient.notificationDueDate,
              return_log_ids: fetchedRecipients[0].return_log_ids
            }
          ])
        })
      })
    })

    describe('and selected recipients', () => {
      describe('which is only one of the fetched recipients', () => {
        beforeEach(() => {
          additionalRecipient = RecipientsFixture.additionalEmailRecipient()

          session = {
            additionalRecipients: [additionalRecipient],
            selectedRecipients: [fetchedRecipients[0].contact_hash_id]
          }
        })

        it('returns just the selected fetched recipients', () => {
          const results = MergeRecipientsService.go(session, fetchedRecipients)

          expect(results).to.equal([
            {
              contact: fetchedRecipients[0].contact,
              contact_hash_id: fetchedRecipients[0].contact_hash_id,
              contact_type: fetchedRecipients[0].contact_type,
              due_date_status: fetchedRecipients[0].due_date_status,
              email: fetchedRecipients[0].email,
              latest_due_date: fetchedRecipients[0].latest_due_date,
              licence_refs: fetchedRecipients[0].licence_refs,
              message_type: fetchedRecipients[0].message_type,
              notificationDueDate: fetchedRecipients[0].notificationDueDate,
              return_log_ids: fetchedRecipients[0].return_log_ids
            }
          ])
        })
      })

      describe('which is only one of the additional recipients', () => {
        beforeEach(() => {
          additionalRecipient = RecipientsFixture.additionalEmailRecipient()

          session = {
            additionalRecipients: [additionalRecipient],
            selectedRecipients: [additionalRecipient.contact_hash_id]
          }
        })

        it('returns just the selected additional recipients', () => {
          const results = MergeRecipientsService.go(session, fetchedRecipients)

          expect(results).to.equal([
            {
              contact: additionalRecipient.contact,
              contact_hash_id: additionalRecipient.contact_hash_id,
              contact_type: additionalRecipient.contact_type,
              due_date_status: additionalRecipient.due_date_status,
              email: additionalRecipient.email,
              latest_due_date: additionalRecipient.latest_due_date,
              licence_ref: additionalRecipient.licence_ref,
              licence_refs: additionalRecipient.licence_refs,
              message_type: additionalRecipient.message_type,
              notificationDueDate: additionalRecipient.notificationDueDate,
              return_log_ids: fetchedRecipients[0].return_log_ids
            }
          ])
        })
      })

      describe('which is both a fetched and an additional recipient', () => {
        beforeEach(() => {
          additionalRecipient = RecipientsFixture.additionalEmailRecipient()

          const otherAdditionalRecipient = RecipientsFixture.additionalPostalRecipient()

          session = {
            additionalRecipients: [additionalRecipient, otherAdditionalRecipient],
            selectedRecipients: [fetchedRecipients[0].contact_hash_id, additionalRecipient.contact_hash_id]
          }
        })

        it('returns only the selected fetched and additional recipients', () => {
          const results = MergeRecipientsService.go(session, fetchedRecipients)

          expect(results).to.equal([
            {
              contact: fetchedRecipients[0].contact,
              contact_hash_id: fetchedRecipients[0].contact_hash_id,
              contact_type: fetchedRecipients[0].contact_type,
              due_date_status: fetchedRecipients[0].due_date_status,
              email: fetchedRecipients[0].email,
              latest_due_date: fetchedRecipients[0].latest_due_date,
              licence_refs: fetchedRecipients[0].licence_refs,
              message_type: fetchedRecipients[0].message_type,
              notificationDueDate: fetchedRecipients[0].notificationDueDate,
              return_log_ids: fetchedRecipients[0].return_log_ids
            },
            {
              contact: additionalRecipient.contact,
              contact_hash_id: additionalRecipient.contact_hash_id,
              contact_type: additionalRecipient.contact_type,
              due_date_status: additionalRecipient.due_date_status,
              email: additionalRecipient.email,
              latest_due_date: additionalRecipient.latest_due_date,
              licence_ref: additionalRecipient.licence_ref,
              licence_refs: additionalRecipient.licence_refs,
              message_type: additionalRecipient.message_type,
              notificationDueDate: additionalRecipient.notificationDueDate,
              return_log_ids: fetchedRecipients[0].return_log_ids
            }
          ])
        })
      })
    })
  })
})
