package com.helen

import io.github.cdimascio.dotenv.dotenv
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm

private val env = dotenv{
    ignoreIfMissing = true
}
val jwtSecret: String = env["JWT_SECRET"]
const val JWT_ISSUER = "planddy"
const val JWT_AUDIENCE = "planddy-users"

fun Application.configureSecurity() {
    install(Authentication) {
        jwt("auth-jwt") {
            verifier(
                JWT.require(Algorithm.HMAC256(jwtSecret))
                    .withIssuer(JWT_ISSUER)
                    .withAudience(JWT_AUDIENCE)
                    .build()
            )
            validate { credential ->
                if (credential.payload.getClaim("userId").asString() != null) JWTPrincipal(credential.payload) else null
            }
        }
    }
}