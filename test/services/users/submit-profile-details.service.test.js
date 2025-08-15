'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things to stub
const UserModel = require('../../../app/models/user.model.js')
const ProfileDetailsValidator = require('../../../app/validators/users/profile-details.validator.js')

// Thing under test
const SubmitProfileDetailsService = require('../../../app/services/users/submit-profile-details.service.js')

describe('SubmitProfileDetailsService', () => {
  let userModelQueryStub, findByIdStub, patchStub, yarStub, validatorStub

  const fakeUserId = 123
  const fakePayload = {
    address: '123 Test St',
    email: 'test@example.com',
    jobTitle: 'Developer',
    name: 'Test User',
    tel: '0123456789'
  }
  const fakeErrorDetails = [
    { context: { key: 'email' }, message: 'Invalid email' },
    { context: { key: 'name' }, message: 'Name required' }
  ]

  beforeEach(() => {
    // Stub UserModel.query().findById().patch()
    patchStub = Sinon.stub().resolves()
    findByIdStub = Sinon.stub().returns({ patch: patchStub })
    userModelQueryStub = Sinon.stub(UserModel, 'query').returns({ findById: findByIdStub })
    yarStub = { flash: Sinon.stub() }
    validatorStub = Sinon.stub(ProfileDetailsValidator, 'go')
    validatorStub.returns({ error: null })
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('validates payload and saves user details if valid', async () => {
    const result = await SubmitProfileDetailsService.go(fakeUserId, fakePayload, yarStub)

    expect(validatorStub.calledOnceWith(fakePayload)).to.be.true()
    expect(patchStub.calledOnce).to.be.true()
    expect(findByIdStub.calledOnceWith(fakeUserId)).to.be.true()
    expect(
      patchStub.calledOnceWith({
        'userData:contactDetails.address': fakePayload.address,
        'userData:contactDetails.email': fakePayload.email,
        'userData:contactDetails.jobTitle': fakePayload.jobTitle,
        'userData:contactDetails.name': fakePayload.name,
        'userData:contactDetails.tel': fakePayload.tel
      })
    ).to.be.true()
    expect(result).to.include({
      pageTitle: 'Profile details',
      error: null,
      ...fakePayload
    })
    expect(result.navigationLinks).to.be.an.array()
  })

  it('saves missing values as empty strings', async () => {
    await SubmitProfileDetailsService.go(fakeUserId, {}, yarStub)

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

  it('returns validation errors and does not save if invalid', async () => {
    validatorStub.returns({ error: { details: fakeErrorDetails } })

    const result = await SubmitProfileDetailsService.go(fakeUserId, fakePayload, yarStub)

    expect(validatorStub.calledOnceWith(fakePayload)).to.be.true()
    expect(userModelQueryStub.notCalled).to.be.true()
    expect(result.error).to.include({ email: 'Invalid email', name: 'Name required' })
    expect(result.error.errorList).to.equal([
      { href: '#email', text: 'Invalid email' },
      { href: '#name', text: 'Name required' }
    ])
    expect(result.pageTitle).to.equal('Profile details')
  })

  it('flashes a notification on successful update', async () => {
    await SubmitProfileDetailsService.go(fakeUserId, fakePayload, yarStub)

    expect(validatorStub.calledOnceWith(fakePayload)).to.be.true()
    expect(
      yarStub.flash.calledOnceWith('notification', {
        title: 'Updated',
        text: 'Profile details saved'
      })
    ).to.be.true()
  })

  it('does not flash a notification on unsuccessful update', async () => {
    validatorStub.returns({ error: { details: fakeErrorDetails } })

    await SubmitProfileDetailsService.go(fakeUserId, fakePayload, yarStub)

    expect(validatorStub.calledOnceWith(fakePayload)).to.be.true()
    expect(yarStub.flash.notCalled).to.be.true()
  })

  it('propagates errors thrown by UserModel.query().findById().patch', async () => {
    userModelQueryStub.restore()
    Sinon.stub(UserModel, 'query').throws(new Error('DB error'))

    let error
    try {
      await SubmitProfileDetailsService.go(fakeUserId, {}, yarStub)
    } catch (e) {
      error = e
    }

    expect(error).to.exist()
    expect(error.message).to.equal('DB error')
  })
})
