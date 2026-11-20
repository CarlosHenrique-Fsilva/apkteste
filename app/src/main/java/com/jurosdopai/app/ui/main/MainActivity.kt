package com.jurosdopai.app.ui.main

import android.content.Intent
import android.os.Bundle
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.widget.SearchView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.DividerItemDecoration
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.snackbar.Snackbar
import com.jurosdopai.app.R
import com.jurosdopai.app.data.entity.JurosEntry
import com.jurosdopai.app.databinding.ActivityMainBinding
import com.jurosdopai.app.ui.addedit.AddEditActivity
import dagger.hilt.android.AndroidEntryPoint
import java.text.SimpleDateFormat
import java.util.Locale

@AndroidEntryPoint
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var viewModel: MainViewModel
    private lateinit var adapter: JurosAdapter

    private val DATE_FORMAT = SimpleDateFormat("dd/MM/yyyy", Locale.getDefault())

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupToolbar()
        setupRecyclerView()
        setupViewModel()
        setupFab()
    }

    private fun setupToolbar() {
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayShowTitleEnabled(true)
    }

    private fun setupRecyclerView() {
        adapter = JurosAdapter(onItemClick = { entry ->
            openAddEditActivity(entry)
        }, onItemLongClick = { entry ->
            showDeleteDialog(entry)
        })

        binding.rvEntries.apply {
            layoutManager = LinearLayoutManager(this@MainActivity)
            adapter = this@MainActivity.adapter
            addItemDecoration(DividerItemDecoration(this@MainActivity, DividerItemDecoration.VERTICAL))
        }
    }

    private fun setupViewModel() {
        viewModel = ViewModelProvider(this)[MainViewModel::class.java]

        viewModel.filteredEntries.observe(this) { entries ->
            adapter.submitList(entries)
            updateEmptyState(entries)
            viewModel.loadStats()
        }
    }

    private fun updateEmptyState(entries: List<JurosEntry>) {
        binding.tvEmpty.visibility = if (entries.isEmpty()) View.VISIBLE else View.GONE
        binding.tvEmpty.text = if (hasActiveFilters()) {
            getString(R.string.empty_state_filtered)
        } else {
            getString(R.string.empty_state)
        }
    }

    private fun hasActiveFilters(): Boolean {
        return viewModel.searchQuery.isNotBlank() ||
            viewModel.selectedCategoria != null ||
            viewModel.minValor != null ||
            viewModel.maxValor != null
    }

    private fun setupFab() {
        binding.fabAdd.setOnClickListener {
            openAddEditActivity(null)
        }
    }

    private fun openAddEditActivity(entry: JurosEntry?) {
        val intent = Intent(this, AddEditActivity::class.java)
        entry?.let { intent.putExtra("entry_id", it.id) }
        startActivity(intent)
    }

    private fun showDeleteDialog(entry: JurosEntry) {
        MaterialAlertDialogBuilder(this)
            .setTitle(R.string.confirm_delete)
            .setMessage(R.string.confirm_delete_msg)
            .setPositiveButton(R.string.btn_delete) { _, _ ->
                viewModel.deleteEntry(entry)
                Snackbar.make(binding.root, "Registro excluído", Snackbar.LENGTH_SHORT).show()
            }
            .setNegativeButton(R.string.btn_keep, null)
            .show()
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.menu_main, menu)

        // Setup SearchView
        val searchItem = menu.findItem(R.id.action_search)
        val searchView = searchItem.actionView as SearchView
        searchView.setQueryHint("Buscar...")
        searchView.setOnQueryTextListener(object : SearchView.OnQueryTextListener {
            override fun onQueryTextSubmit(query: String): Boolean {
                viewModel.searchQuery = query
                return true
            }
            override fun onQueryTextChange(newText: String): Boolean {
                viewModel.searchQuery = newText
                return true
            }
        })

        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.action_filter -> {
                showFilterDialog()
                true
            }
            R.id.action_export -> {
                exportToCsv()
                true
            }
            R.id.action_stats -> {
                showStatsDialog()
                true
            }
            R.id.action_clear_filters -> {
                viewModel.clearFilters()
                Toast.makeText(this, "Filtros limpos", Toast.LENGTH_SHORT).show()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    private fun showFilterDialog() {
        // Simple filter bottom sheet or dialog
        val categories = JurosEntry.CATEGORIAS
        val selectedIndex = categories.indexOf(viewModel.selectedCategoria.orEmpty())

        MaterialAlertDialogBuilder(this)
            .setTitle("Filtrar por categoria")
            .setSingleChoiceItems(categories.toTypedArray(), selectedIndex) { dialog, which ->
                viewModel.selectedCategoria = categories[which]
                dialog.dismiss()
            }
            .setNegativeButton("Cancelar", null)
            .show()
    }

    private fun exportToCsv() {
        val entries = adapter.currentList
        if (entries.isEmpty()) {
            Toast.makeText(this, "Nenhum dado para exportar", Toast.LENGTH_SHORT).show()
            return
        }

        val csv = StringBuilder()
        csv.appendLine("ID,Valor (%),Data,Categoria,Descrição,Criado em,Atualizado em")

        val dateFormat = SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault())

        for (entry in entries) {
            csv.appendLine(
                "${entry.id},${entry.valor}," +
                "${dateFormat.format(entry.data)}," +
                "\"${entry.categoria}\",\"${entry.descricao}\"," +
                "${dateFormat.format(entry.createdAt)}," +
                "${dateFormat.format(entry.updatedAt)}"
            )
        }

        // Save to Downloads
        val fileName = "juros_${SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(System.currentTimeMillis())}.csv"

        try {
            val downloadsDir = getExternalFilesDir(android.os.Environment.DIRECTORY_DOWNLOADS)
            val file = java.io.File(downloadsDir, fileName)
            file.writeText(csv.toString())

            // Also try to make it visible in system Downloads
            val contentValues = android.content.ContentValues().apply {
                put(android.provider.MediaStore.MediaColumns.DISPLAY_NAME, fileName)
                put(android.provider.MediaStore.MediaColumns.MIME_TYPE, "text/csv")
                put(android.provider.MediaStore.MediaColumns.RELATIVE_PATH, android.os.Environment.DIRECTORY_DOWNLOADS)
            }

            val uri = contentResolver.insert(android.provider.MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues)
            uri?.let { outputUri ->
                contentResolver.openOutputStream(outputUri)?.use { outputStream ->
                    outputStream.write(csv.toString().toByteArray())
                }
            }

            Snackbar.make(binding.root, getString(R.string.export_success), Snackbar.LENGTH_LONG).show()
        } catch (e: Exception) {
            Snackbar.make(binding.root, getString(R.string.export_error), Snackbar.LENGTH_LONG).show()
        }
    }

    private fun showStatsDialog() {
        val stats = viewModel.stats.value

        val builder = MaterialAlertDialogBuilder(this)
            .setTitle(R.string.stats_title)
            .setMessage(buildStatsMessage(stats))
            .setPositiveButton("OK", null)

        builder.show()
    }

    private fun buildStatsMessage(stats: MainViewModel.Stats): String {
        return buildString {
            appendLine("${getString(R.string.stats_total_registros)}: ${stats.count}")
            appendLine("${getString(R.string.stats_media)}: ${String.format(Locale.getDefault(), "%.2f%%", stats.average)}")
            appendLine("${getString(R.string.stats_soma)}: ${String.format(Locale.getDefault(), "%.2f%%", stats.total)}")
            appendLine("${getString(R.string.stats_min)}: ${String.format(Locale.getDefault(), "%.2f%%", stats.min)}")
            appendLine("${getString(R.string.stats_max)}: ${String.format(Locale.getDefault(), "%.2f%%", stats.max)}")
        }
    }
}