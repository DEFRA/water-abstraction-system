'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AddressHelper = require('../../../support/helpers/address.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const AddRecipientService = require('../../../../app/services/notices/setup/add-recipient.service.js')

describe('Notices - Setup - Add Recipient service', () => {
  let contactHashId
  let session
  let sessionId
  let sessionData
  let yarStub

  beforeEach(async () => {
    sessionId = generateUUID()

    sessionData = {
      contactName: 'Fake Person',
      licenceRef: '12345',
      selectedRecipients: []
    }
  })

  describe('when there is an address saved in the session', () => {
    describe('and it is a UK address', () => {
      beforeEach(() => {
        sessionData.addressJourney = {
          activeNavBar: 'manage',
          address: {
            uprn: 340116,
            addressLine1: 'ENVIRONMENT AGENCY',
            addressLine2: 'HORIZON HOUSE DEANERY ROAD',
            addressLine3: 'VILLAGE GREEN',
            addressLine4: 'BRISTOL',
            postcode: 'BS1 5AH'
          },
          backLink: {
            href: `/system/notices/setup/${sessionId}/contact-type`,
            text: 'Back'
          },
          redirectUrl: `/system/notices/setup/${sessionId}/add-recipient`
        }

        contactHashId = AddressHelper.generateContactHashId(sessionData.contactName, sessionData.addressJourney.address)
      })

      describe('and this is the first additional contact to be added', () => {
        beforeEach(async () => {
          session = await SessionHelper.add({ id: sessionId, data: sessionData })
          yarStub = { flash: Sinon.stub().returns([{ title: 'Updated', text: 'Additional recipient added' }]) }
        })

        it('adds an `additionalRecipients` property to the session containing the recipient and pushes its hash ID into `selectedRecipients`', async () => {
          await AddRecipientService.go(sessionId, yarStub)

          const refreshedSession = await session.$query()

          const [flashType, bannerMessage] = yarStub.flash.args[0]

          expect(flashType).to.equal('notification')
          expect(bannerMessage).to.equal({ title: 'Updated', text: 'Additional recipient added' })
          expect(refreshedSession.additionalRecipients).equal([
            {
              contact: {
                name: sessionData.contactName,
                addressLine1: sessionData.addressJourney.address.addressLine1,
                addressLine2: sessionData.addressJourney.address.addressLine2,
                addressLine3: sessionData.addressJourney.address.addressLine3,
                addressLine4: sessionData.addressJourney.address.addressLine4,
                postcode: sessionData.addressJourney.address.postcode
              },
              contact_hash_id: contactHashId,
              contact_type: 'Single use',
              licence_ref: sessionData.licenceRef,
              licence_refs: sessionData.licenceRef
            }
          ])
          expect(refreshedSession.selectedRecipients).equal([contactHashId])
          expect(refreshedSession.addressJourney.redirectUrl).equal(`/system/notices/setup/${sessionId}/add-recipient`)
        })
      })

      describe('and there are existing additional contacts stored in the session', () => {
        beforeEach(async () => {
          sessionData.additionalRecipients = [
            {
              contact: {
                name: 'Fake Other',
                addressLine1: '2 Fake Farm',
                addressLine2: '2 Fake street',
                addressLine3: 'Fake Village',
                addressLine4: 'Fake City',
                postcode: 'SW2A 2AA'
              },
              contact_hash_id: '78de9d5db4c52b66818004e2b0dc4392',
              licence_refs: '01/123'
            }
          ]
          sessionData.selectedRecipients = ['78de9d5db4c52b66818004e2b0dc4392']

          session = await SessionHelper.add({ id: sessionId, data: sessionData })
          yarStub = { flash: Sinon.stub().returns([{ title: 'Updated', text: 'Additional recipient added' }]) }
        })

        it('adds the recipient to `additionalRecipients` and pushes its hash ID into `selectedRecipients`', async () => {
          await AddRecipientService.go(sessionId, yarStub)

          const refreshedSession = await session.$query()

          const [flashType, bannerMessage] = yarStub.flash.args[0]

          expect(flashType).to.equal('notification')
          expect(bannerMessage).to.equal({ title: 'Updated', text: 'Additional recipient added' })
          expect(refreshedSession.additionalRecipients).equal([
            {
              contact: {
                name: 'Fake Other',
                addressLine1: '2 Fake Farm',
                addressLine2: '2 Fake street',
                addressLine3: 'Fake Village',
                addressLine4: 'Fake City',
                postcode: 'SW2A 2AA'
              },
              contact_hash_id: '78de9d5db4c52b66818004e2b0dc4392',
              licence_refs: '01/123'
            },
            {
              contact: {
                name: session.contactName,
                addressLine1: session.addressJourney.address.addressLine1,
                addressLine2: session.addressJourney.address.addressLine2,
                addressLine3: session.addressJourney.address.addressLine3,
                addressLine4: session.addressJourney.address.addressLine4,
                postcode: session.addressJourney.address.postcode
              },
              contact_hash_id: contactHashId,
              contact_type: 'Single use',
              licence_ref: session.licenceRef,
              licence_refs: session.licenceRef
            }
          ])
          expect(refreshedSession.selectedRecipients).equal(['78de9d5db4c52b66818004e2b0dc4392', contactHashId])
          expect(refreshedSession.addressJourney.redirectUrl).equal(`/system/notices/setup/${sessionId}/add-recipient`)
        })
      })
    })

    describe('and it is an International address', () => {
      beforeEach(() => {
        sessionData.addressJourney = {
          activeNavBar: 'manage',
          address: {
            addressLine1: '1 Faux Ferme',
            addressLine4: 'Faux Ville',
            country: 'France'
          },
          backLink: {
            href: `/system/notices/setup/${sessionId}/contact-type`,
            text: 'Back'
          },
          redirectUrl: `/system/notices/setup/${sessionId}/add-recipient`
        }

        contactHashId = AddressHelper.generateContactHashId(sessionData.contactName, sessionData.addressJourney.address)
      })

      describe('and this is the first additional contact to be added', () => {
        beforeEach(async () => {
          session = await SessionHelper.add({ id: sessionId, data: sessionData })
          yarStub = { flash: Sinon.stub().returns([{ title: 'Updated', text: 'Additional recipient added' }]) }
        })

        it('adds a `additionalRecipients` property to the session containing the recipient and pushes its hash ID into `selectedRecipients`', async () => {
          await AddRecipientService.go(sessionId, yarStub)

          const refreshedSession = await session.$query()

          const [flashType, bannerMessage] = yarStub.flash.args[0]

          expect(flashType).to.equal('notification')
          expect(bannerMessage).to.equal({ title: 'Updated', text: 'Additional recipient added' })
          expect(refreshedSession.additionalRecipients).equal([
            {
              contact: {
                name: sessionData.contactName,
                addressLine1: sessionData.addressJourney.address.addressLine1,
                addressLine4: sessionData.addressJourney.address.addressLine4,
                country: sessionData.addressJourney.address.country
              },
              contact_hash_id: contactHashId,
              contact_type: 'Single use',
              licence_ref: sessionData.licenceRef,
              licence_refs: sessionData.licenceRef
            }
          ])
          expect(refreshedSession.selectedRecipients).equal([contactHashId])
          expect(refreshedSession.addressJourney.redirectUrl).equal(`/system/notices/setup/${sessionId}/add-recipient`)
        })
      })
    })
  })
})
