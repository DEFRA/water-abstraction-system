'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CompanyHelper = require('../../support/helpers/company.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceVersionHelper = require('../../support/helpers/licence-version.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const FetchCompanyLicencesDal = require('../../../app/dal/company-contacts/fetch-company-licences.dal.js')

describe('Company Contacts - Fetch Company Licences Dal', () => {
  let scenarios

  before(async () => {
    scenarios = {}

    scenarios.licence = await _scenario()
    scenarios.expiredPast = await _scenario({ expiredDate: new Date('2020-01-01') })
    scenarios.lapsedPast = await _scenario({ lapsedDate: new Date('2020-01-01') })
    scenarios.revokedPast = await _scenario({ revokedDate: new Date('2020-01-01') })
    scenarios.mixedDates = await _scenario({
      expiredDate: new Date('2099-01-01'),
      lapsedDate: new Date('2020-01-01')
    })
    scenarios.expiredFuture = await _scenario({ expiredDate: new Date('2099-01-01') })
    scenarios.lapsedFuture = await _scenario({ lapsedDate: new Date('2099-01-01') })
    scenarios.revokedFuture = await _scenario({ revokedDate: new Date('2099-01-01') })

    const scenario = await _scenario()

    const newerLicenceVersion = await LicenceVersionHelper.add({
      licenceId: scenario.licence.id,
      issue: 2,
      companyId: generateUUID()
    })

    scenarios.licenceCurrentVersion = {
      ...scenario,
      newerLicenceVersion
    }

    scenarios.multpleLicences = await _scenarioWithMultipleLicences()
  })

  after(async () => {
    for (const scenario of Object.values(scenarios)) {
      await scenario.licenceVersion?.$query().delete()
      await scenario.licence?.$query().delete()
      await scenario.company?.$query().delete()

      await scenario.newerLicenceVersion?.$query().delete()

      if (scenario.multpleLicences) {
        await scenario.licenceOne.licence.$query().delete()
        await scenario.licenceTwo.licence.$query().delete()
        await scenario.licenceOne.licenceVersion.$query().delete()
        await scenario.licenceTwo.licenceVersion.$query().delete()
      }
    }
  })

  describe('when there are licences linked to the company', () => {
    it('returns the matching licences', async () => {
      const result = await FetchCompanyLicencesDal.go(scenarios.licence.company.id)

      expect(result).to.equal([
        {
          id: scenarios.licence.licence.id,
          licenceRef: scenarios.licence.licence.licenceRef
        }
      ])
    })
  })

  describe('when a licence linked to the company has an expiredDate in the past', () => {
    it('returns an empty array', async () => {
      const result = await FetchCompanyLicencesDal.go(scenarios.expiredPast.company.id)

      expect(result).to.equal([])
    })
  })

  describe('when a licence linked to the company has a lapsedDate in the past', () => {
    it('returns an empty array', async () => {
      const result = await FetchCompanyLicencesDal.go(scenarios.lapsedPast.company.id)

      expect(result).to.equal([])
    })
  })

  describe('when a licence linked to the company has a revokedDate in the past', () => {
    it('returns an empty array', async () => {
      const result = await FetchCompanyLicencesDal.go(scenarios.revokedPast.company.id)

      expect(result).to.equal([])
    })
  })

  describe('when a licence linked to the company has one end date in the past and another in the future', () => {
    it('returns an empty array', async () => {
      const result = await FetchCompanyLicencesDal.go(scenarios.mixedDates.company.id)

      expect(result).to.equal([])
    })
  })

  describe('when a licence linked to the company has an expiredDate in the future', () => {
    it('returns both licences', async () => {
      const result = await FetchCompanyLicencesDal.go(scenarios.expiredFuture.company.id)

      expect(result).to.equal([
        {
          id: scenarios.expiredFuture.licence.id,
          licenceRef: scenarios.expiredFuture.licence.licenceRef
        }
      ])
    })
  })

  describe('when a licence linked to the company has a lapsedDate in the future', () => {
    it('returns both licences', async () => {
      const result = await FetchCompanyLicencesDal.go(scenarios.lapsedFuture.company.id)

      expect(result).to.equal([
        {
          id: scenarios.lapsedFuture.licence.id,
          licenceRef: scenarios.lapsedFuture.licence.licenceRef
        }
      ])
    })
  })

  describe('when a licence linked to the company has a revokedDate in the future', () => {
    it('returns both licences', async () => {
      const result = await FetchCompanyLicencesDal.go(scenarios.revokedFuture.company.id)

      expect(result).to.equal([
        {
          id: scenarios.revokedFuture.licence.id,
          licenceRef: scenarios.revokedFuture.licence.licenceRef
        }
      ])
    })
  })

  describe('when there are no licences linked to the company', () => {
    it('returns an empty array', async () => {
      const result = await FetchCompanyLicencesDal.go(generateUUID())

      expect(result).to.equal([])
    })
  })

  describe('when a current version is not linked to the company id', () => {
    it('returns an empty array', async () => {
      const result = await FetchCompanyLicencesDal.go(scenarios.licenceCurrentVersion.company.id)

      expect(result).to.equal([])
    })
  })

  describe('when there are multiple licences linked to the company', () => {
    it('returns the licences ordered by licence ref', async () => {
      const result = await FetchCompanyLicencesDal.go(scenarios.multpleLicences.company.id)

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

      expect(result).to.equal(expectedLicences)
    })
  })
})

async function _scenario(data = {}) {
  const company = await CompanyHelper.add()

  const licence = await LicenceHelper.add(data)
  const licenceVersion = await LicenceVersionHelper.add({ licenceId: licence.id, companyId: company.id })

  return { company, licence, licenceVersion }
}

async function _scenarioWithMultipleLicences() {
  const scenario = await _scenario()
  const licence = await LicenceHelper.add()
  const licenceVersion = await LicenceVersionHelper.add({ licenceId: licence.id, companyId: scenario.company.id })

  return {
    company: scenario.company,
    licenceOne: {
      licence: scenario.licence,
      licenceVersion: scenario.licenceVersion
    },
    licenceTwo: {
      licence,
      licenceVersion
    }
  }
}
