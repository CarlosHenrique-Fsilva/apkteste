package com.jurosdopai.app.data.db

import androidx.room.TypeConverter
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class Converters {

    @TypeConverter
    fun fromTimestamp(value: Long?): Date? {
        return value?.let { Date(it) }
    }

    @TypeConverter
    fun dateToTimestamp(date: Date?): Long? {
        return date?.time
    }

    @TypeConverter
    fun fromDateString(value: String?): Date? {
        return value?.let {
            SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).parse(it)
        }
    }

    @TypeConverter
    fun dateToString(date: Date?): String? {
        return date?.let {
            SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(it)
        }
    }
}