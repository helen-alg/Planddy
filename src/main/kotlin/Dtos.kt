package com.helen
import kotlinx.serialization.Serializable

@Serializable
data class SpeciesDto(
    val id: String,
    val name: String,
    val careLight: String? = null,
    val careWaterIntervalDays: Int? = null,
    val careFertilizeIntervalDays: Int? = null,
    val careTempRange: String? = null,
    val description: String? = null,
    val defaultImageUrl: String? = null
)

@Serializable
data class CreateSpeciesRequest(
    val name: String,
    val careLight: String? = null,
    val careWaterIntervalDays: Int? = null,
    val careFertilizeIntervalDays: Int? = null,
    val careTempRange: String? = null,
    val description: String? = null,
    val defaultImageUrl: String? = null
)

@Serializable
data class PlantDto(
    val id: String,
    val speciesId: String,
    val locationId: String? = null,
    val nickname: String,
    val acquiredAt: String? = null,
    val waterIntervalOverrideDays: Int? = null,
    val fertilizeIntervalOverrideDays: Int? = null
)

@Serializable
data class CreatePlantRequest(
    val speciesId: String,
    val locationId: String? = null,
    val nickname: String,
    val acquiredAt: String? = null,
    val waterIntervalOverrideDays: Int? = null,
    val fertilizeIntervalOverrideDays: Int? = null
)

@Serializable
data class LocationDto(
    val id: String,
    val name: String,
    val lightExposure: String? = null
)

@Serializable
data class CreateLocationRequest(
    val name: String,
    val lightExposure: String? = null
)

@Serializable
data class WateringEventDto(
    val id: String,
    val plantId: String,
    val wateredAt: String,
    val note: String? = null
)

@Serializable
data class CreateWateringEventRequest(
    val wateredAt: String? = null,
    val note: String? = null
)