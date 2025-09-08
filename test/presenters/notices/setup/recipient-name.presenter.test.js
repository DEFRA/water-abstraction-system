'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateReferenceCode } = require('../../../support/helpers/notification.helper.js')

// Thing under test
const RecipientNamePresenter = require('../../../../app/presenters/notices/setup/recipient-name.presenter.js')

describe('Notices - Setup - Recipient Name Presenter', () => {
  let referenceCode
  let session

  beforeEach(() => {
    referenceCode = generateReferenceCode()

    session = { id: '123', referenceCode }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = RecipientNamePresenter.go(session)

      expect(result).to.equal({
        backLink: { text: 'Back', href: `/system/notices/setup/${session.id}/check` },
        name: undefined,
        pageTitle: "Enter the recipient's name",
        pageTitleCaption: `Notice ${referenceCode}`
      })
    })

    describe('and the name has previously been set', () => {
      beforeEach(() => {
        session.contactName = 'Ronald Weasley'
      })

      it('returns previously set name', () => {
        const result = RecipientNamePresenter.go(session)

        expect(result.name).to.equal('Ronald Weasley')
      })
    })
  })
})
