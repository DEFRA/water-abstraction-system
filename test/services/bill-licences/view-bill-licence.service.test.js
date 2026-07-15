// Things we need to stub
import * as FetchBillLicenceService from '../../../app/services/bill-licences/fetch-bill-licence.service.js'
import * as ViewBillLicencePresenter from '../../../app/presenters/bill-licences/view-bill-licence.presenter.js'

// Thing under test
import ViewBillLicenceService from '../../../app/services/bill-licences/view-bill-licence.service.js'

describe('View Bill Licence service', () => {
  const testId = '1ac20440-fddc-4835-97ea-95c702cb9430'
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when a bill licence with a matching ID exists', () => {
    beforeEach(() => {
      vi.spyOn(FetchBillLicenceService, 'default').mockResolvedValue()

      vi.spyOn(ViewBillLicencePresenter, 'default').mockReturnValue({
        billId: '4fc6536e-1970-47f0-a4b3-d4c6360ad389'
      })
    })

    it('will fetch the data and format it using the bill licence services', async () => {
      const result = await ViewBillLicenceService(testId)

      expect(result).toEqual({
        activeNavBar: 'bill-runs',
        billId: '4fc6536e-1970-47f0-a4b3-d4c6360ad389'
      })

      expect(FetchBillLicenceService.default).toHaveBeenCalledExactlyOnceWith(testId)
    })
  })

  describe('when a bill with a matching ID does not exist', () => {
    it('throws an exception', async () => {
      await expect(ViewBillLicenceService('testId')).rejects.toThrow()
    })
  })
})
