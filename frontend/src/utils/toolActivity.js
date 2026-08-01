import { TOOLS } from '../config/tools'

export function markToolUsed(doneKey) {
  sessionStorage.setItem(`${doneKey}_done`, '1')
}

export function isToolUsed(doneKey) {
  return sessionStorage.getItem(`${doneKey}_done`) === '1'
}

export function getToolsUsedCount() {
  return TOOLS.filter((tool) => isToolUsed(tool.doneKey)).length
}
