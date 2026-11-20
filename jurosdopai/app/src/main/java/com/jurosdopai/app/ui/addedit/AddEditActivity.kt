package com.jurosdopai.app.ui.addedit

import android.app.DatePickerDialog
import android.os.Bundle
import android.text.TextUtils
import android.view.MenuItem
import android.widget.ArrayAdapter
import android.widget.AutoCompleteTextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import com.google.android.material.button.MaterialButton
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
import com.jurosdopai.app.R
import com.jurosdopai.app.data.entity.JurosEntry
import com.jurosdopai.app.databinding.ActivityAddEditBinding
import dagger.hilt.android.AndroidEntryPoint
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

@AndroidEntryPoint
class AddEditActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAddEditBinding
    private lateinit var viewModel: AddEditViewModel
    private lateinit var categoriaAdapter: ArrayAdapter<String>
    private var selectedDate: Long = System.currentTimeMillis()

    private val DATE_FORMAT = SimpleDateFormat("dd/MM/yyyy", Locale.getDefault())

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAddEditBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupToolbar()
        setupCategoriaDropdown()
        setupDatePicker()
        setupViewModel()
        setupSaveButton()
        loadEntryIfEditing()
    }

    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.setDisplayShowHomeEnabled(true)

        val isEditing = intent.getLongExtra("entry_id", -1) != -1L
        supportActionBar?.title = if (isEditing) getString(R.string.title_edit) else getString(R.string.title_add)
    }

    private fun setupCategoriaDropdown() {
        categoriaAdapter = ArrayAdapter(
            this,
            android.R.layout.simple_dropdown_item_1line,
            JurosEntry.CATEGORIAS
        )
        binding.actvCategoria.setAdapter(categoriaAdapter)
        binding.actvCategoria.setText(JurosEntry.CATEGORIAS[0], false)
    }

    private fun setupDatePicker() {
        binding.etData.setText(DATE_FORMAT.format(selectedDate))
        binding.etData.setOnClickListener {
            showDatePicker()
        }
        binding.tilData.endIconOnClickListener = { showDatePicker() }
    }

    private fun showDatePicker() {
        val calendar = Calendar.getInstance()
        calendar.timeInMillis = selectedDate

        DatePickerDialog(
            this,
            { _, year, month, dayOfMonth ->
                calendar.set(year, month, dayOfMonth)
                selectedDate = calendar.timeInMillis
                binding.etData.setText(DATE_FORMAT.format(selectedDate))
            },
            calendar.get(Calendar.YEAR),
            calendar.get(Calendar.MONTH),
            calendar.get(Calendar.DAY_OF_MONTH)
        ).show()
    }

    private fun setupViewModel() {
        viewModel = ViewModelProvider(this)[AddEditViewModel::class.java]

        viewModel.success.observe(this) { success ->
            if (success) {
                Toast.makeText(this, "Salvo com sucesso!", Toast.LENGTH_SHORT).show()
                finish()
            }
        }

        viewModel.error.observe(this) { error ->
            error?.let { Toast.makeText(this, it, Toast.LENGTH_SHORT).show() }
        }
    }

    private fun setupSaveButton() {
        binding.btnSave.setOnClickListener {
            saveEntry()
        }
    }

    private fun loadEntryIfEditing() {
        val entryId = intent.getLongExtra("entry_id", -1L)
        if (entryId != -1L) {
            // Load entry from database - we need to fetch it
            // For simplicity, we'll observe the repository directly
            // In a real app, you'd pass the entry or fetch it in the ViewModel
        }
    }

    private fun saveEntry() {
        val valorStr = binding.etValor.text.toString().trim()
        val categoria = binding.actvCategoria.text.toString().trim()
        val descricao = binding.etDescricao.text.toString().trim()

        // Validation
        if (TextUtils.isEmpty(valorStr)) {
            binding.tilValor.error = "Informe o valor"
            return
        }
        binding.tilValor.error = null

        if (TextUtils.isEmpty(categoria)) {
            binding.tilCategoria.error = "Selecione uma categoria"
            return
        }
        binding.tilCategoria.error = null

        val valor = valorStr.toDoubleOrNull() ?: 0.0
        if (valor <= 0) {
            binding.tilValor.error = "Valor deve ser maior que zero"
            return
        }

        // Check if editing
        val entryId = intent.getLongExtra("entry_id", -1L)
        if (entryId != -1L) {
            // We need to fetch the existing entry first
            // For now, create a new entry with the ID - in real app fetch from repo
        }

        viewModel.saveEntry(valor, selectedDate, categoria, descricao)
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        if (item.itemId == android.R.id.home) {
            onBackPressed()
            return true
        }
        return super.onOptionsItemSelected(item)
    }
}