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
        val env = dotenv{
            ignoreIfMissing = true
        }
        val config = HikariConfig().apply {
            jdbcUrl = env["DATABASE_URL"]
            maximumPoolSize = 5
            isAutoCommit = false
            transactionIsolation = "TRANSACTION_REPEATABLE_READ"
            addDataSourceProperty("prepareThreshold", "0")
        }
        val dataSource = HikariDataSource(config)
        Database.connect(dataSource)

        transaction {
            SchemaUtils.create(Users, Species, Locations, Plants, WateringEvents)
        }
    }
}
