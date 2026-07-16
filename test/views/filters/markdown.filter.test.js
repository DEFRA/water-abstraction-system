// Test framework
import { describe, expect, it } from 'vitest'

// Thing under test
import MarkdownFilter from '../../../app/views/filters/markdown.filter.js'

describe('Markdown filter', () => {
  describe('when provided with a valid markdown string', () => {
    it('correctly converts the markdown to HTML', async () => {
      const result = await MarkdownFilter('# Test\n\nThis is pretend test.')

      expect(result).toEqual('<h1>Test</h1>\n<p>This is pretend test.</p>\n')
    })

    describe('and it contains carets used to denote a blockquote', () => {
      it('converts them to standard markdown blockquotes before parsing', async () => {
        const result = await MarkdownFilter('^ This is a blockquote')

        expect(result).toEqual('<blockquote>\n<p>This is a blockquote</p>\n</blockquote>\n')
      })
    })
  })
})
