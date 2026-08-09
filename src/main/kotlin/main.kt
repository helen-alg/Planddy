package com.helen

import io.ktor.server.engine.*
import io.ktor.server.application.*

fun main(args: Array<String>) {
    DatabaseFactory.init()

    io.ktor.server.netty.EngineMain.main(args)
}
