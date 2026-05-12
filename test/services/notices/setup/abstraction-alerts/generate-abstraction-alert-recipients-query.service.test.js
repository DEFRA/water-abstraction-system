'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CRMContactsSeeder = require('../../../../support/seeders/crm-contacts.seeder.js')
const EmptyLicence = require('../../../../support/seeders/empty-licence.seeder.js')
const RecipientScenariosSeeder = require('../../../../support/seeders/recipient-scenarios.seeder.js')
const RecipientsSeeder = require('../../../../support/seeders/recipients.seeder.js')
const { compareStrings } = require('../../../../../app/lib/general.lib.js')
const { db } = require('../../../../../db/db.js')

// Thing under test
const GenerateAbstractionAlertRecipientsQueryService = require('../../../../../app/services/notices/setup/abstraction-alerts/generate-abstraction-alert-recipients-query.service.js')

describe('Notices - Setup - Abstraction Alerts - Generate Abstraction Alert Recipients Query Service', () => {
  let scenarios

  before(async () => {
    scenarios = []

    let additionalContactRecipient
    let licenceHolder
    let licenceHolderRecipient
    let primaryUser
    let primaryUserRecipient

    // 1) Licence holder only
    licenceHolder = await _licenceHolder()
    licenceHolderRecipient = await _licenceHolderRecipient(licenceHolder.licence, licenceHolder.licenceHolder)
    scenarios.push([licenceHolderRecipient])

    // 2) Licence holder, and an additional contact
    licenceHolder = await _licenceHolder()
    licenceHolderRecipient = await _licenceHolderRecipient(licenceHolder.licence, licenceHolder.licenceHolder)
    additionalContactRecipient = await _additionalContactRecipient(licenceHolder.licence)
    scenarios.push([licenceHolderRecipient, additionalContactRecipient])

    // 3) Primary user only. All licences have a licence holder record, but when 'registered' the query will only
    // return the primary user recipient.
    licenceHolder = await _licenceHolder()
    licenceHolderRecipient = await _licenceHolderRecipient(licenceHolder.licence, licenceHolder.licenceHolder)
    primaryUser = await _primaryUser(licenceHolder.licence)
    primaryUserRecipient = await _primaryUserRecipient(licenceHolder.licence, primaryUser.primaryUser)
    scenarios.push([licenceHolderRecipient, primaryUserRecipient])

    // 4) Primary user with an additional contact. Similar to scenario 3 - when registered, we expect the primary user
    // and additional contact but not the licence holder.
    licenceHolder = await _licenceHolder()
    licenceHolderRecipient = await _licenceHolderRecipient(licenceHolder.licence, licenceHolder.licenceHolder)
    primaryUser = await _primaryUser(licenceHolder.licence)
    primaryUserRecipient = await _primaryUserRecipient(licenceHolder.licence, primaryUser.primaryUser)
    additionalContactRecipient = await _additionalContactRecipient(licenceHolder.licence)
    scenarios.push([licenceHolderRecipient, primaryUserRecipient, additionalContactRecipient])

    // 5) Additional contact multiple licence refs
    licenceHolder = await _licenceHolder()
    licenceHolderRecipient = await _licenceHolderRecipient(licenceHolder.licence, licenceHolder.licenceHolder)
    additionalContactRecipient = await _additionalContactRecipient(licenceHolder.licence)

    // Second licence
    const licenceHolderTwo = await _licenceHolder()
    const licenceHolderRecipientTwo = await _licenceHolderRecipient(
      licenceHolderTwo.licence,
      licenceHolderTwo.licenceHolder
    )
    const additionalContactRecipientTwo = await _additionalContactRecipient(licenceHolderTwo.licence)
    scenarios.push([
      licenceHolderRecipient,
      licenceHolderRecipientTwo,
      additionalContactRecipient,
      additionalContactRecipientTwo
    ])

    // 6) Licence holder with an additional contact where abstractionAlerts = false. The additional contact should NOT
    // appear in results.
    licenceHolder = await _licenceHolder()
    licenceHolderRecipient = await _licenceHolderRecipient(licenceHolder.licence, licenceHolder.licenceHolder)
    const additionalContactNoAlerts = await _additionalContactRecipient(licenceHolder.licence, false)
    scenarios.push([licenceHolderRecipient, additionalContactNoAlerts])
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
    describe('and only the licence holder is present for an unregistered licence (Scenario 1)', () => {
      it('returns the expected recipients', async () => {
        const licenceRefs = [scenarios[0][0].licenceRef]
        const { bindings, query } = GenerateAbstractionAlertRecipientsQueryService.go(licenceRefs)
        const { rows } = await db.raw(query, bindings)

        const expectedResults = RecipientScenariosSeeder.transformToSendingResults(scenarios[0])

        expect(rows).to.equal(expectedResults)
      })
    })

    describe('and both the "additional contact" and the "licence holder" are present for an unregistered licence (Scenario 2)', () => {
      it('returns the expected recipients', async () => {
        const licenceRefs = [scenarios[1][0].licenceRef]
        const { bindings, query } = GenerateAbstractionAlertRecipientsQueryService.go(licenceRefs)
        const { rows } = await db.raw(query, bindings)

        const expectedResults = RecipientScenariosSeeder.transformToSendingResults(scenarios[1])

        expect(rows).to.equal(expectedResults)
      })
    })

    describe('and only the "primary user" is present for a registered licence (Scenario 3)', () => {
      it('returns the expected recipients', async () => {
        const licenceRefs = [scenarios[2][1].licenceRef]
        const { bindings, query } = GenerateAbstractionAlertRecipientsQueryService.go(licenceRefs)
        const { rows } = await db.raw(query, bindings)

        const [, expectedResult] = RecipientScenariosSeeder.transformToSendingResults(scenarios[2])

        expect(rows).to.equal([expectedResult])
      })
    })

    describe('and both the "primary user" and "additional contact" are present for a registered licence, but not the licence holder (Scenario 4)', () => {
      it('returns the expected recipients', async () => {
        const licenceRefs = [scenarios[3][1].licenceRef]
        const { bindings, query } = GenerateAbstractionAlertRecipientsQueryService.go(licenceRefs)
        const { rows } = await db.raw(query, bindings)

        // The licence holder is not returned, because the licence is registered, so we expect the primarty user and the additional contact
        const [, ...expectedResult] = RecipientScenariosSeeder.transformToSendingResults(scenarios[3])

        expect(rows).to.equal(expectedResult)
      })
    })

    describe('and the same "additional contact" is associated with multiple licence documents (Scenario 5)', () => {
      it('returns the expected recipients', async () => {
        const licenceRefs = [scenarios[4][0].licenceRef, scenarios[4][1].licenceRef].sort(compareStrings)

        const { bindings, query } = GenerateAbstractionAlertRecipientsQueryService.go(licenceRefs)
        const { rows } = await db.raw(query, bindings)

        // Only one licence holder is returned, and one additional contact (we need to manually merge the licence refs)
        const expectedResult = RecipientScenariosSeeder.transformToSendingResults([scenarios[4][0], scenarios[4][2]])

        expect(rows).to.equal([
          {
            ...expectedResult[0],
            licence_refs: licenceRefs
          },
          {
            ...expectedResult[1],
            licence_refs: licenceRefs
          }
        ])
      })
    })

    describe('and an additional contact is present but abstractionAlerts is false (Scenario 6)', () => {
      it('returns only the "licence holder" and not the additional contact', async () => {
        const licenceRefs = [scenarios[5][0].licenceRef]
        const { bindings, query } = GenerateAbstractionAlertRecipientsQueryService.go(licenceRefs)
        const { rows } = await db.raw(query, bindings)

        // Only the licence holder is returned, not the additional contact
        const [expectedResults] = RecipientScenariosSeeder.transformToSendingResults(scenarios[5])

        expect(rows).to.equal([expectedResults])
      })
    })
  })
})

