'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things to stub
const UserModel = require('../../../app/models/user.model.js')

// Thing under test
const SubmitProfileDetailsService = require('../../../app/services/users/submit-profile-details.service.js')

describe('Users - Submit profile details service', () => {
  const userId = 123

  let findByIdStub
  let patchStub
  let payload
  let userModelQueryStub
  let yarStub

  beforeEach(() => {
    // Stub UserModel.query().findById().patch()
    patchStub = Sinon.stub().resolves()
    findByIdStub = Sinon.stub().returns({ patch: patchStub })
    userModelQueryStub = Sinon.stub(UserModel, 'query').returns({ findById: findByIdStub })
    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          address: '123 Test St',
          email: 'test@environment-agency.gov.uk',
          jobTitle: 'Developer',
          name: 'Test User',
          tel: '0123456789'
        }
      })

      it('saves the user details', async () => {
        const result = await SubmitProfileDetailsService.go(userId, payload, yarStub)

        expect(patchStub.calledOnce).to.be.true()
        expect(findByIdStub.calledOnceWith(userId)).to.be.true()
        expect(
          patchStub.calledOnceWith({
            'userData:contactDetails.address': payload.address,
            'userData:contactDetails.email': payload.email,
            'userData:contactDetails.jobTitle': payload.jobTitle,
            'userData:contactDetails.name': payload.name,
            'userData:contactDetails.tel': payload.tel
          })
        ).to.be.true()
        expect(result.navigationLinks).to.be.an.array()
      })

      it('flashes a notification of successful update', async () => {
        await SubmitProfileDetailsService.go(userId, payload, yarStub)

        expect(
          yarStub.flash.calledOnceWith('notification', {
            title: 'Updated',
            text: 'Profile details saved'
          })
        ).to.be.true()
      })

      describe('and the payload has empty or missing values', () => {
        it('saves missing values as empty strings', async () => {
          await SubmitProfileDetailsService.go(userId, {}, yarStub)

          expect(
            patchStub.calledOnceWith({
              'userData:contactDetails.address': '',
              'userData:contactDetails.email': '',
              'userData:contactDetails.jobTitle': '',
              'userData:contactDetails.name': '',
              'userData:contactDetails.tel': ''
            })
          ).to.be.true()
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {
          email: 'invalidtestemail'
        }
      })

      it('does not save', async () => {
        await SubmitProfileDetailsService.go(userId, payload, yarStub)

        expect(userModelQueryStub.notCalled).to.be.true()
      })

      it('returns the details required to redisplay the page including validation errors', async () => {
        const result = await SubmitProfileDetailsService.go(userId, payload, yarStub)

        expect(result).to.include({
          pageTitle: 'Profile details',
          error: {
            email: 'Enter a valid email',
            errorList: [{ href: '#email', text: 'Enter a valid email' }]
          },
          ...payload
        })
      })

      it('does not flash a notification', async () => {
        await SubmitProfileDetailsService.go(userId, payload, yarStub)

        expect(yarStub.flash.notCalled).to.be.true()
      })
    })
  })

  describe('when the service errors', () => {
    beforeEach(() => {
      userModelQueryStub.restore()
      Sinon.stub(UserModel, 'query').throws(new Error('Model query error'))
    })

    it('throws the error', async () => {
      const error = await expect(SubmitProfileDetailsService.go(userId, {}, yarStub)).to.reject()

      expect(error).to.exist()
      expect(error.message).to.equal('Model query error')
    })
  })
})
