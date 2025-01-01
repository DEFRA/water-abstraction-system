'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Things we need to stub
const FetchCommunicationsService = require('../../../app/services/licences/fetch-communications.service.js')
const PaginatorPresenter = require('../../../app/presenters/paginator.presenter.js')
const ViewLicenceService = require('../../../app/services/licences/view-licence.service.js')

// Thing under test
const ViewLicenceCommunicationsService = require('../../../app/services/licences/view-licence-communications.service.js')

describe('View Licence Communications service', () => {
  const auth = {}
  const page = 1
  const pagination = { page }
  const testId = '2c80bd22-a005-4cf4-a2a2-73812a9861de'

  beforeEach(() => {
    Sinon.stub(ViewLicenceService, 'go').resolves({ licenceName: 'fake licence' })
    Sinon.stub(PaginatorPresenter, 'go').returns(pagination)
    Sinon.stub(FetchCommunicationsService, 'go').resolves({
      communications: [],
      pagination: { total: 1 }
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewLicenceCommunicationsService.go(testId, auth, page)

      expect(result).to.equal({
        activeTab: 'communications',
        communications: [],
        licenceName: 'fake licence',
        pagination: {
          page: 1
        }
      })
    })
  })
})
