'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const FetchReturnLogService = require('../../../app/services/return-logs/fetch-return-log.service.js')

// Test helpers
const LicenceModel = require('../../../app/models/licence.model.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const ReturnLogModel = require('../../../app/models/return-log.model.js')
const ReturnLogHelper = require('../../support/helpers/return-log.helper.js')

// Thing under test
const ViewReturnLogService = require('../../../app/services/return-logs/view-return-log.service.js')

describe('View Return Log service', () => {
  let yarStub

  beforeEach(() => {
    const mockReturnLog = ReturnLogModel.fromJson({
      ...ReturnLogHelper.defaults({
        purposes: [{ alias: 'PURPOSE_ALIAS' }]
      }),
      licence: LicenceModel.fromJson(LicenceHelper.defaults())
    })

    Sinon.stub(FetchReturnLogService, 'go').resolves(mockReturnLog)

    yarStub = {
      flash: Sinon.stub().returns(['BANNER_MESSAGE'])
    }
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('correctly fetches return log and transforms it via the presenter', async () => {
    const result = await ViewReturnLogService.go('RETURN_ID', 0, { credentials: { scope: ['returns'] } }, yarStub)

    // We only check a couple of items here -- the key thing is that the mock return log was fetched and successfully
    // passed to the presenter
    expect(result).to.include({
      activeNavBar: 'search',
      bannerMessage: 'BANNER_MESSAGE',
      pageTitle: 'Abstraction return'
    })
  })
})
