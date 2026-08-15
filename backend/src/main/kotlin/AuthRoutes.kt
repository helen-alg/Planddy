package com.helen


import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import org.mindrot.jbcrypt.BCrypt as JBCrypt
import java.time.Instant
import java.util.Date

fun Application.configureAuthRoutes() {
    routing {
        route("/auth") {
            post("/register") {
                val req = call.receive<RegisterRequest>()

                val exists = transaction {
                    Users.selectAll().where { Users.email eq req.email }.empty().not()
                }
                if (exists) return@post call.respond(HttpStatusCode.Conflict, mapOf("error" to "Email already registered"))

                val hash = JBCrypt.hashpw(req.password, JBCrypt.gensalt())
                val userId = transaction {
                    Users.insertAndGetId {
                        it[email] = req.email
                        it[passwordHash] = hash
                        it[createdAt] = Instant.now()
                    }
                }
                call.respond(HttpStatusCode.Created, mapOf("id" to userId.value.toString()))
            }

            post("/login") {
                val req = call.receive<LoginRequest>()

                val user = transaction {
                    Users.selectAll().where { Users.email eq req.email }.singleOrNull()
                }
                if (user == null || !JBCrypt.checkpw(req.password, user[Users.passwordHash])) {
                    return@post call.respond(HttpStatusCode.Unauthorized, mapOf("error" to "Invalid credentials"))
                }

                val token = JWT.create()
                    .withIssuer(JWT_ISSUER)
                    .withAudience(JWT_AUDIENCE)
                    .withClaim("userId", user[Users.id].value.toString())
                    .withExpiresAt(Date.from(Instant.now().plusSeconds(60 * 60 * 24)))
                    .sign(Algorithm.HMAC256(jwtSecret))

                call.respond(AuthResponse(token))
            }
        }
    }
}