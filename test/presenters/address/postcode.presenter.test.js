'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const PostcodePresenter = require('../../../app/presenters/address/postcode.presenter.js')

describe('Address - Postcode Presenter', () => {
  let session

  describe('when called with an empty session object', () => {
    beforeEach(async () => {
      session = {
        id: 'fecd5f15-bacf-4b3d-bdcd-ef279a97b061'
      }
    })

    it('returns page data for the view', () => {
      const result = PostcodePresenter.go(session)

      expect(result).to.equal({
        backLink: `/system/address/${session.id}/postcode`,
        pageTitle: 'Enter a UK postcode',
        postcode: null
      })
    })
  })

  describe('when called with an contactType object', () => {
    beforeEach(async () => {
      session = {
        id: 'fecd5f15-bacf-4b3d-bdcd-ef279a97b061',
        contactType: {
          type: 'post'
        }
      }
    })

    it('returns page data for the view', () => {
      const result = PostcodePresenter.go(session)

      expect(result).to.equal({
        backLink: `/system/notices/setup/${session.id}/select-recipients`,
        pageTitle: 'Enter a UK postcode',
        postcode: null
      })
    })
  })

  describe('when called with a contactType object and a saved postcode', () => {
    beforeEach(async () => {
      session = {
        id: 'fecd5f15-bacf-4b3d-bdcd-ef279a97b061',
        address: {
          postcode: 'SW1A 1AA'
        },
        contactType: {
          type: 'post'
        }
      }
    })
    it('returns page data for the view', () => {
      const result = PostcodePresenter.go(session)

      expect(result).to.equal({
        backLink: `/system/notices/setup/${session.id}/select-recipients`,
        pageTitle: 'Enter a UK postcode',
        postcode: 'SW1A 1AA'
      })
    })
  })
})
