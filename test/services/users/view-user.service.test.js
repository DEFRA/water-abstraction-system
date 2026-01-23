'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we want to stub
const UserModel = require('../../../app/models/user.model.js')
const ViewExternalUserService = require('../../../app/services/users/view-external-user.service.js')
const ViewInternalUserService = require('../../../app/services/users/view-internal-user.service.js')

// Thing under test
const ViewUserService = require('../../../app/services/users/view-user.service.js')

describe('Users - View User service', () => {
  let viewExternalUserServiceStub
  let viewInternalUserServiceStub

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the user is an internal user', () => {
    const userId = 100010
    const uuid = '00000000-0000-0000-0000-000000000001'
    const internalUserData = {
      backLink: {
        href: '/',
        text: 'Go back to search'
      },
      id: uuid,
      lastSignedIn: 'Last signed in 6 October 2022 at 10:00:00',
      pageTitle: 'User basic.access@wrls.gov.uk',
      pageTitleCaption: 'Internal',
      permissions: 'Basic access',
      status: 'enabled'
    }

    beforeEach(() => {
      Sinon.stub(UserModel, 'query').returns({
        findOne: Sinon.stub().returnsThis(),
        select: Sinon.stub().resolves({ application: 'water_admin', id: uuid })
      })

      viewInternalUserServiceStub = Sinon.stub(ViewInternalUserService, 'go').resolves(internalUserData)
      viewExternalUserServiceStub = Sinon.stub(ViewExternalUserService, 'go')
    })

    it('returns the internal user page data', async () => {
      const result = await ViewUserService.go(userId)

      expect(viewInternalUserServiceStub.calledWith(uuid)).to.be.true()
      expect(viewExternalUserServiceStub.called).to.be.false()
      expect(result).to.equal(internalUserData)
    })
  })

  describe('when the user is an external user', () => {
    const userId = 100007
    const uuid = '00000000-0000-0000-0000-000000000007'
    const externalUserData = {
      backLink: {
        href: '/',
        text: 'Go back to search'
      },
      id: uuid,
      lastSignedIn: 'Last signed in 6 October 2022 at 10:00:00',
      pageTitle: 'User external@example.co.uk',
      pageTitleCaption: 'External',
      status: 'enabled'
    }

    beforeEach(() => {
      Sinon.stub(UserModel, 'query').returns({
        findOne: Sinon.stub().returnsThis(),
        select: Sinon.stub().resolves({ application: 'water_vml', id: uuid })
      })

      viewExternalUserServiceStub = Sinon.stub(ViewExternalUserService, 'go').resolves(externalUserData)
      viewInternalUserServiceStub = Sinon.stub(ViewInternalUserService, 'go')
    })

    it('returns the external user page data', async () => {
      const result = await ViewUserService.go(userId)

      expect(viewExternalUserServiceStub.calledWith(uuid)).to.be.true()
      expect(viewInternalUserServiceStub.called).to.be.false()
      expect(result).to.equal(externalUserData)
    })
  })
})
