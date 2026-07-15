// Test helpers
import CompanyContactHelper from '../../support/helpers/company-contact.helper.js'
import CompanyContactModel from '../../../app/models/company-contact.model.js'

// Thing under test
import DeleteCompanyContactService from '../../../app/services/company-contacts/delete-company-contact.service.js'

describe('Company contact - Delete company contact service', () => {
  let companyContact
  let notified
  let today

  beforeEach(async () => {
    companyContact = await CompanyContactHelper.add()

    today = new Date('2020-06-06')

    vi.useFakeTimers({ now: today, toFake: ['Date'] })
  })

  afterEach(async () => {
    vi.useRealTimers()

    await companyContact.$query().delete()
  })

  describe('when the company contact been notified', () => {
    beforeEach(() => {
      notified = true
    })

    it('soft deletes the company contact', async () => {
      await DeleteCompanyContactService(companyContact.id, notified)

      const exists = await CompanyContactModel.query().findById(companyContact.id)

      expect(exists).toEqual({
        ...companyContact,
        deletedAt: today
      })
    })
  })

  describe('when the company contact has not been notified', () => {
    beforeEach(() => {
      notified = false
    })

    it('deletes the company contact', async () => {
      await DeleteCompanyContactService(companyContact.id, notified)

      const exists = await CompanyContactModel.query().findById(companyContact.id)

      expect(exists).toBeUndefined()
    })
  })
})
