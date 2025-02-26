import type { ShikiTransformer } from 'shiki'
import { addClassToHast } from 'shiki'
import { createCommentNotationTransformer } from '../utils'

export interface TransformerNotationMapOptions {
  classMap?: Record<string, string | string[]>
  /**
   * Class added to the <pre> element when the current code has diff
   */
  classActivePre?: string
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function transformerNotationMap(
  options: TransformerNotationMapOptions = {},
  name = '@shikijs/transformers:notation-map',
): ShikiTransformer {
  const {
    classMap = {},
    classActivePre = undefined,
  } = options

  return createCommentNotationTransformer(
    name,
    new RegExp(`\\s*(?://|/\\*|<!--|#)\\s+\\[!code (${Object.keys(classMap).map(escapeRegExp).join('|')})(:\\d+)?\\]\\s*(?:\\*/|-->)?`),
    function ([_, match, range = ':1'], _line, _comment, lines, index) {
      const lineNum = Number.parseInt(range.slice(1), 10)
      lines
        .slice(index, index + lineNum)
        .forEach((line) => {
          addClassToHast(line, classMap[match])
        })
      if (classActivePre)
        addClassToHast(this.pre, classActivePre)
      return true
    },
  )
}
