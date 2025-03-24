'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helper
const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')

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

    Sinon.stub(FeatureFlagsConfig, 'enableNotificationsView').value(true)
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
        enableNotificationsView: true,
        licenceName: 'fake licence',
        pagination: {
          page: 1
        }
      })
    })
  })
})
