'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const FetchBillLicenceService = require('../../../app/services/bill-licences/fetch-bill-licence.service.js')
const ViewBillLicencePresenter = require('../../../app/presenters/bill-licences/view-bill-licence.presenter.js')

// Thing under test
const ViewBillLicenceService = require('../../../app/services/bill-licences/view-bill-licence.service.js')

describe('View Bill Licence service', () => {
  const testId = '1ac20440-fddc-4835-97ea-95c702cb9430'

  let fetchBillLicenceSpy

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a bill licence with a matching ID exists', () => {
    beforeEach(() => {
      fetchBillLicenceSpy = Sinon.spy(FetchBillLicenceService, 'go')

      Sinon.stub(ViewBillLicencePresenter, 'go').returns({
        billingInvoiceLicenceId: '1ac20440-fddc-4835-97ea-95c702cb9430'
      })
    })

    it('will fetch the data and format it using the bill licence services', async () => {
      const result = await ViewBillLicenceService.go(testId)

      expect(result).to.equal({
        billingInvoiceLicenceId: '1ac20440-fddc-4835-97ea-95c702cb9430'
      })

      expect(fetchBillLicenceSpy.calledOnceWith(testId)).to.be.true()
    })
  })

  describe('when a bill with a matching ID does not exist', () => {
    it('throws an exception', async () => {
      await expect(ViewBillLicenceService.go('testId'))
        .to
        .reject()
    })
  })
})
