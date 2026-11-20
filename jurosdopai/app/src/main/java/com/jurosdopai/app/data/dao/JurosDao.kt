package com.jurosdopai.app.data.dao

import androidx.lifecycle.LiveData
import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import androidx.room.Delete
import com.jurosdopai.app.data.entity.JurosEntry
import kotlinx.coroutines.flow.Flow

@Dao
interface JurosDao {

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insert(entry: JurosEntry): Long

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertAll(entries: List<JurosEntry>): List<Long>

    @Update
    suspend fun update(entry: JurosEntry): Int

    @Delete
    suspend fun delete(entry: JurosEntry): Int

    @Query("DELETE FROM juros_entries WHERE id = :id")
    suspend fun deleteById(id: Long): Int

    @Query("SELECT * FROM juros_entries ORDER BY data DESC")
    fun getAll(): Flow<List<JurosEntry>>

    @Query("SELECT * FROM juros_entries ORDER BY data DESC")
    fun getAllLiveData(): LiveData<List<JurosEntry>>

    @Query("SELECT * FROM juros_entries WHERE id = :id")
    suspend fun getById(id: Long): JurosEntry?

    @Query("SELECT * FROM juros_entries WHERE categoria = :categoria ORDER BY data DESC")
    fun getByCategoria(categoria: String): Flow<List<JurosEntry>>

    @Query("SELECT * FROM juros_entries WHERE valor >= :minValor AND valor <= :maxValor ORDER BY data DESC")
    fun getByValorRange(minValor: Double, maxValor: Double): Flow<List<JurosEntry>>

    @Query("SELECT * FROM juros_entries WHERE data >= :startDate AND data <= :endDate ORDER BY data DESC")
    fun getByDateRange(startDate: Long, endDate: Long): Flow<List<JurosEntry>>

    @Query("SELECT * FROM juros_entries WHERE descricao LIKE :query OR categoria LIKE :query ORDER BY data DESC")
    fun search(query: String): Flow<List<JurosEntry>>

    // Statistics queries
    @Query("SELECT COUNT(*) FROM juros_entries")
    suspend fun getCount(): Int

    @Query("SELECT AVG(valor) FROM juros_entries")
    suspend fun getAverageValor(): Double

    @Query("SELECT SUM(valor) FROM juros_entries")
    suspend fun getTotalValor(): Double

    @Query("SELECT MIN(valor) FROM juros_entries")
    suspend fun getMinValor(): Double

    @Query("SELECT MAX(valor) FROM juros_entries")
    suspend fun getMaxValor(): Double

    @Query("SELECT categoria, COUNT(*) as count FROM juros_entries GROUP BY categoria")
    suspend fun getCountByCategoria(): List<Pair<String, Int>>

    @Query("SELECT categoria, AVG(valor) as avg FROM juros_entries GROUP BY categoria")
    suspend fun getAverageByCategoria(): List<Pair<String, Double>>

    @Query("SELECT strftime('%Y-%m', data/1000, 'unixepoch') as month, AVG(valor) as avg FROM juros_entries GROUP BY month ORDER BY month DESC LIMIT 12")
    suspend fun getMonthlyAverage(): List<Pair<String, Double>>
}