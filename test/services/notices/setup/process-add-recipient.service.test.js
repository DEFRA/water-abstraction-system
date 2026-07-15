// Test helpers
import AddressHelper from '../../../support/helpers/address.helper.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'
import LicenceHelper from '../../../support/helpers/licence.helper.js'
import { generateUUID } from '../../../../app/lib/general.lib.js'

// Test helpers
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import ProcessAddRecipientService from '../../../../app/services/notices/setup/process-add-recipient.service.js'

describe('Notices - Setup - Process Add Recipient service', () => {
  let contactHashId
  let licenceRef
  let session
  let sessionData
  let sessionId
  let yarStub

  beforeEach(() => {
    sessionId = generateUUID()

    licenceRef = LicenceHelper.generateLicenceRef()

    sessionData = {
      contactName: 'Fake Person',
      licenceRef,
      selectedRecipients: []
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when there is an address saved in the session', () => {
    describe('and it is a UK address', () => {
      beforeEach(() => {
        sessionData.addressJourney = {
          activeNavBar: 'notices',
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
        beforeEach(() => {
          session = SessionModelStub({
            ...sessionData,
            id: sessionId
          })

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

          yarStub = YarStub()
          yarStub.flash.mockReturnValue([{ title: 'Updated', text: 'Additional recipient added' }])
        })

        it('adds an `additionalRecipients` property to the session containing the recipient and pushes its hash ID into `selectedRecipients`', async () => {
          await ProcessAddRecipientService(sessionId, yarStub)

          const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

          expect(flashType).toEqual('notification')
          expect(bannerMessage).toEqual({ titleText: 'Updated', text: 'Additional recipient added' })
          expect(session.additionalRecipients).toEqual([
            {
              contact: {
                address1: 'ENVIRONMENT AGENCY',
                address2: 'HORIZON HOUSE DEANERY ROAD',
                address3: 'VILLAGE GREEN',
                address4: 'BRISTOL',
                country: undefined,
                name: 'Fake Person',
                postcode: 'BS1 5AH'
              },
              contact_hash_id: contactHashId,
              contact_type: 'single use',
              email: null,
              licence_ref: sessionData.licenceRef,
              licence_refs: [sessionData.licenceRef],
              message_type: 'Letter'
            }
          ])
          expect(session.selectedRecipients).toEqual([contactHashId])
          expect(session.addressJourney.redirectUrl).toEqual(`/system/notices/setup/${sessionId}/add-recipient`)
        })
      })

      describe('and there are existing additional contacts stored in the session', () => {
        beforeEach(() => {
          sessionData.additionalRecipients = [
            {
              contact: {
                name: 'Fake Other',
                address1: '2 Fake Farm',
                address2: '2 Fake street',
                address3: 'Fake Village',
                address4: 'Fake City',
                postcode: 'SW2A 2AA'
              },
              contact_hash_id: '78de9d5db4c52b66818004e2b0dc4392',
              contact_type: 'single use',
              email: null,
              licence_refs: [licenceRef],
              message_type: 'Letter'
            }
          ]
          sessionData.selectedRecipients = ['78de9d5db4c52b66818004e2b0dc4392']

          session = SessionModelStub({
            ...sessionData,
            id: sessionId
          })

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

          yarStub = YarStub()
          yarStub.flash.mockReturnValue([{ title: 'Updated', text: 'Additional recipient added' }])
        })

        it('adds the recipient to `additionalRecipients` and pushes its hash ID into `selectedRecipients`', async () => {
          await ProcessAddRecipientService(sessionId, yarStub)

          const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

          expect(flashType).toEqual('notification')
          expect(bannerMessage).toEqual({ titleText: 'Updated', text: 'Additional recipient added' })
          expect(session.additionalRecipients).toEqual([
            {
              contact: {
                name: 'Fake Other',
                address1: '2 Fake Farm',
                address2: '2 Fake street',
                address3: 'Fake Village',
                address4: 'Fake City',
                postcode: 'SW2A 2AA'
              },
              contact_hash_id: '78de9d5db4c52b66818004e2b0dc4392',
              contact_type: 'single use',
              email: null,
              licence_refs: [licenceRef],
              message_type: 'Letter'
            },
            {
              contact: {
                address1: 'ENVIRONMENT AGENCY',
                address2: 'HORIZON HOUSE DEANERY ROAD',
                address3: 'VILLAGE GREEN',
                address4: 'BRISTOL',
                country: undefined,
                name: 'Fake Person',
                postcode: 'BS1 5AH'
              },
              contact_hash_id: contactHashId,
              contact_type: 'single use',
              email: null,
              licence_ref: session.licenceRef,
              licence_refs: [session.licenceRef],
              message_type: 'Letter'
            }
          ])
          expect(session.selectedRecipients).toEqual(['78de9d5db4c52b66818004e2b0dc4392', contactHashId])
          expect(session.addressJourney.redirectUrl).toEqual(`/system/notices/setup/${sessionId}/add-recipient`)
        })
      })
    })

    describe('and it is an International address', () => {
      beforeEach(() => {
        sessionData.addressJourney = {
          activeNavBar: 'notices',
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
        beforeEach(() => {
          session = SessionModelStub({
            ...sessionData,
            id: sessionId
          })

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

          yarStub = YarStub()
          yarStub.flash.mockReturnValue([{ title: 'Updated', text: 'Additional recipient added' }])
        })

        it('adds a `additionalRecipients` property to the session containing the recipient and pushes its hash ID into `selectedRecipients`', async () => {
          await ProcessAddRecipientService(sessionId, yarStub)

          const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

          expect(flashType).toEqual('notification')
          expect(bannerMessage).toEqual({ titleText: 'Updated', text: 'Additional recipient added' })
          expect(session.additionalRecipients).toEqual([
            {
              contact: {
                address1: '1 Faux Ferme',
                address2: undefined,
                address3: undefined,
                address4: 'Faux Ville',
                country: 'France',
                name: 'Fake Person',
                postcode: undefined
              },
              contact_hash_id: contactHashId,
              contact_type: 'single use',
              email: null,
              licence_ref: sessionData.licenceRef,
              licence_refs: [sessionData.licenceRef],
              message_type: 'Letter'
            }
          ])
          expect(session.selectedRecipients).toEqual([contactHashId])
          expect(session.addressJourney.redirectUrl).toEqual(`/system/notices/setup/${sessionId}/add-recipient`)
        })
      })
    })
  })
})
