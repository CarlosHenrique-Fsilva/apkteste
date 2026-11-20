package com.jurosdopai.app.ui.addedit

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jurosdopai.app.data.entity.JurosEntry
import com.jurosdopai.app.data.repository.JurosRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AddEditViewModel @Inject constructor(
    private val repository: JurosRepository
) : ViewModel() {

    private val _isLoading = MutableStateFlow(false)
    val isLoading = _isLoading

    private val _error = MutableStateFlow<String?>(null)
    val error = _error

    private val _success = MutableStateFlow(false)
    val success = _success

    var editingEntry: JurosEntry? = null

    fun saveEntry(
        valor: Double,
        data: Long,
        categoria: String,
        descricao: String
    ) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            _success.value = false

            try {
                if (editingEntry != null) {
                    // Update existing
                    val updated = editingEntry!!.copy(
                        valor = valor,
                        data = data,
                        categoria = categoria,
                        descricao = descricao,
                        updatedAt = System.currentTimeMillis()
                    )
                    repository.update(updated)
                } else {
                    // Insert new
                    val newEntry = JurosEntry(
                        valor = valor,
                        data = data,
                        categoria = categoria,
                        descricao = descricao
                    )
                    repository.insert(newEntry)
                }
                _success.value = true
            } catch (e: Exception) {
                _error.value = "Erro ao salvar: ${e.message}"
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun reset() {
        editingEntry = null
        _error.value = null
        _success.value = false
    }
}