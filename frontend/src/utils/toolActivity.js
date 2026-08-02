export function markToolUsed(doneKey) {
  sessionStorage.setItem(`${doneKey}_done`, '1')
}

export function isToolUsed(doneKey) {
  return sessionStorage.getItem(`${doneKey}_done`) === '1'
}
