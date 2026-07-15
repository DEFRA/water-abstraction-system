export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow a file mixing a default export with named exports; pick one style'
    },
    schema: [],
    messages: {
      mixed: 'This file mixes a default export with named exports. Use one export style only.'
    }
  },
  create(context) {
    return {
      'Program:exit'(node) {
        const defaultExports = node.body.filter((statement) => {
          return statement.type === 'ExportDefaultDeclaration'
        })
        const namedExports = node.body.filter((statement) => {
          return statement.type === 'ExportNamedDeclaration' || statement.type === 'ExportAllDeclaration'
        })

        if (defaultExports.length === 0 || namedExports.length === 0) {
          return
        }

        for (const exportNode of [...defaultExports, ...namedExports]) {
          context.report({ node: exportNode, messageId: 'mixed' })
        }
      }
    }
  }
}
