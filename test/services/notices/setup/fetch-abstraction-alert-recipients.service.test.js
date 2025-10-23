'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceDocumentHeaderSeeder = require('../../../support/seeders/licence-document-header.seeder.js')

// Thing under test
const FetchAbstractionAlertRecipientsService = require('../../../../app/services/notices/setup/fetch-abstraction-alert-recipients.service.js')

describe('Notices - Setup - Fetch abstraction alert recipients service', () => {
  let seedData
  let session

  before(async () => {
    seedData = await LicenceDocumentHeaderSeeder.seed()
  })

  describe('when there is an "additional contact"', () => {
    describe('and there is only one', () => {
      beforeEach(() => {
        session = {
          licenceRefs: [seedData.additionalContact.licenceRef]
        }
      })

      it('correctly returns the "additional contact"', async () => {
        const result = await FetchAbstractionAlertRecipientsService.go(session)

        expect(result).to.equal([
          {
            contact: null,
            contact_hash_id: 'c661b771974504933d79ca64249570d0',
            contact_type: 'Additional contact',
            email: 'Ron.Burgundy@news.com',
            licence_refs: seedData.additionalContact.licenceRef
          }
        ])
      })
    })

    describe('and there are multiple "additional contact"', () => {
      beforeEach(() => {
        session = {
          licenceRefs: [seedData.multipleAdditionalContact.licenceRef]
        }
      })

      it('correctly returns all the "additional contact"', async () => {
        const result = await FetchAbstractionAlertRecipientsService.go(session)

        expect(result).to.equal([
          {
            contact: null,
            contact_hash_id: '70d3d94dd27d8b65e96392a85147a4cc',
            contact_type: 'Additional contact',
            email: 'Brick.Tamland@news.com',
            licence_refs: seedData.multipleAdditionalContact.licenceRef
          },
          {
            contact: null,
            contact_hash_id: 'c661b771974504933d79ca64249570d0',
            contact_type: 'Additional contact',
            email: 'Ron.Burgundy@news.com',
            licence_refs: seedData.multipleAdditionalContact.licenceRef
          }
        ])
      })
    })

    describe('and there are multiple "additional contact" but some of them are not signed up for abstraction alerts', () => {
      beforeEach(() => {
        session = {
          licenceRefs: [seedData.multipleAdditionalContactWithAndWithoutAlerts.licenceRef]
        }
      })

      it('correctly returns all the "additional contact" signed up for abstraction alerts', async () => {
        const result = await FetchAbstractionAlertRecipientsService.go(session)

        expect(result).to.equal([
          {
            contact: null,
            contact_hash_id: 'c661b771974504933d79ca64249570d0',
            contact_type: 'Additional contact',
            email: 'Ron.Burgundy@news.com',
            licence_refs: seedData.multipleAdditionalContactWithAndWithoutAlerts.licenceRef
          }
        ])
      })
    })
  })

  describe('when the licence is registered ', () => {
    describe('and there is a "primary user"', () => {
      beforeEach(() => {
        session = {
          licenceRefs: [seedData.primaryUser.licenceRef]
        }
      })

      it('returns the "primary user"', async () => {
        const result = await FetchAbstractionAlertRecipientsService.go(session)

        expect(result).to.equal([
          {
            licence_refs: seedData.primaryUser.licenceRef,
            contact: null,
            contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
            contact_type: 'Primary user',
            email: 'primary.user@important.com'
          }
        ])
      })

      describe('and there is an "additional contact"', () => {
        beforeEach(() => {
          session = {
            licenceRefs: [seedData.primaryUserWithAdditionalContact.licenceRef]
          }
        })

        it('returns both "additional contact" and the "primary user" (with the same licence ref)', async () => {
          const result = await FetchAbstractionAlertRecipientsService.go(session)

          expect(result).to.equal([
            {
              licence_refs: seedData.primaryUserWithAdditionalContact.licenceRef,
              contact: null,
              contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
              contact_type: 'Primary user',
              email: 'primary.user@important.com'
            },
            {
              contact: null,
              contact_hash_id: 'c661b771974504933d79ca64249570d0',
              contact_type: 'Additional contact',
              email: 'Ron.Burgundy@news.com',
              licence_refs: seedData.primaryUserWithAdditionalContact.licenceRef
            }
          ])
        })
      })
    })
  })

  describe('when the licence is unregistered', () => {
    describe('and there is a "licence holder"', () => {
      beforeEach(async () => {
        session = {
          licenceRefs: [seedData.licenceHolder.licenceRef]
        }
      })

      it('returns the "licence holder" ', async () => {
        const result = await FetchAbstractionAlertRecipientsService.go(session)

        expect(result).to.equal([
          {
            contact: {
              addressLine1: '4',
              addressLine2: 'Privet Drive',
              addressLine3: null,
              addressLine4: null,
              country: null,
              county: 'Surrey',
              forename: 'Harry',
              initials: 'J',
              name: 'Licence holder',
              postcode: 'WD25 7LR',
              role: 'Licence holder',
              salutation: null,
              town: 'Little Whinging',
              type: 'Person'
            },
            contact_hash_id: '0cad692217f572faede404363b2625c9',
            contact_type: 'Licence holder',
            email: null,
            licence_refs: seedData.licenceHolder.licenceRef
          }
        ])
      })
    })

    describe('and there is an "additional contact"', () => {
      beforeEach(() => {
        session = {
          licenceRefs: [seedData.licenceHolderWithAdditionalContact.licenceRef]
        }
      })

      it('returns both "additional contact" and the "primary user"', async () => {
        const result = await FetchAbstractionAlertRecipientsService.go(session)

        expect(result).to.equal([
          {
            contact: {
              addressLine1: '4',
              addressLine2: 'Privet Drive',
              addressLine3: null,
              addressLine4: null,
              country: null,
              county: 'Surrey',
              forename: 'Harry',
              initials: 'J',
              name: 'Licence holder',
              postcode: 'WD25 7LR',
              role: 'Licence holder',
              salutation: null,
              town: 'Little Whinging',
              type: 'Person'
            },
            contact_hash_id: '0cad692217f572faede404363b2625c9',
            contact_type: 'Licence holder',
            email: null,
            licence_refs: seedData.licenceHolderWithAdditionalContact.licenceRef
          },
          {
            contact: null,
            contact_hash_id: 'c661b771974504933d79ca64249570d0',
            contact_type: 'Additional contact',
            email: 'Ron.Burgundy@news.com',
            licence_refs: seedData.licenceHolderWithAdditionalContact.licenceRef
          }
        ])
      })
    })
  })

  describe('when the same recipient is associated with multiple licence documents', () => {
    beforeEach(async () => {
      session = {
        licenceRefs: [
          seedData.multipleAdditionalContactDifferentLicenceRefs.licenceDocument.licenceRef,
          seedData.multipleAdditionalContactDifferentLicenceRefs.licenceDocumentTwo.licenceRef
        ]
      }
    })

    it('returns the "additional contact" with multiple licence refs (as one recipient with the licence refs combined)', async () => {
      const result = await FetchAbstractionAlertRecipientsService.go(session)

      const combinedLicenceRefs = [
        seedData.multipleAdditionalContactDifferentLicenceRefs.licenceDocument.licenceRef,
        seedData.multipleAdditionalContactDifferentLicenceRefs.licenceDocumentTwo.licenceRef
      ].sort()

      expect(result).to.equal([
        {
          contact: null,
          contact_hash_id: 'c661b771974504933d79ca64249570d0',
          contact_type: 'Additional contact',
          email: 'Ron.Burgundy@news.com',
          licence_refs: combinedLicenceRefs.join(',')
        }
      ])
    })
  })
})
