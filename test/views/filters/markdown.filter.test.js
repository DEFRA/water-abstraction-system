'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Thing under test
const MarkdownFilter = require('../../../app/views/filters/markdown.filter.js')

describe('Markdown filter', () => {
  afterEach(() => {
    Sinon.restore()
  })

  describe('when provided with a valid markdown string', () => {
    describe('when "Marked" has been set on globalThis via the plugin', () => {
      beforeEach(() => {
        globalThis.GlobalMarked = {
          parse: Sinon.stub().returns('<h1>How to renew your licence</h1>\n<p>This is pretend test.</p>')
        }
      })

      afterEach(() => {
        delete globalThis.GlobalMarked
      })

      it('correctly converts the markdown to HTML', async () => {
        const result = await MarkdownFilter.markdown('# Test\n\nThis is pretend test.')

        expect(result).to.equal('<h1>How to renew your licence</h1>\n<p>This is pretend test.</p>')
      })
    })

    describe('when "Marked" has not been set on globalThis via the plugin', () => {
      it('returns the input', async () => {
        const result = await MarkdownFilter.markdown('# Test\n\nThis is pretend test.')

        expect(result).to.equal('# Test\n\nThis is pretend test.')
      })
    })
  })
})
