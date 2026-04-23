'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientScenariosSeeder = require('../../../support/seeders/recipient-scenarios.seeder.js')
const { db } = require('../../../../db/db.js')

// Thing under test
const GenerateRenewalRecipientsQueryService = require('../../../../app/services/jobs/renewal-invitations/generate-renewal-recipients-query.service.js')

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

  before(async () => {
    scenarios = []

    let scenario

    // 1) Licence holder only
    expiredDate = new Date('2027-02-09')
    scenario = await RecipientScenariosSeeder.licenceHolderOnly([], expiredDate)
    scenarios.push(scenario)

    // 2) Same licence holder, but is linked to multiple licences with due return logs - only one recipient record
    // will be returned with multiple licence refs
    expiredDate = new Date('2027-02-10')
    scenario = await RecipientScenariosSeeder.licenceHolderWithMultipleLicences([], expiredDate)
    scenarios.push(scenario)

    // 3) Primary user only. All licences have a licence holder record, but when 'registered' the query will only
    // return the primary user recipient.
    expiredDate = new Date('2027-02-11')
    scenario = await RecipientScenariosSeeder.primaryUserOnly([], expiredDate)
    scenarios.push(scenario)

    // 7) Same primary user, but is linked to multiple licences - only one recipient record will be returned with
    // multiple licence refs
    expiredDate = new Date('2027-02-12')
    scenario = await RecipientScenariosSeeder.primaryUserWithMultipleLicences([], expiredDate)
    scenarios.push(scenario)
  })

  after(async () => {
    await RecipientScenariosSeeder.clean(scenarios)
  })

  // NOTE: Because the query is very large we don't assert the full `query` string here
  describe('when called', () => {
    it('returns the expected query', () => {
      const query = GenerateRenewalRecipientsQueryService.go(expiringLicencesQuery)

      expect(query).to.startWith(`
    WITH
      expiring_licences AS (
        ${expiringLicencesQuery}`)
    })
  })

  describe('when executed', () => {
    describe('and only the licence holder is present for a single licence (Scenario 1)', () => {
      it('returns the expected recipients', async () => {
        const query = GenerateRenewalRecipientsQueryService.go(expiringLicencesQuery)

        const { rows } = await db.raw(query, [new Date('2027-02-09')])

        const expectedResults = _transformToResult(scenarios[0])

        expect(rows).to.equal(expectedResults)
      })
    })

    describe('and only the licence holder is present for multiple licences (Scenario 2)', () => {
      it('returns the expected recipients', async () => {
        const query = GenerateRenewalRecipientsQueryService.go(expiringLicencesQuery)

        const { rows } = await db.raw(query, [new Date('2027-02-10')])

        const expectedResults = _transformToResult(scenarios[1])

        expect(rows).to.contain(expectedResults[0])
        // We could test rows contains the second licence holder recipient recorded in the scenario, but they are the
        // same so it would also return true and not prove anything
        expect(expectedResults[0]).to.equal(expectedResults[1])
      })
    })

    describe('and a primary user is present for a single licence (Scenario 3)', () => {
      it('returns the expected recipients', async () => {
        const query = GenerateRenewalRecipientsQueryService.go(expiringLicencesQuery)

        const { rows } = await db.raw(query, [new Date('2027-02-11')])

        const expectedResults = _transformToResult(scenarios[2])

        expect(rows).to.contain(expectedResults[1])

        // NOTE: When a licence is registered expectedResults[0] will always reference the licence holder
        expect(rows).not.to.contain(expectedResults[0])
      })
    })

    describe('and a primary user is present for multiple licences (Scenario 4)', () => {
      it('returns the expected recipients', async () => {
        const query = GenerateRenewalRecipientsQueryService.go(expiringLicencesQuery)

        const { rows } = await db.raw(query, [new Date('2027-02-12')])

        const expectedResults = _transformToResult(scenarios[3])

        expect(rows).to.contain(expectedResults[2])

        // NOTE: When a licence is registered, expectedResults[0] will always reference the licence holder
        expect(rows).not.to.contain(expectedResults[0])
      })
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
