'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsSeeder = require('../../../support/seeders/recipients.seeder.js')

// Thing under test
const RecipientsService = require('../../../../app/services/notifications/setup/recipients.service.js')

describe('Notifications Setup - Recipients service', () => {
  let dueDate
  let isSummer
  let recipients
  let address // This is boilerplate to make the code readable

  before(async () => {
    dueDate = '2023-04-28' // matches return log date
    isSummer = 'false'
    address = RecipientsSeeder.data.address()

    recipients = await RecipientsSeeder.seed()
  })

  describe('when the licence number only has one recipient which has the "licence holder" role', () => {
    it('correctly returns the licence holder data', async () => {
      const result = await RecipientsService.go(dueDate, isSummer)

      const [savedRecipient] = recipients
      const [licenceHolder] = result.filter((res) => res.all_licences.includes(savedRecipient.licenceRef))

      expect(licenceHolder).to.equal({
        all_licences: savedRecipient.licenceRef,
        contact: {
          ...address,
          name: 'Licence holder only',
          role: 'Licence holder'
        },
        contact_hash_id: -1672785580,
        message_type: 'Letter - licence holder',
        recipient: null
      })
    })
  })

  describe('when the licence number has one recipient which has the "licence holder" and "Returns to" role', () => {
    it('correctly returns the licence holder and returns to data', async () => {
      const result = await RecipientsService.go(dueDate, isSummer)

      const [, savedRecipient] = recipients
      const [licenceHolder, returnsTo] = result.filter((res) => res.all_licences.includes(savedRecipient.licenceRef))

      expect(licenceHolder).to.equal({
        all_licences: savedRecipient.licenceRef,
        contact: {
          ...address,
          name: 'Licence holder and returns to',
          role: 'Licence holder',
          type: 'Person'
        },
        contact_hash_id: -617218923,
        message_type: 'Letter - licence holder',
        recipient: null
      })
      expect(returnsTo).to.equal({
        all_licences: savedRecipient.licenceRef,
        contact: {
          ...address,
          name: 'Licence holder and returns to',
          role: 'Returns to',
          type: 'Person'
        },
        contact_hash_id: -617218923,
        message_type: 'Letter - returns to',
        recipient: null
      })
    })
  })
})
