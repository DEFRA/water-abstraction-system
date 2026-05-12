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

    // 7) Different licence holders and different additional contacts for different licences. Unlike scenario 5 where
    // the same contact spans multiple licences and is combined into one row, here each licence has unique contacts so
    // all four recipients are returned separately.
    const firstLicenceHolder = await _licenceHolder('HolderWithUniqueContactA')
    const firstLicenceHolderRecipient = await _licenceHolderRecipient(
      firstLicenceHolder.licence,
      firstLicenceHolder.licenceHolder
    )
    const firstAdditionalContact = await _additionalContactRecipient(firstLicenceHolder.licence)

    const secondLicenceHolder = await _licenceHolder('HolderWithUniqueContactB')
    const secondLicenceHolderRecipient = await _licenceHolderRecipient(
      secondLicenceHolder.licence,
      secondLicenceHolder.licenceHolder
    )
    const secondAdditionalContact = await _additionalContactRecipient(secondLicenceHolder.licence, true, {
      firstName: 'Champ',
      lastName: 'Kind',
      email: 'champ.kind@news.com'
    })

    scenarios.push([
      firstLicenceHolderRecipient,
      secondLicenceHolderRecipient,
      firstAdditionalContact,
      secondAdditionalContact
    ])

    // 8) Two licences with different licence holders and additional contacts, but one additional contact has
    // abstractionAlerts = false and should NOT appear in results.
    const licenceHolderWithAlert = await _licenceHolder('HolderWithMixedAlertsA')
    const licenceHolderRecipientWithAlert = await _licenceHolderRecipient(
      licenceHolderWithAlert.licence,
      licenceHolderWithAlert.licenceHolder
    )
    const additionalContactWithAlert = await _additionalContactRecipient(licenceHolderWithAlert.licence)

    const licenceHolderWithoutAlert = await _licenceHolder('HolderWithMixedAlertsB')
    const licenceHolderRecipientWithoutAlert = await _licenceHolderRecipient(
      licenceHolderWithoutAlert.licence,
      licenceHolderWithoutAlert.licenceHolder
    )
    const additionalContactWithoutAlert = await _additionalContactRecipient(licenceHolderWithoutAlert.licence, false, {
      firstName: 'Champ',
      lastName: 'Kind',
      email: 'champ.kind@news.com'
    })

    scenarios.push([
      licenceHolderRecipientWithAlert,
      licenceHolderRecipientWithoutAlert,
      additionalContactWithAlert,
      additionalContactWithoutAlert
    ])

    // 9) Licence holder with an additional contact where the end date has passed. The expired contact should NOT
    // appear in results.
    licenceHolder = await _licenceHolder()
    licenceHolderRecipient = await _licenceHolderRecipient(licenceHolder.licence, licenceHolder.licenceHolder)
    const expiredAdditionalContact = await _additionalContactRecipient(
      licenceHolder.licence,
      true,
      null,
      new Date('2023-01-01')
    )
    scenarios.push([licenceHolderRecipient, expiredAdditionalContact])
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

        const expectedResults = RecipientScenariosSeeder.transformToSendingResults([scenarios[0][0]])

        expect(rows).to.equal(expectedResults)
      })
    })

    describe('and both the "additional contact" and the "licence holder" are present for an unregistered licence (Scenario 2)', () => {
      it('returns the expected recipients', async () => {
        const licenceRefs = [scenarios[1][0].licenceRef]
        const { bindings, query } = GenerateAbstractionAlertRecipientsQueryService.go(licenceRefs)
        const { rows } = await db.raw(query, bindings)

        const expectedResults = RecipientScenariosSeeder.transformToSendingResults([scenarios[1][0], scenarios[1][1]])

        expect(rows).to.equal(expectedResults)
      })
    })

    describe('and only the "primary user" is present for a registered licence (Scenario 3)', () => {
      it('returns the expected recipients', async () => {
        const licenceRefs = [scenarios[2][1].licenceRef]
        const { bindings, query } = GenerateAbstractionAlertRecipientsQueryService.go(licenceRefs)
        const { rows } = await db.raw(query, bindings)

        const expectedResults = RecipientScenariosSeeder.transformToSendingResults([scenarios[2][1]])

        expect(rows).to.equal(expectedResults)
      })
    })

    describe('and both the "primary user" and "additional contact" are present for a registered licence, but not the licence holder (Scenario 4)', () => {
      it('returns the expected recipients', async () => {
        const licenceRefs = [scenarios[3][1].licenceRef]
        const { bindings, query } = GenerateAbstractionAlertRecipientsQueryService.go(licenceRefs)
        const { rows } = await db.raw(query, bindings)

        const expectedResults = RecipientScenariosSeeder.transformToSendingResults([scenarios[3][1], scenarios[3][2]])

        expect(rows).to.equal(expectedResults)
      })
    })

    describe('and the same "additional contact" is associated with multiple licence documents (Scenario 5)', () => {
      it('returns the expected recipients', async () => {
        const licenceRefs = [scenarios[4][0].licenceRef, scenarios[4][1].licenceRef].sort(compareStrings)

        const { bindings, query } = GenerateAbstractionAlertRecipientsQueryService.go(licenceRefs)
        const { rows } = await db.raw(query, bindings)

        const transformedResults = RecipientScenariosSeeder.transformToSendingResults([
          scenarios[4][0],
          scenarios[4][2]
        ])
        const expectedResults = [
          { ...transformedResults[0], licence_refs: licenceRefs },
          { ...transformedResults[1], licence_refs: licenceRefs }
        ]

        expect(rows).to.equal(expectedResults)
      })
    })

    describe('and an additional contact is present but abstractionAlerts is false (Scenario 6)', () => {
      it('returns only the "licence holder" and not the additional contact', async () => {
        const licenceRefs = [scenarios[5][0].licenceRef]
        const { bindings, query } = GenerateAbstractionAlertRecipientsQueryService.go(licenceRefs)
        const { rows } = await db.raw(query, bindings)

        const expectedResults = RecipientScenariosSeeder.transformToSendingResults([scenarios[5][0]])

        expect(rows).to.equal(expectedResults)
      })
    })

    describe('and different "licence holders" and "additional contacts" are present for different licences (Scenario 7)', () => {
      it('returns the expected recipients', async () => {
        const licenceRefs = [scenarios[6][0].licenceRef, scenarios[6][1].licenceRef].sort(compareStrings)

        const { bindings, query } = GenerateAbstractionAlertRecipientsQueryService.go(licenceRefs)
        const { rows } = await db.raw(query, bindings)

        const transformedResults = RecipientScenariosSeeder.transformToSendingResults([
          scenarios[6][0],
          scenarios[6][1],
          scenarios[6][2],
          scenarios[6][3]
        ])
        const expectedResults = transformedResults.sort((a, b) => {
          return compareStrings(a.licence_refs[0], b.licence_refs[0])
        })

        expect(rows).to.equal(expectedResults)
      })
    })

    describe('and one of the "additional contacts" has abstractionAlerts set to false across multiple licences (Scenario 8)', () => {
      it('returns both "licence holders" but only the "additional contact" with abstractionAlerts set to true', async () => {
        const licenceRefs = [scenarios[7][0].licenceRef, scenarios[7][1].licenceRef].sort(compareStrings)

        const { bindings, query } = GenerateAbstractionAlertRecipientsQueryService.go(licenceRefs)
        const { rows } = await db.raw(query, bindings)

        const transformedResults = RecipientScenariosSeeder.transformToSendingResults([
          scenarios[7][0],
          scenarios[7][1],
          scenarios[7][2]
        ])
        const expectedResults = transformedResults.sort((a, b) => {
          return compareStrings(a.licence_refs[0], b.licence_refs[0])
        })

        expect(rows).to.equal(expectedResults)
      })
    })

    describe('and the additional contact end date has passed (Scenario 9)', () => {
      it('returns only the "licence holder" and not the expired additional contact', async () => {
        const licenceRefs = [scenarios[8][0].licenceRef]
        const { bindings, query } = GenerateAbstractionAlertRecipientsQueryService.go(licenceRefs)
        const { rows } = await db.raw(query, bindings)

        const expectedResults = RecipientScenariosSeeder.transformToSendingResults([scenarios[8][0]])

        expect(rows).to.equal(expectedResults)
      })
    })
  })
})

async function _additionalContactRecipient(licence, abstractionAlerts = true, contactData = null, endDate = null) {
  const additionalContact = await CRMContactsSeeder.additionalContact(licence, contactData, abstractionAlerts, endDate)

  const additionalContactRecipient = await RecipientsSeeder.additionalContact(licence, additionalContact)

  additionalContactRecipient.licenceRefs = [licence.licence.licenceRef]

  return additionalContactRecipient
}

async function _licenceHolder(name = 'Holderwithadditionalcontact') {
  const licence = await EmptyLicence.seed()
  const licenceHolder = await CRMContactsSeeder.licenceHolder(licence, name)

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
