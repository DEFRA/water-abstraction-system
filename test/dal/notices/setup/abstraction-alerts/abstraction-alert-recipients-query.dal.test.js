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
const abstractionAlertRecipientsQueryDal = require('../../../../../app/dal/notices/setup/abstraction-alerts/abstraction-alert-recipients-query.dal.js')

describe('Notices - Setup - Abstraction Alerts - Abstraction Alert Recipients Query DAL', () => {
  const query = abstractionAlertRecipientsQueryDal.abstractionAlertRecipientsQuery

  let scenarios

  before(async () => {
    scenarios = {}

    // 1) Licence holder only
    scenarios.licenceHolder = await RecipientScenariosSeeder.licenceHolderOnly()

    // 2) Licence holder, and an additional contact
    scenarios.licenceHolderWithAdditionalContact = await RecipientScenariosSeeder.additionalContactRecipient()

    // 3) Primary user only. All licences have a licence holder record, but when 'registered' the query will only
    // return the primary user recipient.
    scenarios.primaryUser = await RecipientScenariosSeeder.primaryUserOnly()

    // 4) Primary user with an additional contact. Similar to scenario 3 - when registered, we expect the primary user
    // and additional contact but not the licence holder. All three must share one licence, so we build this manually.
    const s4Licence = await EmptyLicence.seed()
    const s4LicenceHolder = await CRMContactsSeeder.licenceHolder(s4Licence, 'PrimaryWithAdditional')
    const s4LicenceHolderRecipient = await RecipientsFormatter.licenceHolder(s4Licence, s4LicenceHolder)
    const s4PrimaryUser = await CRMContactsSeeder.primaryUser(s4Licence, 'primary.withcontact@test.com')
    const s4PrimaryUserRecipient = await RecipientsFormatter.primaryUser(s4Licence, s4PrimaryUser)
    const s4AdditionalContact = await CRMContactsSeeder.additionalContact(s4Licence, s4LicenceHolder)
    const s4AdditionalContactRecipient = await RecipientsFormatter.additionalContact(s4Licence, s4AdditionalContact)
    scenarios.primaryUserWithAdditionalContact = {
      licenceHolderRecipient: s4LicenceHolderRecipient,
      primaryUserRecipient: s4PrimaryUserRecipient,
      additionalContactRecipient: s4AdditionalContactRecipient
    }

    // 5) Additional contact multiple licence refs. Two calls with the same default company name and contact email means
    // the query combines them into a single row per contact (same contact_hash_id).
    const scenario5a = await RecipientScenariosSeeder.additionalContactRecipient()
    const scenario5b = await RecipientScenariosSeeder.additionalContactRecipient()
    scenarios.additionalContactMultipleLicences = {
      licenceHolderRecipient: scenario5a.licenceHolderRecipient,
      licenceHolderRecipientTwo: scenario5b.licenceHolderRecipient,
      additionalContactRecipient: scenario5a.additionalContactRecipient,
      additionalContactRecipientTwo: scenario5b.additionalContactRecipient
    }

    // 6) Licence holder with an additional contact where abstractionAlerts = false. The additional contact should NOT
    // appear in results.
    scenarios.additionalContactNoAlerts = await RecipientScenariosSeeder.additionalContactRecipient(false)

    // 7) Different licence holders and different additional contacts for different licences. Unlike scenario 5 where
    // the same contact spans multiple licences and is combined into one row, here each licence has unique contacts so
    // all four recipients are returned separately.
    const s7a = await _additionalContact('HolderWithUniqueContactA')
    const s7b = await _additionalContact('HolderWithUniqueContactB', {
      firstName: 'Champ',
      lastName: 'Kind',
      email: 'champ.kind@news.com'
    })
    scenarios.differentHoldersAndContacts = {
      firstLicenceHolderRecipient: s7a.licenceHolderRecipient,
      secondLicenceHolderRecipient: s7b.licenceHolderRecipient,
      firstAdditionalContact: s7a.additionalContactRecipient,
      secondAdditionalContact: s7b.additionalContactRecipient
    }

    // 8) Two licences with different licence holders and additional contacts, but one additional contact has
    // abstractionAlerts = false and should NOT appear in results.
    const s8a = await _additionalContact('HolderWithMixedAlertsA')
    const s8b = await _additionalContact(
      'HolderWithMixedAlertsB',
      {
        firstName: 'Champ',
        lastName: 'Kind',
        email: 'champ.kind@news.com'
      },
      false
    )
    scenarios.mixedAlerts = {
      licenceHolderRecipientWithAlert: s8a.licenceHolderRecipient,
      licenceHolderRecipientWithoutAlert: s8b.licenceHolderRecipient,
      additionalContactWithAlert: s8a.additionalContactRecipient,
      additionalContactWithoutAlert: s8b.additionalContactRecipient
    }
  })

  after(async () => {
    await RecipientScenariosSeeder.clean(scenarios)
  })

  // NOTE: Because the query is very large we don't assert the full `query` string here
  describe('when called', () => {
    it('returns the expected query and bindings', () => {
      expect(query).to.startWith(`
  WITH additional_contacts AS (`)
    })
  })

  describe('when executed', () => {
    describe('and only the licence holder is present for an unregistered licence (Scenario 1)', () => {
      it('returns the expected recipients', async () => {
        const licenceRefs = scenarios.licenceHolder.licenceHolderRecipient.licenceRefs

        const { rows } = await db.raw(query, [licenceRefs, licenceRefs, licenceRefs])

        const expectedResults = RecipientScenariosSeeder.transformToSendingResults(scenarios.licenceHolder)

        expect(rows).to.equal(expectedResults)
      })
    })

    describe('and both the "additional contact" and the "licence holder" are present for an unregistered licence (Scenario 2)', () => {
      it('returns the expected recipients', async () => {
        const licenceRefs = scenarios.licenceHolderWithAdditionalContact.licenceHolderRecipient.licenceRefs

        const { rows } = await db.raw(query, [licenceRefs, licenceRefs, licenceRefs])

        const sortedRows = [...rows].sort((a, b) => {
          return compareStrings(a.contact_type, b.contact_type)
        })
        const expectedResults = RecipientScenariosSeeder.transformToSendingResults(
          scenarios.licenceHolderWithAdditionalContact
        ).sort((a, b) => {
          return compareStrings(a.contact_type, b.contact_type)
        })

        expect(sortedRows).to.equal(expectedResults)
      })
    })

    describe('and only the "primary user" is present for a registered licence (Scenario 3)', () => {
      it('returns the expected recipients', async () => {
        const licenceRefs = scenarios.primaryUser.primaryUserRecipient.licenceRefs

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

        const { rows } = await db.raw(query, [licenceRefs, licenceRefs, licenceRefs])

        const transformedResults = RecipientScenariosSeeder.transformToSendingResults({
          licenceHolderRecipient: scenarios.additionalContactMultipleLicences.licenceHolderRecipient,
          additionalContactRecipient: scenarios.additionalContactMultipleLicences.additionalContactRecipient
        })
        const sortedRows = [...rows].sort((a, b) => {
          return compareStrings(a.contact_type, b.contact_type)
        })
        const expectedResults = [
          { ...transformedResults[0], licence_refs: licenceRefs },
          { ...transformedResults[1], licence_refs: licenceRefs }
        ].sort((a, b) => {
          return compareStrings(a.contact_type, b.contact_type)
        })

        expect(sortedRows).to.equal(expectedResults)
      })
    })

    describe('and an additional contact is present but abstractionAlerts is false (Scenario 6)', () => {
      it('returns only the "licence holder" and not the additional contact', async () => {
        const licenceRefs = scenarios.additionalContactNoAlerts.licenceHolderRecipient.licenceRefs

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
  })
})

async function _additionalContact(name, contactData = null, abstractionAlerts = true) {
  const licence = await EmptyLicence.seed()
  const licenceHolder = await CRMContactsSeeder.licenceHolder(licence, name)
  const licenceHolderRecipient = await RecipientsFormatter.licenceHolder(licence, licenceHolder)
  const additionalContact = await CRMContactsSeeder.additionalContact(
    licence,
    licenceHolder,
    contactData,
    abstractionAlerts
  )
  const additionalContactRecipient = await RecipientsFormatter.additionalContact(licence, additionalContact)

  return { licenceHolderRecipient, additionalContactRecipient }
}
