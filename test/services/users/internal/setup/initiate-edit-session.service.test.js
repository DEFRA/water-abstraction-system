'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModel = require('../../../../../app/models/session.model.js')

// Things we need to stub
const FetchUserDetailsDal = require('../../../../../app/dal/users/internal/fetch-user-details.dal.js')

// Thing under test
const InitiateEditSessionService = require('../../../../../app/services/users/internal/setup/initiate-edit-session.service.js')

describe('Users - Internal - Setup - Initiate Edit Session service', () => {
  const id = 'd26787fc-6df4-4606-aa9d-c04951b3761f'

  let user

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('for a user that has no groups or roles', () => {
      beforeEach(() => {
        user = {
          $status: Sinon.stub().returns('enabled'),
          groups: [],
          id,
          roles: [],
          username: 'bob.bobbles@environment-agency.gov.uk'
        }

        Sinon.stub(FetchUserDetailsDal, 'go').resolves(user)
      })

      it('returns the session Id and a formatted data object', async () => {
        const result = await InitiateEditSessionService.go(id)

        expect(result).to.equal({
          data: {
            email: 'bob.bobbles@environment-agency.gov.uk',
            permission: 'basic',
            status: 'enabled',
            user
          },
          id: result.id,
          email: 'bob.bobbles@environment-agency.gov.uk',
          permission: 'basic',
          status: 'enabled',
          user
        })
      })

      it('initiates the session for the journey ', async () => {
        const result = await InitiateEditSessionService.go(id)

        const matchingSession = await SessionModel.query().findById(result.id)

        expect(matchingSession.data).to.equal({
          email: 'bob.bobbles@environment-agency.gov.uk',
          permission: 'basic',
          status: 'enabled',
          user: {
            currentPermission: 'basic',
            currentStatus: 'enabled',
            groups: [],
            id,
            roles: [],
            username: 'bob.bobbles@environment-agency.gov.uk'
          }
        })
      })
    })

    describe('for a user that has groups and roles', () => {
      beforeEach(() => {
        user = {
          $status: Sinon.stub().returns('enabled'),
          groups: [{ group: 'nps' }],
          id,
          roles: [{ role: 'ar_approver' }],
          username: 'bob.bobbles@environment-agency.gov.uk'
        }

        Sinon.stub(FetchUserDetailsDal, 'go').resolves(user)
      })

      it('returns the session Id and a formatted data object', async () => {
        const result = await InitiateEditSessionService.go(id)

        expect(result).to.equal({
          data: {
            email: 'bob.bobbles@environment-agency.gov.uk',
            permission: 'nps_ar_approver',
            status: 'enabled',
            user
          },
          id: result.id,
          email: 'bob.bobbles@environment-agency.gov.uk',
          permission: 'nps_ar_approver',
          status: 'enabled',
          user
        })
      })

      it('initiates the session for the journey ', async () => {
        const result = await InitiateEditSessionService.go(id)

        const matchingSession = await SessionModel.query().findById(result.id)

        expect(matchingSession.data).to.equal({
          email: 'bob.bobbles@environment-agency.gov.uk',
          permission: 'nps_ar_approver',
          status: 'enabled',
          user: {
            currentPermission: 'nps_ar_approver',
            currentStatus: 'enabled',
            groups: [{ group: 'nps' }],
            id,
            roles: [{ role: 'ar_approver' }],
            username: 'bob.bobbles@environment-agency.gov.uk'
          }
        })
      })
    })
  })
})
