package com.helen

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.UUID

fun ResultRow.toLocationDto() = LocationDto(
    id = this[Locations.id].value.toString(),
    name = this[Locations.name],
    lightExposure = this[Locations.lightExposure]
)

fun Application.configureLocationRoutes() {
    routing {
        authenticate("auth-jwt") {
            route("/locations") {
                get {
                    val userId = call.userId()
                    val result = transaction {
                        Locations.selectAll().where { Locations.userId eq userId }.map { it.toLocationDto() }
                    }
                    call.respond(result)
                }
                post {
                    val userId = call.userId()
                    val req = call.receive<CreateLocationRequest>()
                    val id = transaction {
                        Locations.insertAndGetId {
                            it[Locations.userId] = userId
                            it[name] = req.name
                            it[lightExposure] = req.lightExposure
                        }
                    }
                    call.respond(HttpStatusCode.Created, mapOf("id" to id.value.toString()))
                }
                delete("/{id}") {
                    val userId = call.userId()
                    val id = call.parameters["id"]?.let(UUID::fromString)
                        ?: return@delete call.respond(HttpStatusCode.BadRequest)
                    val deleted = transaction {
                        Locations.deleteWhere { (Locations.id eq id) and (Locations.userId eq userId) }
                    }
                    if (deleted > 0) call.respond(HttpStatusCode.NoContent) else call.respond(HttpStatusCode.NotFound)
                }
            }
        }
    }
}