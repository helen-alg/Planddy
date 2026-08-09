package com.helen
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.LocalDate
import java.util.UUID
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq

fun ResultRow.toSpeciesDto() = SpeciesDto(
    id = this[Species.id].value.toString(),
    name = this[Species.name],
    careLight = this[Species.careLight],
    careWaterIntervalDays = this[Species.careWaterIntervalDays],
    careFertilizeIntervalDays = this[Species.careFertilizeIntervalDays],
    careTempRange = this[Species.careTempRange],
    description = this[Species.description],
    defaultImageUrl = this[Species.defaultImageUrl]
)

fun ResultRow.toPlantDto() = PlantDto(
    id = this[Plants.id].value.toString(),
    speciesId = this[Plants.speciesId].value.toString(),
    locationId = this[Plants.locationId]?.value?.toString(),
    nickname = this[Plants.nickname],
    acquiredAt = this[Plants.acquiredAt]?.toString(),
    waterIntervalOverrideDays = this[Plants.waterIntervalOverrideDays],
    fertilizeIntervalOverrideDays = this[Plants.fertilizeIntervalOverrideDays]
)



fun Application.configurePlantRoutes() {
    println(">>> configurePlantRoutes() wurde aufgerufen!")
    routing {
        route("/species") {
            get {
                val result = transaction { Species.selectAll().map { it.toSpeciesDto() } }
                call.respond(result)
            }
            post {
                val req = call.receive<CreateSpeciesRequest>()
                val id = transaction {
                    Species.insertAndGetId {
                        it[name] = req.name
                        it[careLight] = req.careLight
                        it[careWaterIntervalDays] = req.careWaterIntervalDays
                        it[careFertilizeIntervalDays] = req.careFertilizeIntervalDays
                        it[careTempRange] = req.careTempRange
                        it[description] = req.description
                        it[defaultImageUrl] = req.defaultImageUrl
                    }
                }
                call.respond(HttpStatusCode.Created, mapOf("id" to id.value.toString()))
            }
        }

        route("/plants") {
            get {
                val result = transaction {
                    Plants.selectAll().where { Plants.userId eq TEST_USER_ID }.map { it.toPlantDto() }
                }
                call.respond(result)
            }
            post {
                val req = call.receive<CreatePlantRequest>()
                val id = transaction {
                    Plants.insertAndGetId {
                        it[userId] = TEST_USER_ID
                        it[speciesId] = UUID.fromString(req.speciesId)
                        it[locationId] = req.locationId?.let(UUID::fromString)
                        it[nickname] = req.nickname
                        it[acquiredAt] = req.acquiredAt?.let(LocalDate::parse)
                        it[waterIntervalOverrideDays] = req.waterIntervalOverrideDays
                        it[fertilizeIntervalOverrideDays] = req.fertilizeIntervalOverrideDays
                    }
                }
                call.respond(HttpStatusCode.Created, mapOf("id" to id.value.toString()))
            }
            get("/{id}") {
                val id = call.parameters["id"]?.let(UUID::fromString)
                    ?: return@get call.respond(HttpStatusCode.BadRequest)
                val plant = transaction {
                    Plants.selectAll()
                        .where { (Plants.id eq id) and (Plants.userId eq TEST_USER_ID) }
                        .singleOrNull()?.toPlantDto()
                }
                if (plant == null) call.respond(HttpStatusCode.NotFound) else call.respond(plant)
            }
            delete("/{id}") {
                val id = call.parameters["id"]?.let(UUID::fromString)
                    ?: return@delete call.respond(HttpStatusCode.BadRequest)
                val deleted = transaction {
                    Plants.deleteWhere { (Plants.id eq id) and (Plants.userId eq TEST_USER_ID) }
                }
                if (deleted > 0) call.respond(HttpStatusCode.NoContent) else call.respond(HttpStatusCode.NotFound)
            }
        }
    }
}