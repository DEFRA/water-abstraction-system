'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const FetchLicenceBillsService = require('../../../app/services/licences/fetch-licence-bills.service.js')
const PaginatorPresenter = require('../../../app/presenters/paginator.presenter.js')
const ViewLicenceService = require('../../../app/services/licences/view-licence.service.js')
const ViewLicenceBillsPresenter = require('../../../app/presenters/licences/view-licence-bills.presenter.js')

// Thing under test
const ViewLicenceBillsService = require('../../../app/services/licences/view-licence-bills.service.js')

describe('View Licence service bills', () => {
  const auth = {}
  const page = 1
  const pagination = { page }
  const testId = '2c80bd22-a005-4cf4-a2a2-73812a9861de'

  beforeEach(() => {
    Sinon.stub(FetchLicenceBillsService, 'go').returns(_billsFetchService())
    Sinon.stub(PaginatorPresenter, 'go').returns(pagination)
    Sinon.stub(ViewLicenceBillsPresenter, 'go').returns(_billsPresenter())
    Sinon.stub(ViewLicenceService, 'go').resolves(_licence())
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a bill', () => {
    describe('and it has no optional fields', () => {
      it('will return all the mandatory data and default values for use in the licence bills page', async () => {
        const result = await ViewLicenceBillsService.go(testId, auth)

        expect(result).to.equal({
          activeTab: 'bills',
          bills: [],
          licenceName: 'fake licence',
          pagination: { page: 1 }
        })
      })
    })
  })
})

function _licence () {
  return { licenceName: 'fake licence' }
}

function _billsPresenter () {
  return {
    bills: [],
    activeTab: 'bills'
  }
}

function _billsFetchService () {
  return {
    bills: [],
    pagination: { total: 1 }
  }
}
