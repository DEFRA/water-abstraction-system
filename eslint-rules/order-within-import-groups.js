const SYNTAX_ORDER = ['all', 'single', 'multiple', 'none']

function importCategory(node) {
  if (node.specifiers.length === 0) {
    return 'none'
  }

  if (
    node.specifiers.some((specifier) => {
      return specifier.type === 'ImportNamespaceSpecifier'
    })
  ) {
    return 'all'
  }

  if (node.specifiers.length > 1) {
    return 'multiple'
  }

  return 'single'
}

function firstLocalName(node) {
  if (node.specifiers.length === 0) {
    return ''
  }

  return node.specifiers[0].local.name
}

function isExternal(source) {
  return !source.startsWith('.')
}

function sortKey(node) {
  return {
    node,
    external: isExternal(node.source.value),
    category: importCategory(node),
    name: firstLocalName(node)
  }
}

function compareEntries(first, second) {
  if (first.external !== second.external) {
    return first.external ? -1 : 1
  }

  const firstRank = SYNTAX_ORDER.indexOf(first.category)
  const secondRank = SYNTAX_ORDER.indexOf(second.category)

  if (firstRank !== secondRank) {
    return firstRank - secondRank
  }

  if (first.name < second.name) {
    return -1
  }

  if (first.name > second.name) {
    return 1
  }

  return 0
}

export default {
  meta: {
    type: 'layout',
    docs: {
      description:
        'Within each blank-line-separated group of imports, require external/builtin imports before internal (relative) ones'
    },
    fixable: 'code',
    schema: [],
    messages: {
      unordered: 'Imports in this group should have external/builtin imports before internal ones'
    }
  },
  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode()

    return {
      'Program:exit'(program) {
        const imports = program.body.filter((statement) => {
          return statement.type === 'ImportDeclaration'
        })

        if (imports.length < 2) {
          return
        }

        const runs = []
        let currentRun = [imports[0]]

        for (let i = 1; i < imports.length; i++) {
          const previous = imports[i - 1]
          const current = imports[i]

          if (current.loc.start.line - previous.loc.end.line > 1) {
            runs.push(currentRun)
            currentRun = [current]
          } else {
            currentRun.push(current)
          }
        }

        runs.push(currentRun)

        for (const run of runs) {
          if (run.length < 2) {
            continue
          }

          const entries = run.map(sortKey)
          const sortedEntries = [...entries].sort(compareEntries)

          const alreadySorted = sortedEntries.every((entry, index) => {
            return entry.node === run[index]
          })

          if (alreadySorted) {
            continue
          }

          context.report({
            node: run[0],
            messageId: 'unordered',
            fix(fixer) {
              const newText = sortedEntries
                .map((entry) => {
                  return sourceCode.getText(entry.node)
                })
                .join('\n')
              const start = run[0].range[0]
              const end = run[run.length - 1].range[1]

              return fixer.replaceTextRange([start, end], newText)
            }
          })
        }
      }
    }
  }
}
