/**
 * Clog spits out logs to the client via websockets
 */
let io

const start = (o) => {
    io = o

    io.on('connection', socket => {
        socket.emit("Log server is connected!")
    })
}

const log = (text, state) => {
    io.emit("log", text, state)
}

module.exports = { start, log }