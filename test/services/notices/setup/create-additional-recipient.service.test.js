'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AddressHelper = require('../../../support/helpers/address.helper.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const CreateAdditionalRecipientService = require('../../../../app/services/notices/setup/create-additional-recipient.service.js')

describe('Notices - Setup - Create additional recipient service', () => {
  let session
  let sessionData
  let addressHash

  describe('when there is a UK address saved in session', () => {
    beforeEach(async () => {
      sessionData = {
        name: 'Fake Person',
        address: {
          addressLine1: '1 Fake Farm',
          addressLine2: '1 Fake street',
          addressLine3: 'Fake Village',
          addressLine4: 'Fake City',
          postcode: 'SW1A 1AA'
        },
        selectedRecipients: []
      }

      session = await SessionHelper.add({ data: sessionData })
      addressHash = AddressHelper.generateAdreessMD5Hash(sessionData)
    })

    it('should add the address to the additional recipients array with a hashed contact id', async () => {
      await CreateAdditionalRecipientService.go(session.id)

      const refreshedSession = await session.$query()

      expect(refreshedSession.additionalRecipients).equal([
        {
          contact: ['Fake Person', '1 Fake Farm', '1 Fake street', 'Fake Village', 'Fake City', 'SW1A 1AA'],
          contact_hash_id: addressHash
        }
      ])
      expect(refreshedSession.selectedRecipients).equal([addressHash])
    })
  })

  describe('when there is an international address saved in session', () => {
    beforeEach(async () => {
      sessionData = {
        name: 'Fake Person',
        address: {
          addressLine1: '1 Fake Farm',
          addressLine4: 'Fake City',
          country: 'Ireland'
        },
        selectedRecipients: []
      }

      session = await SessionHelper.add({ data: sessionData })
      addressHash = AddressHelper.generateAdreessMD5Hash(sessionData)
    })

    it('should add the address to the additional recipients array with a hashed contact id', async () => {
      await CreateAdditionalRecipientService.go(session.id)

      const refreshedSession = await session.$query()

      expect(refreshedSession.additionalRecipients).equal([
        {
          contact: ['Fake Person', '1 Fake Farm', 'Fake City', 'Ireland'],
          contact_hash_id: addressHash
        }
      ])
      expect(refreshedSession.selectedRecipients).equal([addressHash])
    })
  })

  describe('when there is a UK address saved in session and there already is an additionalRecipient in the array', () => {
    beforeEach(async () => {
      sessionData = {
        name: 'Fake Person',
        address: {
          addressLine1: '2 Fake Farm',
          addressLine2: '2 Fake street',
          addressLine3: 'Fake Village',
          addressLine4: 'Fake City',
          postcode: 'SW1A 1AA'
        },
        additionalRecipients: [
          {
            contact: ['Fake Person', '1 Fake Farm', '1 Fake street', 'Fake Village', 'Fake City', 'SW1A 1AA'],
            contact_hash_id: '78de9d5db4c52b66818004e2b0dc4392'
          }
        ],
        selectedRecipients: []
      }

      session = await SessionHelper.add({ data: sessionData })
      addressHash = AddressHelper.generateAdreessMD5Hash(sessionData)
    })

    it('should add the address to the additional recipients array with a hashed contact id', async () => {
      await CreateAdditionalRecipientService.go(session.id)

      const refreshedSession = await session.$query()

      expect(refreshedSession.additionalRecipients).equal([
        {
          contact: ['Fake Person', '1 Fake Farm', '1 Fake street', 'Fake Village', 'Fake City', 'SW1A 1AA'],
          contact_hash_id: '78de9d5db4c52b66818004e2b0dc4392'
        },
        {
          contact: ['Fake Person', '2 Fake Farm', '2 Fake street', 'Fake Village', 'Fake City', 'SW1A 1AA'],
          contact_hash_id: addressHash
        }
      ])
      expect(refreshedSession.selectedRecipients).equal([addressHash])
    })
  })
})
