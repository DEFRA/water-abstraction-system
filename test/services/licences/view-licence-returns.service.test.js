'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const DatabaseSupport = require('../../support/database.js')
const ReturnVersionHelper = require('../../support/helpers/return-version.helper.js')
const FetchLicenceReturnsService = require('../../../app/services/licences/fetch-licence-returns.service.js')
const PaginatorPresenter = require('../../../app/presenters/paginator.presenter.js')
const ViewLicenceReturnsPresenter = require('../../../app/presenters/licences/view-licence-returns.presenter.js')
const ViewLicenceService = require('../../../app/services/licences/view-licence.service.js')

// Thing under test
const ViewLicenceReturnsService = require('../../../app/services/licences/view-licence-returns.service.js')

describe.only('View Licence service returns', () => {
  let returnVersion

  const page = 1
  const auth = {}
  const pagination = { page }

  beforeEach(async () => {
    await DatabaseSupport.clean()

    returnVersion = await ReturnVersionHelper.add()

    Sinon.stub(FetchLicenceReturnsService, 'go').resolves(_returnsFetch())
    Sinon.stub(PaginatorPresenter, 'go').returns(pagination)
    Sinon.stub(ViewLicenceReturnsPresenter, 'go').returns(_returnsPresenter())
    Sinon.stub(ViewLicenceService, 'go').resolves(_licence())
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe.only('when a return', () => {
    describe('and it has no optional fields', () => {
      it('will return all the mandatory data and default values for use in the licence returns page', async () => {
        const result = await ViewLicenceReturnsService.go(returnVersion.licenceId, auth, page)

        expect(result).to.equal({
          licenceName: 'fake licence',
          hasRequirements: true,
          returns: [],
          activeTab: 'returns',
          pagination: { page: 1 }
        })
      })
    })

    describe('the "hasRequirements" property', () => {
      describe('when the licence has requirements', () => {
        it('will return true', async () => {
          const result = await ViewLicenceReturnsService.go(returnVersion.licenceId, auth, page)

          expect(result.hasRequirements).to.be.true()
        })
      })

      describe('when the licence does not have requirements', () => {
        it('will return false', async () => {
          const result = await ViewLicenceReturnsService.go('a36e7556-fd86-4fbd-a20a-92fcb9f92836', auth, page)

          expect(result.hasRequirements).to.be.false()
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
