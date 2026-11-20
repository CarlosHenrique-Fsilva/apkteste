package com.jurosdopai.app.data.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverters
import com.jurosdopai.app.data.db.Converters
import java.io.Serializable

@Entity(tableName = "juros_entries")
@TypeConverters(Converters::class)
data class JurosEntry(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val valor: Double,           // Ex: 1.5 para 1,5%
    val data: Long,              // Timestamp em millis
    val categoria: String,       // Ex: "Empréstimo", "Investimento", "Pessoal"
    val descricao: String = "",  // Opcional
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
) : Serializable {

    companion object {
        const val CATEGORIA_EMPRESTIMO = "Empréstimo"
        const val CATEGORIA_INVESTIMENTO = "Investimento"
        const val CATEGORIA_PESSOAL = "Pessoal"
        const val CATEGORIA_OUTRO = "Outro"

        val CATEGORIAS = listOf(
            CATEGORIA_EMPRESTIMO,
            CATEGORIA_INVESTIMENTO,
            CATEGORIA_PESSOAL,
            CATEGORIA_OUTRO
        )
    }
}