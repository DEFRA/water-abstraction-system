// Test helpers
import * as BillRunHelper from '../../support/helpers/bill-run.helper.js'
import * as RegionHelper from '../../support/helpers/region.helper.js'
import BillRunModel from '../../../app/models/bill-run.model.js'

// Thing under test
import CreateBillRunEventPresenter from '../../../app/presenters/bill-runs/create-bill-run-event.presenter.js'

describe('Create Bill Run Event presenter', () => {
  describe('when a BillRunModel instance is provided', () => {
    let billRun

    beforeEach(async () => {
      const region = RegionHelper.select()
      const testBillRun = await BillRunHelper.add({ regionId: region.id })

      billRun = await BillRunModel.query().findById(testBillRun.id).withGraphFetched('region')
    })

    it('correctly presents the data', () => {
      const result = CreateBillRunEventPresenter(billRun)

      expect(result.batch).toBeDefined()
      expect(result.batch.id).toEqual(billRun.id)
      expect(result.batch.type).toEqual(billRun.batchType)
      expect(result.batch.source).toEqual(billRun.source)
      expect(result.batch.status).toEqual(billRun.status)
      expect(result.batch.summer).toEqual(billRun.summer)
      expect(result.batch.netTotal).toEqual(billRun.netTotal)

      expect(result.batch.dateCreated).toEqual(billRun.createdAt)
      expect(result.batch.dateUpdated).toEqual(billRun.updatedAt)
      expect(result.batch.invoiceCount).toEqual(billRun.invoiceCount)
      expect(result.batch.invoiceValue).toEqual(billRun.invoiceValue)
      expect(result.batch.creditNoteCount).toEqual(billRun.creditNoteCount)
      expect(result.batch.creditNoteValue).toEqual(billRun.creditNoteValue)

      expect(result.batch.region).toEqual({
        id: billRun.region.id,
        code: billRun.region.chargeRegionId,
        name: billRun.region.name,
        type: 'region',
        displayName: billRun.region.displayName,
        numericCode: billRun.region.naldRegionId
      })

      expect(result.batch.endYear).toEqual({ yearEnding: billRun.toFinancialYearEnding })
      expect(result.batch.startYear).toEqual({ yearEnding: billRun.fromFinancialYearEnding })
    })
  })
})
