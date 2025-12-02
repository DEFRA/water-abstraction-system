'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ViewService = require('../../../app/services/licence-versions/view.service.js')

describe('Licence Versions - View service', () => {
  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewService.go()

      expect(result).to.equal({
        backLink: {
          href: '',
          text: 'Back'
        },
        pageTitle: 'Licence version starting',
        pageTitleCaption: 'Licence'
      })
    })
  })
})
