'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientScenariosSeeder = require('../../../../support/seeders/recipient-scenarios.seeder.js')
const LicenceDocumentHeaderSeeder = require('../../../../support/seeders/licence-document-header.seeder.js')
const { compareStrings } = require('../../../../../app/lib/general.lib.js')

// Thing under test
const FetchAbstractionAlertRecipientsService = require('../../../../../app/services/notices/setup/abstraction-alerts/fetch-abstraction-alert-recipients.service.js')

describe('Notices - Setup - Abstraction Alerts - Fetch Abstraction Alert Recipients service', () => {
  let scenarios
  let seedData
  let session

  before(async () => {
    seedData = await LicenceDocumentHeaderSeeder.seed()

    scenarios = []

    let scenario

    // 1) Licence holder only
    scenario = await RecipientScenariosSeeder.licenceHolderOnly([], null, true)
    scenarios.push(scenario)

    // 2) Licence holder, and an additional contact
    scenario = await RecipientScenariosSeeder.licenceHolderOnly([], null, true)
    scenarios.push(scenario)
    await LicenceDocumentHeaderSeeder.additionalContact(scenario[0].licenceRef)
    await LicenceDocumentHeaderSeeder.additionalContactEndDatePassed(scenario[0].licenceRef)
  })

  after(async () => {
    await RecipientScenariosSeeder.clean(scenarios)
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
            contact_type: 'additional contact',
            email: 'Ron.Burgundy@news.com',
            licence_refs: [seedData.additionalContact.licenceRef],
            message_type: 'Email'
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
            contact_type: 'additional contact',
            email: 'Brick.Tamland@news.com',
            licence_refs: [seedData.multipleAdditionalContact.licenceRef],
            message_type: 'Email'
          },
          {
            contact: null,
            contact_hash_id: 'c661b771974504933d79ca64249570d0',
            contact_type: 'additional contact',
            email: 'Ron.Burgundy@news.com',
            licence_refs: [seedData.multipleAdditionalContact.licenceRef],
            message_type: 'Email'
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
            contact_type: 'additional contact',
            email: 'Ron.Burgundy@news.com',
            licence_refs: [seedData.multipleAdditionalContactWithAndWithoutAlerts.licenceRef],
            message_type: 'Email'
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
            contact: null,
            contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
            contact_type: 'primary user',
            email: 'primary.user@important.com',
            licence_refs: [seedData.primaryUser.licenceRef],
            message_type: 'Email'
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
              contact: null,
              contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
              contact_type: 'primary user',
              email: 'primary.user@important.com',
              licence_refs: [seedData.primaryUserWithAdditionalContact.licenceRef],
              message_type: 'Email'
            },
            {
              contact: null,
              contact_hash_id: 'c661b771974504933d79ca64249570d0',
              contact_type: 'additional contact',
              email: 'Ron.Burgundy@news.com',
              licence_refs: [seedData.primaryUserWithAdditionalContact.licenceRef],
              message_type: 'Email'
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
          licenceRefs: [scenarios[0][0].licenceRef]
        }
      })

      it('returns the "licence holder" ', async () => {
        const result = await FetchAbstractionAlertRecipientsService.go(session)

        const expectedResults = _transformToResult(scenarios[0])

        expect(result).to.equal(expectedResults)
      })
    })

    describe('and there is an "additional contact"', () => {
      beforeEach(() => {
        session = {
          licenceRefs: [scenarios[1][0].licenceRef]
        }
      })

      it('returns both "additional contact" and the "primary user"', async () => {
        const result = await FetchAbstractionAlertRecipientsService.go(session)

        const expectedResults = _transformToResult(scenarios[1])

        expect(result).to.equal([
          ...expectedResults,
          {
            contact: null,
            contact_hash_id: 'c661b771974504933d79ca64249570d0',
            contact_type: 'additional contact',
            email: 'Ron.Burgundy@news.com',
            licence_refs: [scenarios[1][0].licenceRef],
            message_type: 'Email'
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
      ].sort((referenceString, compareString) => {
        return compareStrings(referenceString, compareString)
      })

      expect(result).to.equal([
        {
          contact: null,
          contact_hash_id: 'c661b771974504933d79ca64249570d0',
          contact_type: 'additional contact',
          email: 'Ron.Burgundy@news.com',
          licence_refs: combinedLicenceRefs,
          message_type: 'Email'
        }
      ])
    })
  })
})

function _transformToResult(scenario) {
  const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenario)

  for (const sendingResult of sendingResults) {
    delete sendingResult.due_date_status
    delete sendingResult.return_log_ids
    delete sendingResult.latest_due_date
  }

  return sendingResults
}
