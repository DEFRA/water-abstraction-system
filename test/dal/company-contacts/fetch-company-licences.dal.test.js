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
const LicenceVersionHolderHelper = require('../../support/helpers/licence-version-holder.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const FetchCompanyLicencesDal = require('../../../app/dal/company-contacts/fetch-company-licences.dal.js')

describe('Company Contacts - Fetch Company Licences Dal', () => {
  let company
  let licence
  let licenceVersion
  let licenceVersionHolder

  before(async () => {
    company = await CompanyHelper.add()

    licence = await LicenceHelper.add()
    licenceVersion = await LicenceVersionHelper.add({ licenceId: licence.id })
    licenceVersionHolder = await LicenceVersionHolderHelper.add({
      licenceVersionId: licenceVersion.id,
      companyId: company.id
    })
  })

  after(async () => {
    await licenceVersionHolder.$query().delete()
    await licenceVersion.$query().delete()
    await licence.$query().delete()
    await company.$query().delete()
  })

  describe('when there are licences linked to the company', () => {
    it('returns the matching licences', async () => {
      const result = await FetchCompanyLicencesDal.go(company.id)

      expect(result).to.equal([{ id: licence.id, licenceRef: licence.licenceRef }])
    })
  })

  describe('when there are licences linked to the company that have ended', () => {
    let endedLicence
    let endedLicenceVersion
    let endedLicenceVersionHolder

    before(async () => {
      endedLicence = await LicenceHelper.add()
      endedLicenceVersion = await LicenceVersionHelper.add({ licenceId: endedLicence.id })
      endedLicenceVersionHolder = await LicenceVersionHolderHelper.add({
        licenceVersionId: endedLicenceVersion.id,
        companyId: company.id
      })
    })

    after(async () => {
      await endedLicenceVersionHolder.$query().delete()
      await endedLicenceVersion.$query().delete()
      await endedLicence.$query().delete()
    })

    describe('because they are expired', () => {
      before(async () => {
        await endedLicence.$query().patch({ expiredDate: new Date('2020-01-01'), lapsedDate: null, revokedDate: null })
      })

      it('returns only the active licence', async () => {
        const result = await FetchCompanyLicencesDal.go(company.id)

        expect(result).to.equal([{ id: licence.id, licenceRef: licence.licenceRef }])
      })
    })

    describe('because they are lapsed', () => {
      before(async () => {
        await endedLicence.$query().patch({ expiredDate: null, lapsedDate: new Date('2020-01-01'), revokedDate: null })
      })

      it('returns only the active licence', async () => {
        const result = await FetchCompanyLicencesDal.go(company.id)

        expect(result).to.equal([{ id: licence.id, licenceRef: licence.licenceRef }])
      })
    })

    describe('because they are revoked', () => {
      before(async () => {
        await endedLicence.$query().patch({ expiredDate: null, lapsedDate: null, revokedDate: new Date('2020-01-01') })
      })

      it('returns only the active licence', async () => {
        const result = await FetchCompanyLicencesDal.go(company.id)

        expect(result).to.equal([{ id: licence.id, licenceRef: licence.licenceRef }])
      })
    })
  })

  describe('when there are no licences linked to the company', () => {
    it('returns an empty array', async () => {
      const result = await FetchCompanyLicencesDal.go(generateUUID())

      expect(result).to.equal([])
    })
  })
})
