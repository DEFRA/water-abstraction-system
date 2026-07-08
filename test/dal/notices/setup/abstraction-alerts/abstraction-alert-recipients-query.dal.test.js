// Test helpers
import * as CRMContactsSeeder from '../../../../support/seeders/crm-contacts.seeder.js'
import * as EmptyLicence from '../../../../support/seeders/empty-licence.seeder.js'
import * as RecipientScenariosSeeder from '../../../../support/seeders/recipient-scenarios.seeder.js'
import * as RecipientsFormatter from '../../../../support/seeders/recipients.formatter.js'
import { compareStrings } from '../../../../../app/lib/general.lib.js'
import { db } from '../../../../../db/db.js'

// Thing under test
import * as AbstractionAlertRecipientsQueryDal from '../../../../../app/dal/notices/setup/abstraction-alerts/abstraction-alert-recipients-query.dal.js'

describe('Notices - Setup - Abstraction Alerts - Abstraction Alert Recipients Query DAL', () => {
  const query = AbstractionAlertRecipientsQueryDal.abstractionAlertRecipientsQuery

  let scenarios

  beforeAll(async () => {
    scenarios = {}

    // 1) Licence holder only
    scenarios.licenceHolder = await RecipientScenariosSeeder.licenceHolderOnly()

    // 2) Licence holder, and an additional contact
    scenarios.licenceHolderWithAdditionalContact = await RecipientScenariosSeeder.additionalContactRecipient()

    // 3) Licence holder with an additional contact where abstractionAlerts = false. The additional contact should NOT
    // appear in results.
    scenarios.additionalContactNoAlerts = await RecipientScenariosSeeder.additionalContactRecipient(false)

    // 4) Primary user only. All licences have a licence holder record, but when 'registered' the query will only
    // return the primary user recipient.
    scenarios.primaryUser = await RecipientScenariosSeeder.primaryUserOnly()

    // 5) Primary user with an additional contact. Similar to scenario 4 - when registered, we expect the primary user
    // and additional contact but not the licence holder. All three must share one licence, so we build this manually.
    const licence = await EmptyLicence.seed()
    const licenceHolder = await CRMContactsSeeder.licenceHolder(licence, 'PrimaryWithAdditional')
    const scenario5LicenceHolderRecipient = await RecipientsFormatter.licenceHolder(licence, licenceHolder)
    const scenario5PrimaryUser = await CRMContactsSeeder.primaryUser(licence, 'primary.withcontact@test.com')
    const scenario5PrimaryUserRecipient = await RecipientsFormatter.primaryUser(licence, scenario5PrimaryUser)
    const scenario5AdditionalContact = await CRMContactsSeeder.additionalContact(licenceHolder)
    const scenario5AdditionalContactRecipient = await RecipientsFormatter.additionalContact(
      licence,
      scenario5AdditionalContact
    )

    scenarios.primaryUserWithAdditionalContact = {
      licenceHolderRecipient: scenario5LicenceHolderRecipient,
      primaryUserRecipient: scenario5PrimaryUserRecipient,
      additionalContactRecipient: scenario5AdditionalContactRecipient
    }

    // 6) Additional contact multiple licence refs. Two contacts with the same default company name and contact email means
    // the query combines them into a single row per contact (same contact_hash_id).
    const scenario6a = await RecipientScenariosSeeder.additionalContactRecipient()
    const scenario6b = await RecipientScenariosSeeder.additionalContactRecipient()

    scenarios.additionalContactMultipleLicences = {
      licenceHolderRecipient: scenario6a.licenceHolderRecipient,
      licenceHolderRecipientTwo: scenario6b.licenceHolderRecipient,
      additionalContactRecipient: scenario6a.additionalContactRecipient,
      additionalContactRecipientTwo: scenario6b.additionalContactRecipient
    }

    // 7) Different licence holders and different additional contacts for different licences. Unlike scenario 6 where
    // the same contact spans multiple licences and is combined into one row, here each licence has unique contacts so
    // all four recipients are returned separately.
    const scenario7a = await RecipientScenariosSeeder.additionalContactRecipient(
      true,
      null,
      null,
      'HolderWithUniqueContactA'
    )
    const scenario7b = await RecipientScenariosSeeder.additionalContactRecipient(
      true,
      null,
      null,
      'HolderWithUniqueContactB',
      {
        firstName: 'Champ',
        lastName: 'Kind',
        email: 'champ.kind@news.com'
      }
    )

    scenarios.differentHoldersAndContacts = {
      firstLicenceHolderRecipient: scenario7a.licenceHolderRecipient,
      secondLicenceHolderRecipient: scenario7b.licenceHolderRecipient,
      firstAdditionalContact: scenario7a.additionalContactRecipient,
      secondAdditionalContact: scenario7b.additionalContactRecipient
    }

    // 8) Two licences with different licence holders and additional contacts, but one additional contact has
    // abstractionAlerts = false and should NOT appear in results.
    const scenario8a = await RecipientScenariosSeeder.additionalContactRecipient(
      true,
      null,
      null,
      'HolderWithMixedAlertsA'
    )

    const scenario8b = await RecipientScenariosSeeder.additionalContactRecipient(
      false,
      null,
      null,
      'HolderWithMixedAlertsB',
      {
        firstName: 'Champ',
        lastName: 'Kind',
        email: 'champ.kind@news.com'
      }
    )

    scenarios.mixedAlerts = {
      licenceHolderRecipientWithAlert: scenario8a.licenceHolderRecipient,
      licenceHolderRecipientWithoutAlert: scenario8b.licenceHolderRecipient,
      additionalContactWithAlert: scenario8a.additionalContactRecipient,
      additionalContactWithoutAlert: scenario8b.additionalContactRecipient
    }
  })

  afterAll(async () => {
    await RecipientScenariosSeeder.clean(scenarios)
  })

  // NOTE: Because the query is very large we don't assert the full `query` string here
  describe('when called', () => {
    it('returns the expected query and bindings', () => {
      expect(
        query.startsWith(`
  WITH additional_contacts AS (`)
      ).toBe(true)
    })
  })

  describe('when executed', () => {
    describe('and only the licence holder is present for an unregistered licence (Scenario 1)', () => {
      it('returns the expected recipients', async () => {
        const licenceRefs = scenarios.licenceHolder.licenceHolderRecipient.licenceRefs

        const { rows } = await db.raw(query, [licenceRefs, licenceRefs, licenceRefs])

        const expectedResults = RecipientScenariosSeeder.transformToSendingResults(scenarios.licenceHolder)

        expect(rows).toEqual(expectedResults)
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

        expect(sortedRows).toEqual(expectedResults)
      })
    })

    describe('and an additional contact is present but abstractionAlerts is false (Scenario 3)', () => {
      it('returns only the "licence holder" and not the additional contact', async () => {
        const licenceRefs = scenarios.additionalContactNoAlerts.licenceHolderRecipient.licenceRefs

        const { rows } = await db.raw(query, [licenceRefs, licenceRefs, licenceRefs])

        const expectedResults = RecipientScenariosSeeder.transformToSendingResults({
          licenceHolderRecipient: scenarios.additionalContactNoAlerts.licenceHolderRecipient
        })

        expect(rows).toEqual(expectedResults)
      })
    })

    describe('and only the "primary user" is present for a registered licence (Scenario 4)', () => {
      it('returns the expected recipients', async () => {
        const licenceRefs = scenarios.primaryUser.primaryUserRecipient.licenceRefs

        const { rows } = await db.raw(query, [licenceRefs, licenceRefs, licenceRefs])

        const expectedResults = RecipientScenariosSeeder.transformToSendingResults({
          primaryUserRecipient: scenarios.primaryUser.primaryUserRecipient
        })

        expect(rows).toEqual(expectedResults)
      })
    })

    describe('and both the "primary user" and "additional contact" are present for a registered licence, but not the licence holder (Scenario 5)', () => {
      it('returns the expected recipients', async () => {
        const licenceRefs = scenarios.primaryUserWithAdditionalContact.primaryUserRecipient.licenceRefs

        const { rows } = await db.raw(query, [licenceRefs, licenceRefs, licenceRefs])

        const expectedResults = RecipientScenariosSeeder.transformToSendingResults({
          primaryUserRecipient: scenarios.primaryUserWithAdditionalContact.primaryUserRecipient,
          additionalContactRecipient: scenarios.primaryUserWithAdditionalContact.additionalContactRecipient
        })

        expect(rows).toEqual(expectedResults)
      })
    })

    describe('and the same "additional contact" is associated with multiple licence documents (Scenario 6)', () => {
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

        expect(sortedRows).toEqual(expectedResults)
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

        expect(rows).toEqual(expectedResults)
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

        expect(rows).toEqual(expectedResults)
      })
    })
  })
})
