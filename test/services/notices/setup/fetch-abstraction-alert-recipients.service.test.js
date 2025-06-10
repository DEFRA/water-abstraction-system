'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CompanyContactHelper = require('../../../support/helpers/company-contact.helper.js')
const ContactHelper = require('../../../support/helpers/contact.helper.js')
const LicenceDocumentHeaderSeeder = require('../../../support/seeders/licence-document-header.seeder.js')
const LicenceDocumentHelper = require('../../../support/helpers/licence-document.helper.js')
const LicenceDocumentRoleHelper = require('../../../support/helpers/licence-document-role.helper.js')
const LicenceRoleHelper = require('../../../support/helpers/licence-role.helper.js')

// Thing under test
const FetchAbstractionAlertRecipientsService = require('../../../../app/services/notices/setup/fetch-abstraction-alert-recipients.service.js')

describe('Notices - Setup - Fetch abstraction alert recipients service', () => {
  let recipients
  let session

  beforeEach(async () => {
    recipients = await LicenceDocumentHeaderSeeder.seed(false)
  })

  describe('when there is a "primary user"', () => {
    beforeEach(() => {
      session = {
        licenceRefs: [recipients.primaryUser.licenceRef]
      }
    })

    it('correctly returns the "primary user" instead of the "Licence holder"', async () => {
      const result = await FetchAbstractionAlertRecipientsService.go(session)

      expect(result).to.equal([
        {
          licence_refs: recipients.primaryUser.licenceRef,
          contact: null,
          contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
          contact_type: 'Primary user',
          email: 'primary.user@important.com'
        }
      ])
    })

    describe('and there is an "additional contact"', () => {
      beforeEach(async () => {
        session = {
          licenceRefs: [recipients.primaryUser.licenceRef]
        }

        const licenceDocument = await LicenceDocumentHelper.add({
          licenceRef: recipients.primaryUser.licenceRef
        })

        await _additionalContact(licenceDocument, {
          firstName: 'Ron',
          lastName: 'Burgundy',
          email: 'Ron.Burgundy@news.com'
        })
      })

      it('correctly returns the "additional contact" and the "primary user"', async () => {
        const result = await FetchAbstractionAlertRecipientsService.go(session)

        expect(result).to.equal([
          {
            contact: null,
            contact_hash_id: 'c661b771974504933d79ca64249570d0',
            contact_type: 'Additional contact',
            email: 'Ron.Burgundy@news.com',
            licence_refs: recipients.primaryUser.licenceRef
          },
          {
            licence_refs: recipients.primaryUser.licenceRef,
            contact: null,
            contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
            contact_type: 'Primary user',
            email: 'primary.user@important.com'
          }
        ])
      })
    })

    describe('and there are multiple "additional contact"', () => {
      beforeEach(async () => {
        session = {
          licenceRefs: [recipients.primaryUser.licenceRef]
        }

        const licenceDocument = await LicenceDocumentHelper.add({
          licenceRef: recipients.primaryUser.licenceRef
        })

        await _additionalContact(licenceDocument, {
          firstName: 'Ron',
          lastName: 'Burgundy',
          email: 'Ron.Burgundy@news.com'
        })

        await _additionalContact(licenceDocument, {
          firstName: 'Brick',
          lastName: 'Tamland',
          email: 'Brick.Tamland@news.com'
        })
      })

      it('correctly returns all the "additional contact" and the "primary user"', async () => {
        const result = await FetchAbstractionAlertRecipientsService.go(session)

        expect(result).to.equal([
          {
            contact: null,
            contact_hash_id: '70d3d94dd27d8b65e96392a85147a4cc',
            contact_type: 'Additional contact',
            email: 'Brick.Tamland@news.com',
            licence_refs: recipients.primaryUser.licenceRef
          },
          {
            contact: null,
            contact_hash_id: 'c661b771974504933d79ca64249570d0',
            contact_type: 'Additional contact',
            email: 'Ron.Burgundy@news.com',
            licence_refs: recipients.primaryUser.licenceRef
          },
          {
            licence_refs: recipients.primaryUser.licenceRef,
            contact: null,
            contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
            contact_type: 'Primary user',
            email: 'primary.user@important.com'
          }
        ])
      })
    })
  })

  describe('when there is no "primary user" ', () => {
    beforeEach(() => {
      session = {
        licenceRefs: [recipients.licenceHolder.licenceRef]
      }
    })

    it('correctly returns the licence holder', async () => {
      const result = await FetchAbstractionAlertRecipientsService.go(session)

      expect(result).to.equal([
        {
          licence_refs: recipients.licenceHolder.licenceRef,
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
          contact_hash_id: '22f6457b6be9fd63d8a9a8dd2ed61214',
          contact_type: 'Licence holder',
          email: null
        }
      ])
    })

    describe('and there is an "additional contact"', () => {
      beforeEach(async () => {
        session = {
          licenceRefs: [recipients.licenceHolder.licenceRef]
        }

        const licenceDocument = await LicenceDocumentHelper.add({
          licenceRef: recipients.licenceHolder.licenceRef
        })

        await _additionalContact(licenceDocument, {
          firstName: 'Brian',
          lastName: 'Fantana',
          email: 'Brian.Fantana@news.com'
        })
      })

      it('correctly returns the "additional contact" and the "licence holder"', async () => {
        const result = await FetchAbstractionAlertRecipientsService.go(session)

        expect(result).to.equal([
          {
            contact: null,
            contact_hash_id: '0c21cf650a32c0144f7da3f9c6441cad',
            contact_type: 'Additional contact',
            email: 'Brian.Fantana@news.com',
            licence_refs: recipients.licenceHolder.licenceRef
          },
          {
            licence_refs: recipients.licenceHolder.licenceRef,
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
            contact_hash_id: '22f6457b6be9fd63d8a9a8dd2ed61214',
            contact_type: 'Licence holder',
            email: null
          }
        ])
      })
    })
  })

  describe('and there are recipients related to multiple licence refs', () => {
    beforeEach(async () => {
      session = {
        licenceRefs: [recipients.primaryUser.licenceRef, recipients.licenceHolder.licenceRef]
      }

      const licenceDocument = await LicenceDocumentHelper.add({
        licenceRef: recipients.primaryUser.licenceRef
      })

      await _additionalContact(licenceDocument, {
        firstName: 'Ron',
        lastName: 'Burgundy',
        email: 'Ron.Burgundy@news.com'
      })

      const licenceDocument2 = await LicenceDocumentHelper.add({
        licenceRef: recipients.licenceHolder.licenceRef
      })

      await _additionalContact(licenceDocument2, {
        firstName: 'Ron',
        lastName: 'Burgundy',
        email: 'Ron.Burgundy@news.com'
      })
    })

    it('correctly returns the "additional contact" with multiple licence refs', async () => {
      const result = await FetchAbstractionAlertRecipientsService.go(session)

      expect(result[0]).to.equal({
        contact: null,
        contact_hash_id: 'c661b771974504933d79ca64249570d0',
        contact_type: 'Additional contact',
        email: 'Ron.Burgundy@news.com',
        licence_refs: [recipients.licenceHolder.licenceRef, recipients.primaryUser.licenceRef].sort().join(',')
      })
    })
  })
})

async function _additionalContact(licenceDocument, contact) {
  const licenceDocumentRole = await LicenceDocumentRoleHelper.add({
    licenceDocumentId: licenceDocument.id
  })

  const licenceRole = await LicenceRoleHelper.select('additionalContact')

  const companyContact = await CompanyContactHelper.add({
    companyId: licenceDocumentRole.companyId,
    licenceRoleId: licenceRole.id
  })

  await ContactHelper.add({
    id: companyContact.contactId,
    ...contact
  })
}
