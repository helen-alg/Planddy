package com.helen


fun main(args: Array<String>) {
    DatabaseFactory.init()
    io.ktor.server.netty.EngineMain.main(args)
}

