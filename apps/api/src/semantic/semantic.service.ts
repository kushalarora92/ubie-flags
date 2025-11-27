import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document as LangchainDocument } from '@langchain/core/documents';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { PoolConfig } from 'pg';
import { ubieflagsDocumentation } from '../data/ubieflags-docs';

@Injectable()
export class SemanticService implements OnModuleInit {
  private readonly logger = new Logger(SemanticService.name);
  private embeddings: OpenAIEmbeddings;
  private vectorStore: PGVectorStore;
  private dbConfig: PoolConfig;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.embeddings = new OpenAIEmbeddings({
      modelName: 'text-embedding-3-small',
      openAIApiKey: apiKey,
    });

    // Reuse existing DB config from environment
    this.dbConfig = {
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      user: this.configService.get<string>('DB_USER'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_NAME'),
    };
  }

  async onModuleInit() {
    try {
      // Initialize PGVectorStore
      this.vectorStore = await PGVectorStore.initialize(this.embeddings, {
        postgresConnectionOptions: this.dbConfig,
        tableName: 'langchain_pg_embedding',
        columns: {
          idColumnName: 'id',
          vectorColumnName: 'embedding',
          contentColumnName: 'content',
          metadataColumnName: 'metadata',
        },
      });

      // ONLY for test and development: Seed UbieFlags documentation if empty
      // Check if we need to seed by querying the vector store table directly
      const existingDocs = await this.vectorStore.similaritySearch('test', 1);

      if (existingDocs.length === 0) {
        this.logger.log(
          'No documents found, seeding UbieFlags documentation...',
        );
        await this.seedUbieFlagsData();
        this.logger.log('Documentation seeded successfully');
      } else {
        this.logger.log(`Found documents in vector store, skipping seed`);
      }
    } catch (error) {
      this.logger.error('Failed to initialize SemanticService:', error);
      throw error;
    }
  }

  /**
   * Seed UbieFlags documentation into vector store using PGVectorStore
   */
  async seedUbieFlagsData(): Promise<void> {
    try {
      // Convert documentation to LangChain documents
      const langchainDocs = ubieflagsDocumentation.map(
        (doc) =>
          new LangchainDocument({
            pageContent: doc.content,
            metadata: {
              title: doc.title,
              category: doc.category,
            },
          }),
      );

      // Split documents into chunks
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 50,
      });
      const splits = await splitter.splitDocuments(langchainDocs);

      this.logger.log(`Split documentation into ${splits.length} chunks`);

      // Add documents to vector store (PGVectorStore handles embedding generation)
      await this.vectorStore.addDocuments(splits);

      this.logger.log(`Indexed ${splits.length} document chunks`);
    } catch (error) {
      this.logger.error('Failed to seed documentation:', error);
      throw error;
    }
  }

  /**
   * Semantic search over documentation using PGVectorStore
   */
  async similaritySearch(
    query: string,
    k: number = 3,
  ): Promise<LangchainDocument[]> {
    try {
      // PGVectorStore handles query embedding and similarity search automatically
      const results = await this.vectorStore.similaritySearch(query, k);
      return results;
    } catch (error) {
      this.logger.error('Similarity search failed:', error);
      throw error;
    }
  }
}
