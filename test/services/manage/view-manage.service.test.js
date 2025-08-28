'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ViewManageService = require('../../../app/services/manage/view-manage.service.js')

describe('Manage - View service', () => {
  let sandbox
  let userAuth

  beforeEach(() => {
    sandbox = Sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('when called', () => {
    beforeEach(() => {
      userAuth = { credentials: { scope: ['billing'] } }
    })

    it('returns page data for the view', async () => {
      const result = await ViewManageService.go(userAuth)

      expect(result).to.equal({
        pageTitle: 'Manage reports and notices',
        activeNavBar: 'manage',
        showKPIs: true
      })
    })
  })
})
