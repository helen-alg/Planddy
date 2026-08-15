package com.helen
import org.jetbrains.exposed.dao.id.UUIDTable
import org.jetbrains.exposed.sql.javatime.date
import org.jetbrains.exposed.sql.javatime.timestamp

object Users : UUIDTable("users") {
    val email = varchar("email", 255).uniqueIndex()
    val passwordHash = varchar("password_hash", 255)
    val notificationsEnabled = bool("notifications_enabled").default(true)
    val createdAt = timestamp("created_at")
}

object Species : UUIDTable("species") {
    val name = varchar("name", 255)
    val careLight = varchar("care_light", 255).nullable()
    val careWaterIntervalDays = integer("care_water_interval_days").nullable()
    val careFertilizeIntervalDays = integer("care_fertilize_interval_days").nullable()
    val careTempRange = varchar("care_temp_range", 100).nullable()
    val description = text("description").nullable()
    val defaultImageUrl = varchar("default_image_url", 500).nullable()
}

object Locations : UUIDTable("locations") {
    val userId = reference("user_id", Users)
    val name = varchar("name", 255)
    val lightExposure = varchar("light_exposure", 100).nullable()
}

object Plants : UUIDTable("plants") {
    val userId = reference("user_id", Users)
    val speciesId = reference("species_id", Species)
    val locationId = reference("location_id", Locations).nullable()
    val nickname = varchar("nickname", 255)
    val acquiredAt = date("acquired_at").nullable()
    val waterIntervalOverrideDays = integer("water_interval_override_days").nullable()
    val fertilizeIntervalOverrideDays = integer("fertilize_interval_override_days").nullable()
}

object WateringEvents : UUIDTable("watering_events") {
    val plantId = reference("plant_id", Plants)
    val wateredAt = timestamp("watered_at")
    val note = text("note").nullable()
}