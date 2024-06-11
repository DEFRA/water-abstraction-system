'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const FetchLicenceReturnsService = require('../../../app/services/licences/fetch-licence-returns.service.js')
const FetchLicenceHasRequirementsService = require('../../../app/services/licences/fetch-licence-has-requirements.service.js')
const PaginatorPresenter = require('../../../app/presenters/paginator.presenter.js')
const ViewLicenceReturnsPresenter = require('../../../app/presenters/licences/view-licence-returns.presenter.js')
const ViewLicenceService = require('../../../app/services/licences/view-licence.service.js')

// Thing under test
const ViewLicenceReturnsService = require('../../../app/services/licences/view-licence-returns.service.js')

describe('View Licence service returns', () => {
  const testId = '2c80bd22-a005-4cf4-a2a2-73812a9861de'
  const page = 1
  const auth = {}
  const pagination = { page }

  beforeEach(() => {
    Sinon.stub(FetchLicenceHasRequirementsService, 'go').resolves(true)
    Sinon.stub(FetchLicenceReturnsService, 'go').resolves(_returnsFetch())
    Sinon.stub(PaginatorPresenter, 'go').returns(pagination)
    Sinon.stub(ViewLicenceReturnsPresenter, 'go').returns(_returnsPresenter())
    Sinon.stub(ViewLicenceService, 'go').resolves(_licence())
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a return', () => {
    describe('and it has no optional fields', () => {
      it('will return all the mandatory data and default values for use in the licence returns page', async () => {
        const result = await ViewLicenceReturnsService.go(testId, auth, page)

        expect(result).to.equal({
          licenceName: 'fake licence',
          hasRequirements: true,
          returns: [],
          activeTab: 'returns',
          pagination: { page: 1 }
        })
      })
    })
  })
})

function _licence () {
  return { licenceName: 'fake licence' }
}

function _returnsFetch () {
  return {
    pagination: { total: 1 },
    returns: []
  }
}

function _returnsPresenter () {
  return {
    returns: [],
    activeTab: 'returns'
  }
}
