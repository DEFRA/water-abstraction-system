'use strict'

// Test framework dependencies

const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = require('node:test')
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
        billId: '4fc6536e-1970-47f0-a4b3-d4c6360ad389'
      })
    })

    it('will fetch the data and format it using the bill licence services', async () => {
      const result = await ViewBillLicenceService.go(testId)

      expect(result).to.equal({
        billId: '4fc6536e-1970-47f0-a4b3-d4c6360ad389'
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
