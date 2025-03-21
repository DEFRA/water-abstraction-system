'use strict'

const { marked } = require('marked')

function markdown(input = '') {
  const replacedCaret = input.replace(/\^/gm, '>')

  return marked.parse(replacedCaret)
}

module.exports = {
  markdown
}
