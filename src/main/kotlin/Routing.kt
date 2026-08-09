package com.helen

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Application.configureRouting() {
    configurePlantRoutes()
    configureLocationRoutes()
    configureWateringRoutes()
    routing {
        get("/") {
            call.respondText("Planddy backend running")
        }
    }
}