const forkConsole = Object.assign({}, console)
const con = console
const bufferVars = {}
export { forkConsole as console, con, bufferVars }
