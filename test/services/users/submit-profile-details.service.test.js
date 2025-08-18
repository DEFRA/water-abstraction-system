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
  const validUserId = 123

  let userModelQueryStub
  let findByIdStub
  let patchStub
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
      const validPayload = {
        address: '123 Test St',
        email: 'test@environment-agency.gov.uk',
        jobTitle: 'Developer',
        name: 'Test User',
        tel: '0123456789'
      }

      it('saves the user details', async () => {
        const result = await SubmitProfileDetailsService.go(validUserId, validPayload, yarStub)

        expect(patchStub.calledOnce).to.be.true()
        expect(findByIdStub.calledOnceWith(validUserId)).to.be.true()
        expect(
          patchStub.calledOnceWith({
            'userData:contactDetails.address': validPayload.address,
            'userData:contactDetails.email': validPayload.email,
            'userData:contactDetails.jobTitle': validPayload.jobTitle,
            'userData:contactDetails.name': validPayload.name,
            'userData:contactDetails.tel': validPayload.tel
          })
        ).to.be.true()
        expect(result).to.include({
          pageTitle: 'Profile details',
          error: null,
          ...validPayload
        })
        expect(result.navigationLinks).to.be.an.array()
      })

      it('flashes a notification of successful update', async () => {
        await SubmitProfileDetailsService.go(validUserId, validPayload, yarStub)

        expect(
          yarStub.flash.calledOnceWith('notification', {
            title: 'Updated',
            text: 'Profile details saved'
          })
        ).to.be.true()
      })

      describe('and the payload has empty or missing values', () => {
        it('saves missing values as empty strings', async () => {
          await SubmitProfileDetailsService.go(validUserId, {}, yarStub)

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

      describe('but the database update fails', () => {
        it('propagates errors thrown by the database update', async () => {
          userModelQueryStub.restore()
          Sinon.stub(UserModel, 'query').throws(new Error('DB error'))

          let error
          try {
            await SubmitProfileDetailsService.go(validUserId, {}, yarStub)
          } catch (e) {
            error = e
          }

          expect(error).to.exist()
          expect(error.message).to.equal('DB error')
        })
      })
    })

    describe('with an invalid payload', () => {
      const invalidPayload = {
        email: 'invalidtestemail'
      }
      const expectedValidationResult = {
        email: 'Enter a valid email',
        errorList: [{ href: '#email', text: 'Enter a valid email' }]
      }

      it('does not save', async () => {
        await SubmitProfileDetailsService.go(validUserId, invalidPayload, yarStub)

        expect(userModelQueryStub.notCalled).to.be.true()
      })

      it('returns the details required to redisplay the page including validation errors', async () => {
        const result = await SubmitProfileDetailsService.go(validUserId, invalidPayload, yarStub)

        expect(result).to.include({
          pageTitle: 'Profile details',
          error: expectedValidationResult,
          ...invalidPayload
        })
      })

      it('does not flash a notification', async () => {
        await SubmitProfileDetailsService.go(validUserId, invalidPayload, yarStub)

        expect(yarStub.flash.notCalled).to.be.true()
      })
    })
  })
})
