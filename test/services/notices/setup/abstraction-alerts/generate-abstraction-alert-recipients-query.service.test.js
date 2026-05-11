'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceDocumentHeaderSeeder = require('../../../../support/seeders/licence-document-header.seeder.js')
const RecipientScenariosSeeder = require('../../../../support/seeders/recipient-scenarios.seeder.js')
const { compareStrings } = require('../../../../../app/lib/general.lib.js')
const { db } = require('../../../../../db/db.js')

// Thing under test
const GenerateAbstractionAlertRecipientsQueryService = require('../../../../../app/services/notices/setup/abstraction-alerts/generate-abstraction-alert-recipients-query.service.js')

describe('Notices - Setup - Abstraction Alerts - Generate Abstraction Alert Recipients Query Service', () => {
  let scenarios
  let seedData

  before(async () => {
    seedData = await LicenceDocumentHeaderSeeder.seed()

    scenarios = []

    let scenario

    // 1) Licence holder only
    scenario = await RecipientScenariosSeeder.licenceHolderOnly([], null, true)
    scenarios.push(scenario)

    // 2) Licence holder, and an additional contact
    scenario = await RecipientScenariosSeeder.licenceHolderWithAdditionalContact()
    scenarios.push(scenario)
    await LicenceDocumentHeaderSeeder.additionalContactEndDatePassed(scenario[0].licenceRef)

    // 3) Primary user only. All licences have a licence holder record, but when 'registered' the query will only
    // return the primary user recipient.
    scenario = await RecipientScenariosSeeder.primaryUserOnly([], null, true)
    scenarios.push(scenario)

    // 4) Primary user with an additional contact. Similar to scenario 3 - when registered, we expect the primary user
    // and additional contact but not the licence holder.
    scenario = await RecipientScenariosSeeder.primaryUserWithAdditionalContact()
    scenarios.push(scenario)
  })

  after(async () => {
    await RecipientScenariosSeeder.clean(scenarios)
  })

  // NOTE: Because the query is very large we don't assert the full `query` string here
  describe('when called', () => {
    it('returns the expected query and bindings', () => {
      const licenceRefs = ['01/123']
      const { bindings, query } = GenerateAbstractionAlertRecipientsQueryService.go(licenceRefs)

      expect(bindings).to.equal([licenceRefs, licenceRefs, licenceRefs])
      expect(query).to.startWith(`
  WITH additional_contacts AS (`)
    })
  })

  describe('when executed', () => {
    it('(Scenario 1) returns the "licence holder" when only the licence holder is present for an unregistered licence', async () => {
      const licenceRefs = [scenarios[0][0].licenceRef]
      const { bindings, query } = GenerateAbstractionAlertRecipientsQueryService.go(licenceRefs)
      const { rows } = await db.raw(query, bindings)

      const expectedResults = RecipientScenariosSeeder.transformToSendingResults(scenarios[0])

      expect(rows).to.equal(expectedResults)
    })

    it('(Scenario 2) returns both the "additional contact" and the "licence holder" when both are present for an unregistered licence', async () => {
      const licenceRefs = [scenarios[1][0].licenceRef]
      const { bindings, query } = GenerateAbstractionAlertRecipientsQueryService.go(licenceRefs)
      const { rows } = await db.raw(query, bindings)

      const expectedResults = RecipientScenariosSeeder.transformToSendingResults(scenarios[1])

      expect(rows).to.equal(expectedResults)
    })

    it('(Scenario 3) returns only the "primary user" when the licence is registered', async () => {
      const licenceRefs = [scenarios[2][1].licenceRef]
      const { bindings, query } = GenerateAbstractionAlertRecipientsQueryService.go(licenceRefs)
      const { rows } = await db.raw(query, bindings)

      const [, expectedResult] = RecipientScenariosSeeder.transformToSendingResults(scenarios[2])

      expect(rows).to.equal([expectedResult])
    })

    it('(Scenario 4) returns both the "additional contact" and the "primary user" when the licence is registered, but not the licence holder', async () => {
      const licenceRefs = [scenarios[3][1].licenceRef]
      const { bindings, query } = GenerateAbstractionAlertRecipientsQueryService.go(licenceRefs)
      const { rows } = await db.raw(query, bindings)

      const [, ...expectedResult] = RecipientScenariosSeeder.transformToSendingResults(scenarios[3])

      expect(rows).to.equal(expectedResult)
    })

    it('(Scenario 5) returns the "additional contact" with multiple licence refs combined when the same recipient is associated with multiple licence documents', async () => {
      const licenceRefs = [
        seedData.multipleAdditionalContactDifferentLicenceRefs.licenceDocument.licenceRef,
        seedData.multipleAdditionalContactDifferentLicenceRefs.licenceDocumentTwo.licenceRef
      ]
      const { bindings, query } = GenerateAbstractionAlertRecipientsQueryService.go(licenceRefs)
      const { rows } = await db.raw(query, bindings)

      const combinedLicenceRefs = [...licenceRefs].sort((referenceString, compareString) => {
        return compareStrings(referenceString, compareString)
      })

      expect(rows).to.equal([
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
