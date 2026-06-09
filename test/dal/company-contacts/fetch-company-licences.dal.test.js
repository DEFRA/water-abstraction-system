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
  })

  after(async () => {
    for (const scenario of Object.values(scenarios)) {
      await scenario.scenarioLinkedLicence.licenceVersion.$query().delete()
      await scenario.scenarioLinkedLicence.licence.$query().delete()
      await scenario.activeLinkedLicence.licenceVersion.$query().delete()
      await scenario.activeLinkedLicence.licence.$query().delete()
      await scenario.company.$query().delete()
    }
  })

  describe('when there are licences linked to the company', () => {
    it('returns the matching licences', async () => {
      const result = await FetchCompanyLicencesDal.go(scenarios.licence.company.id)

      const expectedLicences = [
        {
          id: scenarios.licence.activeLinkedLicence.licence.id,
          licenceRef: scenarios.licence.activeLinkedLicence.licence.licenceRef
        },
        {
          id: scenarios.licence.scenarioLinkedLicence.licence.id,
          licenceRef: scenarios.licence.scenarioLinkedLicence.licence.licenceRef
        }
      ].sort((a, b) => {
        return a.licenceRef.localeCompare(b.licenceRef)
      })

      expect(result).to.equal(expectedLicences)
    })
  })

  describe('when a licence linked to the company has an expiredDate in the past', () => {
    it('returns only the active licence', async () => {
      const result = await FetchCompanyLicencesDal.go(scenarios.expiredPast.company.id)

      expect(result).to.equal([
        {
          id: scenarios.expiredPast.activeLinkedLicence.licence.id,
          licenceRef: scenarios.expiredPast.activeLinkedLicence.licence.licenceRef
        }
      ])
    })
  })

  describe('when a licence linked to the company has a lapsedDate in the past', () => {
    it('returns only the active licence', async () => {
      const result = await FetchCompanyLicencesDal.go(scenarios.lapsedPast.company.id)

      expect(result).to.equal([
        {
          id: scenarios.lapsedPast.activeLinkedLicence.licence.id,
          licenceRef: scenarios.lapsedPast.activeLinkedLicence.licence.licenceRef
        }
      ])
    })
  })

  describe('when a licence linked to the company has a revokedDate in the past', () => {
    it('returns only the active licence', async () => {
      const result = await FetchCompanyLicencesDal.go(scenarios.revokedPast.company.id)

      expect(result).to.equal([
        {
          id: scenarios.revokedPast.activeLinkedLicence.licence.id,
          licenceRef: scenarios.revokedPast.activeLinkedLicence.licence.licenceRef
        }
      ])
    })
  })

  describe('when a licence linked to the company has one end date in the past and another in the future', () => {
    it('returns only the active licence', async () => {
      const result = await FetchCompanyLicencesDal.go(scenarios.mixedDates.company.id)

      expect(result).to.equal([
        {
          id: scenarios.mixedDates.activeLinkedLicence.licence.id,
          licenceRef: scenarios.mixedDates.activeLinkedLicence.licence.licenceRef
        }
      ])
    })
  })

  describe('when a licence linked to the company has an expiredDate in the future', () => {
    it('returns both licences', async () => {
      const result = await FetchCompanyLicencesDal.go(scenarios.expiredFuture.company.id)

      const expectedLicences = [
        {
          id: scenarios.expiredFuture.activeLinkedLicence.licence.id,
          licenceRef: scenarios.expiredFuture.activeLinkedLicence.licence.licenceRef
        },
        {
          id: scenarios.expiredFuture.scenarioLinkedLicence.licence.id,
          licenceRef: scenarios.expiredFuture.scenarioLinkedLicence.licence.licenceRef
        }
      ].sort((a, b) => {
        return a.licenceRef.localeCompare(b.licenceRef)
      })

      expect(result).to.equal(expectedLicences)
    })
  })

  describe('when a licence linked to the company has a lapsedDate in the future', () => {
    it('returns both licences', async () => {
      const result = await FetchCompanyLicencesDal.go(scenarios.lapsedFuture.company.id)

      const expectedLicences = [
        {
          id: scenarios.lapsedFuture.activeLinkedLicence.licence.id,
          licenceRef: scenarios.lapsedFuture.activeLinkedLicence.licence.licenceRef
        },
        {
          id: scenarios.lapsedFuture.scenarioLinkedLicence.licence.id,
          licenceRef: scenarios.lapsedFuture.scenarioLinkedLicence.licence.licenceRef
        }
      ].sort((a, b) => {
        return a.licenceRef.localeCompare(b.licenceRef)
      })

      expect(result).to.equal(expectedLicences)
    })
  })

  describe('when a licence linked to the company has a revokedDate in the future', () => {
    it('returns both licences', async () => {
      const result = await FetchCompanyLicencesDal.go(scenarios.revokedFuture.company.id)

      const expectedLicences = [
        {
          id: scenarios.revokedFuture.activeLinkedLicence.licence.id,
          licenceRef: scenarios.revokedFuture.activeLinkedLicence.licence.licenceRef
        },
        {
          id: scenarios.revokedFuture.scenarioLinkedLicence.licence.id,
          licenceRef: scenarios.revokedFuture.scenarioLinkedLicence.licence.licenceRef
        }
      ].sort((a, b) => {
        return a.licenceRef.localeCompare(b.licenceRef)
      })

      expect(result).to.equal(expectedLicences)
    })
  })

  describe('when there are no licences linked to the company', () => {
    it('returns an empty array', async () => {
      const result = await FetchCompanyLicencesDal.go(generateUUID())

      expect(result).to.equal([])
    })
  })
})

async function _scenario(data = {}) {
  const company = await CompanyHelper.add()
  const activeLinkedLicence = await _createLinkedLicence(company.id)
  const scenarioLinkedLicence = await _createLinkedLicence(company.id, data)

  return { activeLinkedLicence, company, scenarioLinkedLicence }
}

async function _createLinkedLicence(companyId, data = {}) {
  const licence = await LicenceHelper.add(data)
  const licenceVersion = await LicenceVersionHelper.add({ licenceId: licence.id, companyId })

  return { licence, licenceVersion }
}
