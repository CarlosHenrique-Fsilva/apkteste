package com.jurosdopai.app.ui.main

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jurosdopai.app.data.entity.JurosEntry
import com.jurosdopai.app.data.repository.JurosRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class MainViewModel @Inject constructor(
    private val repository: JurosRepository
) : ViewModel() {

    // Filter state
    private val _searchQuery = MutableStateFlow("")
    private val _selectedCategoria = MutableStateFlow<String?>(null)
    private val _minValor = MutableStateFlow<Double?>(null)
    private val _maxValor = MutableStateFlow<Double?>(null)

    val searchQuery: String
        get() = _searchQuery.value
        set(value) { _searchQuery.value = value }

    val selectedCategoria: String?
        get() = _selectedCategoria.value
        set(value) { _selectedCategoria.value = value }

    val minValor: Double?
        get() = _minValor.value
        set(value) { _minValor.value = value }

    val maxValor: Double?
        get() = _maxValor.value
        set(value) { _maxValor.value = value }

    // Combined filtered entries
    val filteredEntries = combine(
        repository.getAll(),
        _searchQuery.distinctUntilChanged(),
        _selectedCategoria.distinctUntilChanged(),
        _minValor.distinctUntilChanged(),
        _maxValor.distinctUntilChanged()
    ) { entries, query, categoria, minV, maxV ->
        entries.filter { entry ->
            val matchesQuery = query.isBlank() ||
                entry.descricao.contains(query, ignoreCase = true) ||
                entry.categoria.contains(query, ignoreCase = true) ||
                "%.2f".format(entry.valor).contains(query)

            val matchesCategoria = categoria == null || entry.categoria == categoria

            val matchesMin = minV == null || entry.valor >= minV
            val matchesMax = maxV == null || entry.valor <= maxV

            matchesQuery && matchesCategoria && matchesMin && matchesMax
        }
    }.distinctUntilChanged()

    // Statistics
    private val _stats = MutableStateFlow<Stats>(Stats())
    val stats = _stats

    data class Stats(
        val count: Int = 0,
        val average: Double = 0.0,
        val total: Double = 0.0,
        val min: Double = 0.0,
        val max: Double = 0.0
    )

    fun loadStats() {
        viewModelScope.launch {
            val count = repository.getCount()
            val avg = repository.getAverageValor()
            val total = repository.getTotalValor()
            val min = repository.getMinValor()
            val max = repository.getMaxValor()
            _stats.value = Stats(count, avg, total, min, max)
        }
    }

    fun clearFilters() {
        _searchQuery.value = ""
        _selectedCategoria.value = null
        _minValor.value = null
        _maxValor.value = null
    }

    suspend fun deleteEntry(entry: JurosEntry) {
        repository.delete(entry)
    }

    suspend fun deleteById(id: Long) {
        repository.deleteById(id)
    }
}