package com.jurosdopai.app.data.repository

import com.jurosdopai.app.data.dao.JurosDao
import com.jurosdopai.app.data.entity.JurosEntry
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class JurosRepository @Inject constructor(
    private val jurosDao: JurosDao
) {

    suspend fun insert(entry: JurosEntry): Long {
        return jurosDao.insert(entry)
    }

    suspend fun insertAll(entries: List<JurosEntry>): List<Long> {
        return jurosDao.insertAll(entries)
    }

    suspend fun update(entry: JurosEntry): Int {
        val updatedEntry = entry.copy(updatedAt = System.currentTimeMillis())
        return jurosDao.update(updatedEntry)
    }

    suspend fun delete(entry: JurosEntry): Int {
        return jurosDao.delete(entry)
    }

    suspend fun deleteById(id: Long): Int {
        return jurosDao.deleteById(id)
    }

    fun getAll(): Flow<List<JurosEntry>> {
        return jurosDao.getAll()
    }

    fun getByCategoria(categoria: String): Flow<List<JurosEntry>> {
        return jurosDao.getByCategoria(categoria)
    }

    fun getByValorRange(minValor: Double, maxValor: Double): Flow<List<JurosEntry>> {
        return jurosDao.getByValorRange(minValor, maxValor)
    }

    fun getByDateRange(startDate: Long, endDate: Long): Flow<List<JurosEntry>> {
        return jurosDao.getByDateRange(startDate, endDate)
    }

    fun search(query: String): Flow<List<JurosEntry>> {
        return jurosDao.search("%$query%")
    }

    suspend fun getById(id: Long): JurosEntry? {
        return jurosDao.getById(id)
    }

    // Statistics
    suspend fun getCount(): Int = jurosDao.getCount()
    suspend fun getAverageValor(): Double = jurosDao.getAverageValor()
    suspend fun getTotalValor(): Double = jurosDao.getTotalValor()
    suspend fun getMinValor(): Double = jurosDao.getMinValor()
    suspend fun getMaxValor(): Double = jurosDao.getMaxValor()
    suspend fun getCountByCategoria(): List<Pair<String, Int>> = jurosDao.getCountByCategoria()
    suspend fun getAverageByCategoria(): List<Pair<String, Double>> = jurosDao.getAverageByCategoria()
    suspend fun getMonthlyAverage(): List<Pair<String, Double>> = jurosDao.getMonthlyAverage()
}