async function _additionalContactRecipient(licence, abstractionAlerts = true) {
  const additionalContact = await CRMContactsSeeder.additionalContact(licence, null, abstractionAlerts)

  const additionalContactRecipient = await RecipientsSeeder.additionalContact(licence, additionalContact)

  additionalContactRecipient.licenceRefs = [licence.licence.licenceRef]

  return additionalContactRecipient
}

async function _licenceHolder() {
  const licence = await EmptyLicence.seed()
  const licenceHolder = await CRMContactsSeeder.licenceHolder(licence, 'Holderwithadditionalcontact')

  return {
    licence,
    licenceHolder
  }
}

async function _licenceHolderRecipient(licence, licenceHolder) {
  const licenceHolderRecipient = await RecipientsSeeder.licenceHolder(licence, licenceHolder)

  licenceHolderRecipient.licenceRefs = [licence.licence.licenceRef]

  return licenceHolderRecipient
}

async function _primaryUser(licence) {
  const primaryUser = await CRMContactsSeeder.primaryUser(licence, 'primaryuser@pura.com')

  const primaryUserRecipient = await RecipientsSeeder.primaryUser(licence, primaryUser)

  primaryUserRecipient.licenceRefs = [licence.licence.licenceRef]

  return { primaryUser }
}

async function _primaryUserRecipient(licence, primaryUser) {
  const primaryUserRecipient = await RecipientsSeeder.primaryUser(licence, primaryUser)

  primaryUserRecipient.licenceRefs = [licence.licence.licenceRef]

  return primaryUserRecipient
}
