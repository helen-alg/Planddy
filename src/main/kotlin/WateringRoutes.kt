package com.helen

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.Instant
import java.util.UUID

fun ResultRow.toWateringEventDto() = WateringEventDto(
    id = this[WateringEvents.id].value.toString(),
    plantId = this[WateringEvents.plantId].value.toString(),
    wateredAt = this[WateringEvents.wateredAt].toString(),
    note = this[WateringEvents.note]
)

// Prüft, ob die Pflanze existiert UND dem Test-User gehört
private fun plantOwnedByTestUser(plantId: UUID): Boolean = transaction {
    Plants.selectAll()
        .where { (Plants.id eq plantId) and (Plants.userId eq TEST_USER_ID) }
        .empty().not()
}

fun Application.configureWateringRoutes() {
    routing {
        route("/plants/{plantId}/watering-events") {
            get {
                val plantId = call.parameters["plantId"]?.let(UUID::fromString)
                    ?: return@get call.respond(HttpStatusCode.BadRequest)
                if (!plantOwnedByTestUser(plantId)) return@get call.respond(HttpStatusCode.NotFound)

                val result = transaction {
                    WateringEvents.selectAll().where { WateringEvents.plantId eq plantId }
                        .map { it.toWateringEventDto() }
                }
                call.respond(result)
            }
            post {
                val plantId = call.parameters["plantId"]?.let(UUID::fromString)
                    ?: return@post call.respond(HttpStatusCode.BadRequest)
                if (!plantOwnedByTestUser(plantId)) return@post call.respond(HttpStatusCode.NotFound)

                val req = call.receive<CreateWateringEventRequest>()
                val id = transaction {
                    WateringEvents.insertAndGetId {
                        it[WateringEvents.plantId] = plantId
                        it[wateredAt] = req.wateredAt?.let(Instant::parse) ?: Instant.now()
                        it[note] = req.note
                    }
                }
                call.respond(HttpStatusCode.Created, mapOf("id" to id.value.toString()))
            }
        }
    }
}