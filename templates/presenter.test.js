'use strict'

// Thing under test
const __MODULE_NAME__ = require('__REQUIRE_PATH__')

describe('__DESCRIBE_LABEL__', () => {
  let session

  beforeEach(() => {
    session = {}
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = __MODULE_NAME__.go(session)

      expect(result).toEqual({
        backLink: {
          href: '',
          text: 'Back'
        },
        pageTitle: ''
      })
    })
  })
})
