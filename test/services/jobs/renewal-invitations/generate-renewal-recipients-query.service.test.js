// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import * as RecipientScenariosSeeder from '../../../support/seeders/recipient-scenarios.seeder.js'
import { db } from '../../../../db/db.js'

// Thing under test
import GenerateRenewalRecipientsQueryService from '../../../../app/services/jobs/renewal-invitations/generate-renewal-recipients-query.service.js'

describe('Jobs - Renewal Invitations - Generate Renewal Recipients Query Service', () => {
  const expiringLicencesQuery = `SELECT
  l.licence_ref
FROM
  public.licences l
WHERE
  l.expired_date = ?
  `

  let expiredDate
  let scenarios

  beforeAll(async () => {
    scenarios = {}

    // 1) Licence holder only
    expiredDate = new Date('2027-02-09')
    scenarios.licenceHolder = await RecipientScenariosSeeder.licenceHolderOnly([], expiredDate)

    // 2) Same licence holder, but is linked to multiple licences with due return logs - only one recipient record
    // will be returned with multiple licence refs
    expiredDate = new Date('2027-02-10')
    scenarios.licenceHolderMultipleLicences = await RecipientScenariosSeeder.licenceHolderWithMultipleLicences(
      [],
      expiredDate
    )

    // 3) Primary user only. All licences have a licence holder record, but when 'registered' the query will only
    // return the primary user recipient.
    expiredDate = new Date('2027-02-11')
    scenarios.primaryUser = await RecipientScenariosSeeder.primaryUserOnly([], expiredDate)

    // 4) Same primary user, but is linked to multiple licences - only one recipient record will be returned with
    // multiple licence refs
    expiredDate = new Date('2027-02-12')
    scenarios.primaryUserMultipleLicences = await RecipientScenariosSeeder.primaryUserWithMultipleLicences(
      [],
      expiredDate
    )
  })

  afterAll(async () => {
    await RecipientScenariosSeeder.clean(scenarios)
  })

  // NOTE: Because the query is very large we don't assert the full `query` string here
  describe('when called', () => {
    it('returns the expected query', () => {
      const query = GenerateRenewalRecipientsQueryService(expiringLicencesQuery)

      expect(
        query.startsWith(`
    WITH
      expiring_licences AS (
        ${expiringLicencesQuery}`)
      ).toBe(true)
    })
  })

  describe('when executed', () => {
    describe('and only the licence holder is present for a single licence (Scenario 1)', () => {
      it('returns the expected recipients', async () => {
        const query = GenerateRenewalRecipientsQueryService(expiringLicencesQuery)

        const { rows } = await db.raw(query, [new Date('2027-02-09')])

        const expectedResults = RecipientScenariosSeeder.transformToSendingResults(scenarios.licenceHolder)

        expect(rows).toEqual(expectedResults)
      })
    })

    describe('and only the licence holder is present for multiple licences (Scenario 2)', () => {
      it('returns the expected recipients', async () => {
        const query = GenerateRenewalRecipientsQueryService(expiringLicencesQuery)

        const { rows } = await db.raw(query, [new Date('2027-02-10')])

        const expectedResults = RecipientScenariosSeeder.transformToSendingResults(
          scenarios.licenceHolderMultipleLicences
        )

        expect(rows).toContainEqual(expectedResults[0])
        // We could test rows contains the second licence holder recipient recorded in the scenario, but they are the
        // same so it would also return true and not prove anything
        expect(expectedResults[0]).toEqual(expectedResults[1])
      })
    })

    describe('and a primary user is present for a single licence (Scenario 3)', () => {
      it('returns the expected recipients', async () => {
        const query = GenerateRenewalRecipientsQueryService(expiringLicencesQuery)

        const { rows } = await db.raw(query, [new Date('2027-02-11')])

        const expectedResults = RecipientScenariosSeeder.transformToSendingResults(scenarios.primaryUser)

        expect(rows).toContainEqual(expectedResults[1])

        // NOTE: When a licence is registered expectedResults[0] will always reference the licence holder
        expect(rows).not.toContainEqual(expectedResults[0])
      })
    })

    describe('and a primary user is present for multiple licences (Scenario 4)', () => {
      it('returns the expected recipients', async () => {
        const query = GenerateRenewalRecipientsQueryService(expiringLicencesQuery)

        const { rows } = await db.raw(query, [new Date('2027-02-12')])

        const expectedResults = RecipientScenariosSeeder.transformToSendingResults(
          scenarios.primaryUserMultipleLicences
        )

        expect(rows).toContainEqual(expectedResults[1])

        // NOTE: When a licence is registered, expectedResults[0] will always reference the licence holder
        expect(rows).not.toContainEqual(expectedResults[0])
      })
    })
  })
})
