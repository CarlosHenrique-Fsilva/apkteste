package com.jurosdopai.app.di

import android.content.Context
import com.jurosdopai.app.data.db.AppDatabase
import com.jurosdopai.app.data.dao.JurosDao
import com.jurosdopai.app.data.repository.JurosRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideDatabase(@dagger.hilt.android.qualifiers.ApplicationContext context: Context): AppDatabase {
        return AppDatabase.getDatabase(context)
    }

    @Provides
    @Singleton
    fun provideJurosDao(database: AppDatabase): JurosDao {
        return database.jurosDao()
    }

    @Provides
    @Singleton
    fun provideJurosRepository(dao: JurosDao): JurosRepository {
        return JurosRepository(dao)
    }
}