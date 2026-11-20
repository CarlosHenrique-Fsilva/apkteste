package com.jurosdopai.app.ui.main

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.jurosdopai.app.R
import com.jurosdopai.app.data.entity.JurosEntry
import com.jurosdopai.app.databinding.ItemJurosEntryBinding
import java.text.SimpleDateFormat
import java.util.Locale

class JurosAdapter(
    private val onItemClick: (JurosEntry) -> Unit,
    private val onItemLongClick: (JurosEntry) -> Unit
) : ListAdapter<JurosEntry, JurosAdapter.JurosViewHolder>(DiffCallback()) {

    inner class JurosViewHolder(private val binding: ItemJurosEntryBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(entry: JurosEntry) {
            binding.tvCategoria.text = entry.categoria
            binding.tvCategoria.setBackgroundResource(getCategoryColor(entry.categoria))
            binding.tvValor.text = String.format(Locale.getDefault(), "%.2f%%", entry.valor)
            binding.tvData.text = SimpleDateFormat("dd/MM/yyyy", Locale.getDefault()).format(entry.data)
            binding.tvDescricao.text = if (entry.descricao.isNotBlank()) entry.descricao else "—"

            binding.root.setOnClickListener { onItemClick(entry) }
            binding.root.setOnLongClickListener { onItemLongClick(entry); true }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): JurosViewHolder {
        val binding = ItemJurosEntryBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return JurosViewHolder(binding)
    }

    override fun onBindViewHolder(holder: JurosViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class DiffCallback : DiffUtil.ItemCallback<JurosEntry>() {
        override fun areItemsTheSame(oldItem: JurosEntry, newItem: JurosEntry): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: JurosEntry, newItem: JurosEntry): Boolean {
            return oldItem == newItem
        }
    }

    private fun getCategoryColor(category: String): Int {
        return when (category) {
            JurosEntry.CATEGORIA_EMPRESTIMO -> R.color.cat_emprestimo
            JurosEntry.CATEGORIA_INVESTIMENTO -> R.color.cat_investimento
            JurosEntry.CATEGORIA_PESSOAL -> R.color.cat_pessoal
            else -> R.color.cat_outro
        }
    }
}