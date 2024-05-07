'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const ViewLicenceService = require('../../../app/services/licences/view-licence.service')
const ViewLicenceBillsPresenter = require('../../../app/presenters/licences/view-licence-bills.presenter')

// Thing under test
const ViewLicenceBillsService = require('../../../app/services/licences/view-licence-bills.service')

describe('View Licence service returns', () => {
  const testId = '2c80bd22-a005-4cf4-a2a2-73812a9861de'
  const auth = {}

  beforeEach(() => {
    Sinon.stub(ViewLicenceBillsPresenter, 'go').returns(_billsPresenter())
    Sinon.stub(ViewLicenceService, 'go').resolves(_licence())
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe.only('when a bill', () => {
    describe('and it has no optional fields', () => {
      it('will return all the mandatory data and default values for use in the licence returns page', async () => {
        const result = await ViewLicenceBillsService.go(testId, auth)

        expect(result).to.equal({
          licenceName: 'fake licence',
          bills: [],
          activeTab: 'bills'
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
