'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsSeeder = require('../../../support/seeders/recipients.seeder.js')

// Thing under test
const RecipientsService = require('../../../../app/services/notifications/setup/fetch-recipients.service.js')

describe('Notifications Setup - Recipients service', () => {
  let dueDate
  let isSummer
  let recipients

  before(async () => {
    dueDate = '2023-04-28' // matches return log date
    isSummer = 'false'

    recipients = await RecipientsSeeder.seed()
  })

  describe('when there is a "primary user"', () => {
    it('correctly returns the "primary user" instead of the "Licence holder"', async () => {
      const result = await RecipientsService.go(dueDate, isSummer)

      const [testRecipient] = result.filter((res) => res.all_licences.includes(recipients.primaryUser.licenceRef))

      expect(testRecipient).to.equal({
        all_licences: recipients.primaryUser.licenceRef,
        contact: null,
        contact_hash_id: 1178136542,
        message_type: 'Email - primary user',
        recipient: 'primary.user@important.com'
      })
    })

    describe('and there is a "returns agent" (known as userReturns in the DB)', () => {
      it('correctly returns the "returns agent" as well as the primary user', async () => {
        const result = await RecipientsService.go(dueDate, isSummer)

        const [_, testRecipientReturnsAgent] = result.filter((res) =>
          res.all_licences.includes(recipients.primaryUser.licenceRef)
        )

        expect(testRecipientReturnsAgent).to.equal({
          all_licences: recipients.primaryUser.licenceRef,
          contact: null,
          contact_hash_id: -370722837,
          message_type: 'Email - returns agent',
          recipient: 'returns.agent@important.com'
        })
      })
    })
  })

  describe('when the licence number only has one recipient which has the "licence holder" role', () => {
    it('correctly returns the licence holder data', async () => {
      const result = await RecipientsService.go(dueDate, isSummer)

      const [testRecipient] = result.filter((res) => res.all_licences.includes(recipients.licenceHolder.licenceRef))

      expect(testRecipient).to.equal({
        all_licences: recipients.licenceHolder.licenceRef,
        contact: {
          addressLine1: '4',
          addressLine2: 'Privet Drive',
          addressLine3: null,
          addressLine4: null,
          country: null,
          county: 'Surrey',
          forename: 'Harry',
          initials: 'J',
          name: 'Licence holder only',
          postcode: 'WD25 7LR',
          role: 'Licence holder',
          salutation: null,
          town: 'Little Whinging',
          type: 'Person'
        },
        contact_hash_id: -1672785580,
        message_type: 'Letter - licence holder',
        recipient: null
      })
    })
  })

  describe('when the licence has one recipient which has both the "licence holder" and "Returns to" role', () => {
    it('correctly returns the licence holder and returns to data', async () => {
      const result = await RecipientsService.go(dueDate, isSummer)

      const [licenceHolder, returnsTo] = result.filter((res) =>
        res.all_licences.includes(recipients.licenceHolderAndReturnTo.licenceRef)
      )

      expect(licenceHolder).to.equal({
        all_licences: recipients.licenceHolderAndReturnTo.licenceRef,
        contact: {
          addressLine1: '4',
          addressLine2: 'Privet Drive',
          addressLine3: null,
          addressLine4: null,
          country: null,
          county: 'Surrey',
          forename: 'Harry',
          initials: 'J',
          name: 'Licence holder and returns to',
          postcode: 'WD25 7LR',
          role: 'Licence holder',
          salutation: null,
          town: 'Little Whinging',
          type: 'Person'
        },
        contact_hash_id: -617218923,
        message_type: 'Letter - licence holder',
        recipient: null
      })

      expect(returnsTo).to.equal({
        all_licences: recipients.licenceHolderAndReturnTo.licenceRef,
        contact: {
          addressLine1: '4',
          addressLine2: 'Privet Drive',
          addressLine3: null,
          addressLine4: null,
          country: null,
          county: 'Surrey',
          forename: 'Harry',
          initials: 'J',
          name: 'Licence holder and returns to',
          postcode: 'WD25 7LR',
          role: 'Returns to',
          salutation: null,
          town: 'Little Whinging',
          type: 'Person'
        },
        contact_hash_id: -617218923,
        message_type: 'Letter - returns to',
        recipient: null
      })
    })
  })
})
