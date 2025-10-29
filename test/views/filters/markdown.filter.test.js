'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const MarkdownFilter = require('../../../app/views/filters/markdown.filter.js')

describe('Markdown filter', () => {
  let testMarkdown

  before(() => {
    testMarkdown = _testMarkdown()
  })

  describe('when provided with a valid markdown string', () => {
    it('correctly converts the markdown to HTML', async () => {
      const result = await MarkdownFilter.markdown(testMarkdown)

      expect(result).to.equal(
        '<p>Hello,</p>\n' +
          '<p>This is a reminder that your water abstraction licence 4/30/12/*G/0303/R02 Swaton will expire in 4 months&#39; time.</p>\n' +
          '<p>If you have already sent your renewal application, or do not want to renew this licence, you can ignore this email.</p>\n' +
          '<h1>How to renew your licence</h1>\n' +
          '<blockquote>\n' +
          '<p>You need to apply to renew this licence at least 3 months before it expires.</p>\n' +
          '</blockquote>\n' +
          '<p>If you want to apply to renew your licence, you should either:</p>\n' +
          '<ul>\n' +
          '<li>check for a letter we have sent you by post, which includes an application form to complete and send to us</li>\n' +
          '<li>contact us by phone or email: <a href="https://www.gov.uk/government/organisations/environment-agency#org-contacts">https://www.gov.uk/government/organisations/environment-agency#org-contacts</a></li>\n' +
          '</ul>\n' +
          '<h1>What happens once this licence expires</h1>\n' +
          '<p>If we receive your completed application at least 3 months before this licence expires, you can:</p>\n' +
          '<ul>\n' +
          '<li>carry on abstracting water, even if your licence expires before we make a decision about your application</li>\n' +
          '<li>keep the same conditions as your current licence, until we make a decision about your application</li>\n' +
          '</ul>\n' +
          '<p>If we receive your application after this licence ends:</p>\n' +
          '<ul>\n' +
          '<li>you should stop abstracting water until we make a decision about your application</li>\n' +
          '<li>we may not grant your licence application</li>\n' +
          '<li>we may not grant your licence application with the same conditions as your current licence</li>\n' +
          '<li>we may have to advertise your licence application and charge you a fee for this</li>\n' +
          '</ul>\n' +
          '<blockquote>\n' +
          '<p>If you are unsure an email is from the Environment Agency:</p>\n' +
          '</blockquote>\n' +
          '<ul>\n' +
          '<li>do not reply to it or click any links</li>\n' +
          '<li>forward it to <a href="mailto:enquiries@environment-agency.gov.uk">enquiries@environment-agency.gov.uk</a></li>\n' +
          '</ul>\n'
      )
    })
  })
})

function _testMarkdown() {
  return `Hello,

This is a reminder that your water abstraction licence 4/30/12/*G/0303/R02 Swaton will expire in 4 months' time.

If you have already sent your renewal application, or do not want to renew this licence, you can ignore this email.

# How to renew your licence

^ You need to apply to renew this licence at least 3 months before it expires.

If you want to apply to renew your licence, you should either:

* check for a letter we have sent you by post, which includes an application form to complete and send to us
* contact us by phone or email: https://www.gov.uk/government/organisations/environment-agency#org-contacts

# What happens once this licence expires

If we receive your completed application at least 3 months before this licence expires, you can:

* carry on abstracting water, even if your licence expires before we make a decision about your application
* keep the same conditions as your current licence, until we make a decision about your application

If we receive your application after this licence ends:

* you should stop abstracting water until we make a decision about your application
* we may not grant your licence application
* we may not grant your licence application with the same conditions as your current licence
* we may have to advertise your licence application and charge you a fee for this

^ If you are unsure an email is from the Environment Agency:

* do not reply to it or click any links
* forward it to enquiries@environment-agency.gov.uk`
}
