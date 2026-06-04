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
const RecipientsFormatter = require('../../../../support/seeders/recipients.formatter.js')
const { compareStrings } = require('../../../../../app/lib/general.lib.js')
const { db } = require('../../../../../db/db.js')

// Thing under test
const GenerateAbstractionAlertRecipientsQueryDal = require('../../../../../app/dal/notices/setup/abstraction-alerts/generate-abstraction-alert-recipients-query.dal.js')

describe('Notices - Setup - Abstraction Alerts - Generate Abstraction Alert Recipients Query DAL', () => {
  let scenarios

  before(async () => {
    scenarios = {}

    let licenceHolder
    let licenceHolderRecipient

    // 1) Licence holder only
    scenarios.licenceHolder = await RecipientScenariosSeeder.licenceHolderOnly()

    // 2) Licence holder, and an additional contact
    licenceHolder = await _licenceHolder()
    licenceHolderRecipient = await RecipientsFormatter.licenceHolder(licenceHolder.licence, licenceHolder.licenceHolder)
    scenarios.licenceHolderWithAdditionalContact = {
      licenceHolderRecipient,
      ...(await RecipientScenariosSeeder.additionalContactRecipient(licenceHolder.licence))
    }

    // 3) Primary user only. All licences have a licence holder record, but when 'registered' the query will only
    // return the primary user recipient.
    scenarios.primaryUser = await RecipientScenariosSeeder.primaryUserOnly()

    // 4) Primary user with an additional contact. Similar to scenario 3 - when registered, we expect the primary user
    // and additional contact but not the licence holder.
    licenceHolder = await _licenceHolder()
    licenceHolderRecipient = await RecipientsFormatter.licenceHolder(licenceHolder.licence, licenceHolder.licenceHolder)
    const primaryUser = await _primaryUser(licenceHolder.licence)
    const primaryUserRecipient = await RecipientsFormatter.primaryUser(licenceHolder.licence, primaryUser.primaryUser)
    scenarios.primaryUserWithAdditionalContact = {
      licenceHolderRecipient,
      primaryUserRecipient,
      ...(await RecipientScenariosSeeder.additionalContactRecipient(licenceHolder.licence))
    }

    // 5) Additional contact multiple licence refs
    licenceHolder = await _licenceHolder()
    licenceHolderRecipient = await RecipientsFormatter.licenceHolder(licenceHolder.licence, licenceHolder.licenceHolder)
    const { additionalContactRecipient } = await RecipientScenariosSeeder.additionalContactRecipient(
      licenceHolder.licence
    )

    // Second licence
    const licenceHolderTwo = await _licenceHolder()
    const licenceHolderRecipientTwo = await RecipientsFormatter.licenceHolder(
      licenceHolderTwo.licence,
      licenceHolderTwo.licenceHolder
    )
    const { additionalContactRecipient: additionalContactRecipientTwo } =
      await RecipientScenariosSeeder.additionalContactRecipient(licenceHolderTwo.licence)
    scenarios.additionalContactMultipleLicences = {
      licenceHolderRecipient,
      licenceHolderRecipientTwo,
      additionalContactRecipient,
      additionalContactRecipientTwo
    }

    // 6) Licence holder with an additional contact where abstractionAlerts = false. The additional contact should NOT
    // appear in results.
    licenceHolder = await _licenceHolder()
    licenceHolderRecipient = await RecipientsFormatter.licenceHolder(licenceHolder.licence, licenceHolder.licenceHolder)
    const { additionalContactRecipient: additionalContactNoAlerts } =
      await RecipientScenariosSeeder.additionalContactRecipient(licenceHolder.licence, false)
    scenarios.additionalContactNoAlerts = { licenceHolderRecipient, additionalContactNoAlerts }

    // 7) Different licence holders and different additional contacts for different licences. Unlike scenario 5 where
    // the same contact spans multiple licences and is combined into one row, here each licence has unique contacts so
    // all four recipients are returned separately.
    const firstLicenceHolder = await _licenceHolder('HolderWithUniqueContactA')
    const firstLicenceHolderRecipient = await RecipientsFormatter.licenceHolder(
      firstLicenceHolder.licence,
      firstLicenceHolder.licenceHolder
    )
    const { additionalContactRecipient: firstAdditionalContact } =
      await RecipientScenariosSeeder.additionalContactRecipient(firstLicenceHolder.licence)

    const secondLicenceHolder = await _licenceHolder('HolderWithUniqueContactB')
    const secondLicenceHolderRecipient = await RecipientsFormatter.licenceHolder(
      secondLicenceHolder.licence,
      secondLicenceHolder.licenceHolder
    )
    const { additionalContactRecipient: secondAdditionalContact } =
      await RecipientScenariosSeeder.additionalContactRecipient(secondLicenceHolder.licence, true, {
        firstName: 'Champ',
        lastName: 'Kind',
        email: 'champ.kind@news.com'
      })

    scenarios.differentHoldersAndContacts = {
      firstLicenceHolderRecipient,
      secondLicenceHolderRecipient,
      firstAdditionalContact,
      secondAdditionalContact
    }

    // 8) Two licences with different licence holders and additional contacts, but one additional contact has
    // abstractionAlerts = false and should NOT appear in results.
    const licenceHolderWithAlert = await _licenceHolder('HolderWithMixedAlertsA')
    const licenceHolderRecipientWithAlert = await RecipientsFormatter.licenceHolder(
      licenceHolderWithAlert.licence,
      licenceHolderWithAlert.licenceHolder
    )
    const { additionalContactRecipient: additionalContactWithAlert } =
      await RecipientScenariosSeeder.additionalContactRecipient(licenceHolderWithAlert.licence)

    const licenceHolderWithoutAlert = await _licenceHolder('HolderWithMixedAlertsB')
    const licenceHolderRecipientWithoutAlert = await RecipientsFormatter.licenceHolder(
      licenceHolderWithoutAlert.licence,
      licenceHolderWithoutAlert.licenceHolder
    )
    const { additionalContactRecipient: additionalContactWithoutAlert } =
      await RecipientScenariosSeeder.additionalContactRecipient(licenceHolderWithoutAlert.licence, false, {
        firstName: 'Champ',
        lastName: 'Kind',
        email: 'champ.kind@news.com'
      })

    scenarios.mixedAlerts = {
      licenceHolderRecipientWithAlert,
      licenceHolderRecipientWithoutAlert,
      additionalContactWithAlert,
      additionalContactWithoutAlert
    }

    // 9) Licence holder with an additional contact where the end date has passed. The expired contact should NOT
    // appear in results.
    licenceHolder = await _licenceHolder()
    licenceHolderRecipient = await RecipientsFormatter.licenceHolder(licenceHolder.licence, licenceHolder.licenceHolder)
    const { additionalContactRecipient: expiredAdditionalContact } =
      await RecipientScenariosSeeder.additionalContactRecipient(
        licenceHolder.licence,
        true,
        null,
        new Date('2023-01-01')
      )
    scenarios.expiredAdditionalContact = { licenceHolderRecipient, expiredAdditionalContact }
  })

  after(async () => {
    await RecipientScenariosSeeder.clean(scenarios)
  })

  // NOTE: Because the query is very large we don't assert the full `query` string here
  describe('when called', () => {
    it('returns the expected query and bindings', () => {
      const query = GenerateAbstractionAlertRecipientsQueryDal.go()

      expect(query).to.startWith(`
  WITH additional_contacts AS (`)
    })
  })

  describe('when executed', () => {
    describe('and only the licence holder is present for an unregistered licence (Scenario 1)', () => {
      it('returns the expected recipients', async () => {
        const licenceRefs = scenarios.licenceHolder.licenceHolderRecipient.licenceRefs

        const query = GenerateAbstractionAlertRecipientsQueryDal.go()

        const { rows } = await db.raw(query, [licenceRefs, licenceRefs, licenceRefs])

        const expectedResults = RecipientScenariosSeeder.transformToSendingResults(scenarios.licenceHolder)

        expect(rows).to.equal(expectedResults)
      })
    })

    describe('and both the "additional contact" and the "licence holder" are present for an unregistered licence (Scenario 2)', () => {
      it('returns the expected recipients', async () => {
        const licenceRefs = scenarios.licenceHolderWithAdditionalContact.licenceHolderRecipient.licenceRefs

        const query = GenerateAbstractionAlertRecipientsQueryDal.go()

        const { rows } = await db.raw(query, [licenceRefs, licenceRefs, licenceRefs])

        const expectedResults = RecipientScenariosSeeder.transformToSendingResults(
          scenarios.licenceHolderWithAdditionalContact
        )

        expect(rows).to.equal(expectedResults)
      })
    })

    describe('and only the "primary user" is present for a registered licence (Scenario 3)', () => {
      it('returns the expected recipients', async () => {
        const licenceRefs = scenarios.primaryUser.primaryUserRecipient.licenceRefs

        const query = GenerateAbstractionAlertRecipientsQueryDal.go()

        const { rows } = await db.raw(query, [licenceRefs, licenceRefs, licenceRefs])

        const expectedResults = RecipientScenariosSeeder.transformToSendingResults({
          primaryUserRecipient: scenarios.primaryUser.primaryUserRecipient
        })

        expect(rows).to.equal(expectedResults)
      })
    })

    describe('and both the "primary user" and "additional contact" are present for a registered licence, but not the licence holder (Scenario 4)', () => {
      it('returns the expected recipients', async () => {
        const licenceRefs = scenarios.primaryUserWithAdditionalContact.primaryUserRecipient.licenceRefs

        const query = GenerateAbstractionAlertRecipientsQueryDal.go()

        const { rows } = await db.raw(query, [licenceRefs, licenceRefs, licenceRefs])

        const expectedResults = RecipientScenariosSeeder.transformToSendingResults({
          primaryUserRecipient: scenarios.primaryUserWithAdditionalContact.primaryUserRecipient,
          additionalContactRecipient: scenarios.primaryUserWithAdditionalContact.additionalContactRecipient
        })

        expect(rows).to.equal(expectedResults)
      })
    })

    describe('and the same "additional contact" is associated with multiple licence documents (Scenario 5)', () => {
      it('returns the expected recipients', async () => {
        const licenceRefs = [
          ...scenarios.additionalContactMultipleLicences.licenceHolderRecipient.licenceRefs,
          ...scenarios.additionalContactMultipleLicences.licenceHolderRecipientTwo.licenceRefs
        ].sort(compareStrings)

        const query = GenerateAbstractionAlertRecipientsQueryDal.go()

        const { rows } = await db.raw(query, [licenceRefs, licenceRefs, licenceRefs])

        const transformedResults = RecipientScenariosSeeder.transformToSendingResults({
          licenceHolderRecipient: scenarios.additionalContactMultipleLicences.licenceHolderRecipient,
          additionalContactRecipient: scenarios.additionalContactMultipleLicences.additionalContactRecipient
        })
        const expectedResults = [
          { ...transformedResults[0], licence_refs: licenceRefs },
          { ...transformedResults[1], licence_refs: licenceRefs }
        ]

        expect(rows).to.equal(expectedResults)
      })
    })

    describe('and an additional contact is present but abstractionAlerts is false (Scenario 6)', () => {
      it('returns only the "licence holder" and not the additional contact', async () => {
        const licenceRefs = scenarios.additionalContactNoAlerts.licenceHolderRecipient.licenceRefs

        const query = GenerateAbstractionAlertRecipientsQueryDal.go()

        const { rows } = await db.raw(query, [licenceRefs, licenceRefs, licenceRefs])

        const expectedResults = RecipientScenariosSeeder.transformToSendingResults({
          licenceHolderRecipient: scenarios.additionalContactNoAlerts.licenceHolderRecipient
        })

        expect(rows).to.equal(expectedResults)
      })
    })

    describe('and different "licence holders" and "additional contacts" are present for different licences (Scenario 7)', () => {
      it('returns the expected recipients', async () => {
        const licenceRefs = [
          ...scenarios.differentHoldersAndContacts.firstLicenceHolderRecipient.licenceRefs,
          ...scenarios.differentHoldersAndContacts.secondLicenceHolderRecipient.licenceRefs
        ].sort(compareStrings)

        const query = GenerateAbstractionAlertRecipientsQueryDal.go()

        const { rows } = await db.raw(query, [licenceRefs, licenceRefs, licenceRefs])

        const transformedResults = RecipientScenariosSeeder.transformToSendingResults({
          firstLicenceHolderRecipient: scenarios.differentHoldersAndContacts.firstLicenceHolderRecipient,
          secondLicenceHolderRecipient: scenarios.differentHoldersAndContacts.secondLicenceHolderRecipient,
          firstAdditionalContact: scenarios.differentHoldersAndContacts.firstAdditionalContact,
          secondAdditionalContact: scenarios.differentHoldersAndContacts.secondAdditionalContact
        })
        const expectedResults = transformedResults.sort((a, b) => {
          return compareStrings(a.licence_refs[0], b.licence_refs[0])
        })

        expect(rows).to.equal(expectedResults)
      })
    })

    describe('and one of the "additional contacts" has abstractionAlerts set to false across multiple licences (Scenario 8)', () => {
      it('returns both "licence holders" but only the "additional contact" with abstractionAlerts set to true', async () => {
        const licenceRefs = [
          ...scenarios.mixedAlerts.licenceHolderRecipientWithAlert.licenceRefs,
          ...scenarios.mixedAlerts.licenceHolderRecipientWithoutAlert.licenceRefs
        ].sort(compareStrings)

        const query = GenerateAbstractionAlertRecipientsQueryDal.go()

        const { rows } = await db.raw(query, [licenceRefs, licenceRefs, licenceRefs])

        const transformedResults = RecipientScenariosSeeder.transformToSendingResults({
          licenceHolderRecipientWithAlert: scenarios.mixedAlerts.licenceHolderRecipientWithAlert,
          licenceHolderRecipientWithoutAlert: scenarios.mixedAlerts.licenceHolderRecipientWithoutAlert,
          additionalContactWithAlert: scenarios.mixedAlerts.additionalContactWithAlert
        })
        const expectedResults = transformedResults.sort((a, b) => {
          return compareStrings(a.licence_refs[0], b.licence_refs[0])
        })

        expect(rows).to.equal(expectedResults)
      })
    })

    describe('and the additional contact end date has passed (Scenario 9)', () => {
      it('returns only the "licence holder" and not the expired additional contact', async () => {
        const licenceRefs = scenarios.expiredAdditionalContact.licenceHolderRecipient.licenceRefs

        const query = GenerateAbstractionAlertRecipientsQueryDal.go()

        const { rows } = await db.raw(query, [licenceRefs, licenceRefs, licenceRefs])

        const expectedResults = RecipientScenariosSeeder.transformToSendingResults({
          licenceHolderRecipient: scenarios.expiredAdditionalContact.licenceHolderRecipient
        })

        expect(rows).to.equal(expectedResults)
      })
    })
  })
})

async function _licenceHolder(name = 'Holderwithadditionalcontact') {
  const licence = await EmptyLicence.seed()
  const licenceHolder = await CRMContactsSeeder.licenceHolder(licence, name)

  return {
    licence,
    licenceHolder
  }
}

async function _primaryUser(licence) {
  const primaryUser = await CRMContactsSeeder.primaryUser(licence, 'primaryuser@pura.com')

  return { primaryUser }
}
