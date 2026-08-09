package com.helen
import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import io.github.cdimascio.dotenv.dotenv
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.Instant
import org.jetbrains.exposed.sql.*

object DatabaseFactory {
    fun init() {
        val env = dotenv()
        val config = HikariConfig().apply {
            jdbcUrl = env["DATABASE_URL"]
            maximumPoolSize = 5
            isAutoCommit = false
            transactionIsolation = "TRANSACTION_REPEATABLE_READ"
            addDataSourceProperty("prepareThreshold", "0")
        }
        val dataSource = HikariDataSource(config)
        Database.connect(dataSource)
        // in DatabaseFactory.init(), nach Database.connect(dataSource):
        transaction {
            SchemaUtils.create(Users, Species, Locations, Plants, WateringEvents)
            // ... nach SchemaUtils.create(...) im selben transaction-Block:
                    if (Users.selectAll().where { Users.id eq TEST_USER_ID }.empty()) {
                        Users.insert {
                            it[id] = TEST_USER_ID
                            it[email] = "test@planddy.dev"
                            it[passwordHash] = "not-a-real-hash"
                            it[createdAt] = Instant.now()
                        }
                    }
        }
    }
}