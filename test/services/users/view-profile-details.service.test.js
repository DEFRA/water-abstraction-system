'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers

// Things we want to stub
const UserModel = require('../../../app/models/user.model.js')

// Thing under test
const ViewProfileDetailsService = require('../../../app/services/users/view-profile-details.service.js')

describe('ViewProfileDetailsService', () => {
  let userModelQueryStub, findByIdStub, selectStub, yarStub

  const fakeUserId = 123
  const fakeProfileDetails = {
    address: '123 Test St',
    email: 'test@example.com',
    jobTitle: 'Developer',
    name: 'Test User',
    tel: '0123456789'
  }
  const fakeNotification = 'Profile updated!'

  beforeEach(() => {
    // Stub UserModel.query().findById().select()
    selectStub = Sinon.stub().resolves(fakeProfileDetails)
    findByIdStub = Sinon.stub().returns({ select: selectStub })
    userModelQueryStub = Sinon.stub(UserModel, 'query').returns({ findById: findByIdStub })
    yarStub = { flash: Sinon.stub().withArgs('notification').returns([]) }
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('returns the correct page title: Profile details', async () => {
    const result = await ViewProfileDetailsService.go(fakeUserId, yarStub)

    expect(result).to.include({ pageTitle: 'Profile details' })
  })

  it('returns the navigation links', async () => {
    const result = await ViewProfileDetailsService.go(fakeUserId, yarStub)

    expect(result).to.include('navigationLinks')
    expect(result.navigationLinks).to.include([
      {
        active: true,
        href: '/contact-information',
        text: 'Contact information'
      }
    ])
  })

  it('returns formatted data with all expected fields', async () => {
    const result = await ViewProfileDetailsService.go(fakeUserId, yarStub)

    expect(result).to.include(fakeProfileDetails)
  })

  it('does not return data fields if userId not found (should this error?)', async () => {
    // Simulate not found: select resolves to null
    selectStub.resolves(null)

    const result = await ViewProfileDetailsService.go(999, yarStub)

    expect(userModelQueryStub.calledOnce).to.be.true()
    expect(findByIdStub.calledWith(999)).to.be.true()
    expect(selectStub.calledOnce).to.be.true()
    expect(result).to.not.include(Object.keys(fakeProfileDetails))
  })

  it('throws if UserModel.query throws', async () => {
    userModelQueryStub.restore()
    Sinon.stub(UserModel, 'query').throws(new Error('DB error'))

    let error
    try {
      await ViewProfileDetailsService.go(fakeUserId, yarStub)
    } catch (err) {
      error = err
    }
    expect(error).to.exist()
    expect(error.message).to.equal('DB error')
  })

  it('returns notification from yar.flash if present', async () => {
    yarStub = { flash: Sinon.stub().withArgs('notification').returns([fakeNotification]) }

    const result = await ViewProfileDetailsService.go(fakeUserId, yarStub)

    expect(yarStub.flash.calledWith('notification')).to.be.true()
    expect(result.notification).to.equal(fakeNotification)
  })

  it('returns undefined notification if yar.flash has no notifications', async () => {
    const result = await ViewProfileDetailsService.go(fakeUserId, yarStub)

    expect(result.notification).to.be.undefined()
  })
})
