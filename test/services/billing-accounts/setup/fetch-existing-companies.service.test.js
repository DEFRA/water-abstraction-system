// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import CompanyHelper from '../../../support/helpers/company.helper.js'
import CompanyModel from '../../../../app/models/company.model.js'

// Thing under test
import FetchExistingCompaniesService from '../../../../app/services/billing-accounts/setup/fetch-existing-companies.service.js'

describe('Billing Accounts - Setup - Fetch Existing Companies service', () => {
  let acmeFakeCompany
  let fakeCompany
  let fakeLtdCompany

  beforeAll(async () => {
    fakeLtdCompany = await CompanyHelper.add({
      name: 'Fake Ltd'
    })
    acmeFakeCompany = await CompanyHelper.add({
      name: 'Acme fake Ltd'
    })
    fakeCompany = await CompanyHelper.add({
      name: 'Fake'
    })
  })

  afterAll(async () => {
    await acmeFakeCompany.$query().delete()
    await fakeCompany.$query().delete()
    await fakeLtdCompany.$query().delete()
  })

  describe('when called with a searchInput', () => {
    it('returns the matching companies', async () => {
      const result = await FetchExistingCompaniesService('Fake')

      expect(result).toEqual([
        CompanyModel.fromJson({
          exact: true,
          id: fakeCompany.id,
          name: fakeCompany.name
        }),
        CompanyModel.fromJson({
          exact: false,
          id: acmeFakeCompany.id,
          name: acmeFakeCompany.name
        }),
        CompanyModel.fromJson({
          exact: false,
          id: fakeLtdCompany.id,
          name: fakeLtdCompany.name
        })
      ])
    })
  })
})
