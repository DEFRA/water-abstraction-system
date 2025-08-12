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
const AddAdditionalRecipientService = require('../../../../app/services/notices/setup/add-additional-recipient.service.js')

describe('Notices - Setup - Create additional recipient service', () => {
  let session
  let sessionData
  let addressHash

  describe('when there is a UK address saved in session', () => {
    beforeEach(async () => {
      sessionData = {
        contactName: 'Fake Person',
        address: {
          addressLine1: '1 Fake Farm',
          addressLine2: '1 Fake street',
          addressLine3: 'Fake Village',
          addressLine4: 'Fake City',
          postcode: 'SW1A 1AA'
        },
        licenceRef: '12345',
        selectedRecipients: []
      }

      session = await SessionHelper.add({ data: sessionData })
      addressHash = AddressHelper.generateAdressContactHashId(sessionData)
    })

    it('should add the address to the additional recipients array with a hashed contact id', async () => {
      await AddAdditionalRecipientService.go(session.id)

      const refreshedSession = await session.$query()

      expect(refreshedSession.additionalRecipients).equal([
        {
          contact: {
            name: session.contactName,
            addressLine1: session.address.addressLine1,
            addressLine2: session.address.addressLine2,
            addressLine3: session.address.addressLine3,
            addressLine4: session.address.addressLine4,
            postcode: session.address.postcode
          },
          contact_hash_id: addressHash,
          licence_refs: session.licenceRef
        }
      ])
      expect(refreshedSession.selectedRecipients).equal([addressHash])
    })
  })

  describe('when there is an international address saved in session', () => {
    beforeEach(async () => {
      sessionData = {
        contactName: 'Fake Person',
        address: {
          addressLine1: '1 Fake Farm',
          addressLine4: 'Fake City',
          country: 'Ireland'
        },
        licenceRef: '12345',
        selectedRecipients: []
      }

      session = await SessionHelper.add({ data: sessionData })
      addressHash = AddressHelper.generateAdressContactHashId(sessionData)
    })

    it('should add the address to the additional recipients array with a hashed contact id', async () => {
      await AddAdditionalRecipientService.go(session.id)

      const refreshedSession = await session.$query()

      expect(refreshedSession.additionalRecipients).equal([
        {
          contact: {
            name: session.contactName,
            addressLine1: session.address.addressLine1,
            addressLine4: session.address.addressLine4,
            country: session.address.country
          },
          contact_hash_id: addressHash,
          licence_refs: session.licenceRef
        }
      ])
      expect(refreshedSession.selectedRecipients).equal([addressHash])
    })
  })

  describe('when there is a UK address saved in session and there already is an additionalRecipient in the array', () => {
    beforeEach(async () => {
      sessionData = {
        contactName: 'Fake Person',
        address: {
          addressLine1: '2 Fake Farm',
          addressLine2: '2 Fake street',
          addressLine3: 'Fake Village',
          addressLine4: 'Fake City',
          postcode: 'SW1A 1AA'
        },
        additionalRecipients: [
          {
            contact: {
              name: 'Fake Person',
              addressLine1: '1 Fake Farm',
              addressLine2: '1 Fake street',
              addressLine3: 'Fake Village',
              addressLine4: 'Fake City',
              postcode: 'SW1A 1AA'
            },
            contact_hash_id: '78de9d5db4c52b66818004e2b0dc4392',
            licence_refs: '12345'
          }
        ],
        licenceRef: '12345',
        selectedRecipients: []
      }

      session = await SessionHelper.add({ data: sessionData })
      addressHash = AddressHelper.generateAdressContactHashId(sessionData)
    })

    it('should add the address to the additional recipients array with a hashed contact id', async () => {
      await AddAdditionalRecipientService.go(session.id)

      const refreshedSession = await session.$query()

      expect(refreshedSession.additionalRecipients).equal([
        {
          contact: {
            name: 'Fake Person',
            addressLine1: '1 Fake Farm',
            addressLine2: '1 Fake street',
            addressLine3: 'Fake Village',
            addressLine4: 'Fake City',
            postcode: 'SW1A 1AA'
          },
          contact_hash_id: '78de9d5db4c52b66818004e2b0dc4392',
          licence_refs: '12345'
        },
        {
          contact: {
            name: session.contactName,
            addressLine1: session.address.addressLine1,
            addressLine2: session.address.addressLine2,
            addressLine3: session.address.addressLine3,
            addressLine4: session.address.addressLine4,
            postcode: session.address.postcode
          },
          contact_hash_id: addressHash,
          licence_refs: session.licenceRef
        }
      ])
      expect(refreshedSession.selectedRecipients).equal([addressHash])
    })
  })
})
