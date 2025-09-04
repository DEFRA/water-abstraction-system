'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const PostcodePresenter = require('../../../app/presenters/address/postcode.presenter.js')

describe('Address - Postcode Presenter', () => {
  const sessionId = 'fecd5f15-bacf-4b3d-bdcd-ef279a97b061'

  let session

  describe('when called with an empty session object', () => {
    beforeEach(async () => {
      session = {
        id: sessionId,
        address: {}
      }
    })

    it('returns page data for the view', () => {
      const result = PostcodePresenter.go(session)

      expect(result).to.equal({
        backLink: `/system/address/${session.id}/postcode`,
        internationalLink: `/system/address/${session.id}/international`,
        pageTitle: 'Enter a UK postcode',
        postcode: null
      })
    })
  })

  describe('when called with a name saved in the session', () => {
    beforeEach(async () => {
      session = {
        id: sessionId,
        address: {
          backLink: {
            href: `/system/notices/setup/${sessionId}/contact-type`
          }
        },
        contactName: 'Fake Person'
      }
    })

    it('returns page data for the view', () => {
      const result = PostcodePresenter.go(session)

      expect(result).to.equal({
        backLink: `/system/notices/setup/${session.id}/contact-type`,
        internationalLink: `/system/address/${session.id}/international`,
        pageTitle: 'Enter a UK postcode',
        postcode: null
      })
    })
  })

  describe('when called with a contactType object and a saved postcode', () => {
    beforeEach(async () => {
      session = {
        id: sessionId,
        address: {
          backLink: {
            href: `/system/notices/setup/${sessionId}/contact-type`
          },
          postcode: 'SW1A 1AA'
        },
        contactName: 'Fake Person'
      }
    })

    it('returns page data for the view', () => {
      const result = PostcodePresenter.go(session)

      expect(result).to.equal({
        backLink: `/system/notices/setup/${session.id}/contact-type`,
        internationalLink: `/system/address/${session.id}/international`,
        pageTitle: 'Enter a UK postcode',
        postcode: 'SW1A 1AA'
      })
    })
  })
})
