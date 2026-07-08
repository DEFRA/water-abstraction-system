'use strict'

// Test helpers
const {
  exLicenceHolderWithSingleLicences,
  licenceHolderWithMultipleLicences,
  licenceHolderWithSingleLicence
} = require('../../support/seeders/licence.seeder.js')
const { generateUUID, today } = require('../../../app/lib/general.lib.js')
const { tomorrow, yesterday } = require('../../support/general.js')

// Thing under test
const FetchCompanyLicencesDal = require('../../../app/dal/company-contacts/fetch-company-licences.dal.js')

describe('Company Contacts - Fetch Company Licences Dal', () => {
  let scenarios

  beforeAll(async () => {
    scenarios = {}

    scenarios.licence = await licenceHolderWithSingleLicence()
    scenarios.expiredPast = await licenceHolderWithSingleLicence({ expiredDate: yesterday() })
    scenarios.lapsedPast = await licenceHolderWithSingleLicence({ lapsedDate: yesterday() })
    scenarios.revokedPast = await licenceHolderWithSingleLicence({ revokedDate: yesterday() })
    scenarios.endedToday = await licenceHolderWithSingleLicence({ expiredDate: today() })
    scenarios.mixedDates = await licenceHolderWithSingleLicence({
      expiredDate: tomorrow(),
      lapsedDate: yesterday()
    })
    scenarios.expiredFuture = await licenceHolderWithSingleLicence({ expiredDate: tomorrow() })
    scenarios.lapsedFuture = await licenceHolderWithSingleLicence({ lapsedDate: tomorrow() })
    scenarios.revokedFuture = await licenceHolderWithSingleLicence({ revokedDate: tomorrow() })
    scenarios.licenceCurrentVersion = await exLicenceHolderWithSingleLicences()
    scenarios.multpleLicences = await licenceHolderWithMultipleLicences()
  })

  afterAll(async () => {
    for (const scenario of Object.values(scenarios)) {
      await scenario.clean()
    }
  })

  describe('when there are licences linked to the company', () => {
    it('returns the matching licences', async () => {
      const result = await FetchCompanyLicencesDal(scenarios.licence.company.id)

      expect(result).toEqual([
        {
          id: scenarios.licence.licence.id,
          licenceRef: scenarios.licence.licence.licenceRef
        }
      ])
    })
  })

  describe('when a licence linked to the company has an expiredDate in the past', () => {
    it('returns an empty array', async () => {
      const result = await FetchCompanyLicencesDal(scenarios.expiredPast.company.id)

      expect(result).toEqual([])
    })
  })

  describe('when a licence linked to the company has a lapsedDate in the past', () => {
    it('returns an empty array', async () => {
      const result = await FetchCompanyLicencesDal(scenarios.lapsedPast.company.id)

      expect(result).toEqual([])
    })
  })

  describe('when a licence linked to the company has a revokedDate in the past', () => {
    it('returns an empty array', async () => {
      const result = await FetchCompanyLicencesDal(scenarios.revokedPast.company.id)

      expect(result).toEqual([])
    })
  })

  describe('when a licence linked to the company has "ended" today', () => {
    it('returns an empty array', async () => {
      const result = await FetchCompanyLicencesDal(scenarios.endedToday.company.id)

      expect(result).toEqual([])
    })
  })

  describe('when a licence linked to the company has one end date in the past and another in the future', () => {
    it('returns an empty array', async () => {
      const result = await FetchCompanyLicencesDal(scenarios.mixedDates.company.id)

      expect(result).toEqual([])
    })
  })

  describe('when a licence linked to the company has an expiredDate in the future', () => {
    it('returns the licences', async () => {
      const result = await FetchCompanyLicencesDal(scenarios.expiredFuture.company.id)

      expect(result).toEqual([
        {
          id: scenarios.expiredFuture.licence.id,
          licenceRef: scenarios.expiredFuture.licence.licenceRef
        }
      ])
    })
  })

  describe('when a licence linked to the company has a lapsedDate in the future', () => {
    it('returns the licences', async () => {
      const result = await FetchCompanyLicencesDal(scenarios.lapsedFuture.company.id)

      expect(result).toEqual([
        {
          id: scenarios.lapsedFuture.licence.id,
          licenceRef: scenarios.lapsedFuture.licence.licenceRef
        }
      ])
    })
  })

  describe('when a licence linked to the company has a revokedDate in the future', () => {
    it('returns the licences', async () => {
      const result = await FetchCompanyLicencesDal(scenarios.revokedFuture.company.id)

      expect(result).toEqual([
        {
          id: scenarios.revokedFuture.licence.id,
          licenceRef: scenarios.revokedFuture.licence.licenceRef
        }
      ])
    })
  })

  describe('when there are no licences linked to the company', () => {
    it('returns an empty array', async () => {
      const result = await FetchCompanyLicencesDal(generateUUID())

      expect(result).toEqual([])
    })
  })

  describe('when a current version is not linked to the company id', () => {
    it('returns an empty array', async () => {
      const result = await FetchCompanyLicencesDal(scenarios.licenceCurrentVersion.company.id)

      expect(result).toEqual([])
    })
  })

  describe('when there are multiple licences linked to the company', () => {
    it('returns the licences ordered by licence ref', async () => {
      const result = await FetchCompanyLicencesDal(scenarios.multpleLicences.company.id)

      const expectedLicences = [
        {
          id: scenarios.multpleLicences.licenceOne.licence.id,
          licenceRef: scenarios.multpleLicences.licenceOne.licence.licenceRef
        },
        {
          id: scenarios.multpleLicences.licenceTwo.licence.id,
          licenceRef: scenarios.multpleLicences.licenceTwo.licence.licenceRef
        }
      ].sort((a, b) => {
        return a.licenceRef.localeCompare(b.licenceRef)
      })

      expect(result).toEqual(expectedLicences)
    })
  })
})
