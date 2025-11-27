import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { tool } from 'langchain';
import { createAgent } from 'langchain';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { FlagsService } from '../flags/flags.service';
import { EvaluationService } from '../evaluation/evaluation.service';
import { ConversationService } from '../conversation/conversation.service';
import { SemanticService } from '../semantic/semantic.service';
import { Environment } from '../entities/feature-flag.entity';
import { MessageRole } from '../entities/conversation-message.entity';

@Injectable()
export class ChatAgentService implements OnModuleInit {
  private readonly logger = new Logger(ChatAgentService.name);
  private agent: any;

  constructor(
    private configService: ConfigService,
    private flagsService: FlagsService,
    private evaluationService: EvaluationService,
    private conversationService: ConversationService,
    private semanticService: SemanticService,
  ) {}

  async onModuleInit() {
    await this.initializeAgent();
  }

  private async initializeAgent() {
    try {
      const apiKey = this.configService.get<string>('OPENAI_API_KEY');
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not configured');
      }

      // Initialize OpenAI model
      const model = new ChatOpenAI({
        model: 'gpt-4-turbo-preview',
        temperature: 0,
        openAIApiKey: apiKey,
      });

      // Define system prompt
      const systemPrompt = `You are a helpful assistant for UbieFlags, a feature flag management platform.

Your role:
- Help users understand their feature flags
- Explain why flags evaluate to ON or OFF (never say true/false)
- Use available tools to fetch real data
- Provide clear, concise explanations
- Answer questions about UbieFlags features and best practices

When explaining evaluations:
- Always say ON or OFF (never true or false)
- Show which rules matched or didn't match
- Explain the reasoning clearly
- Use ✓ for matched conditions and ✗ for unmatched

Available tools:
- list_flags: Get all feature flags
- get_flag_details: Get details about a specific flag
- evaluate_flag: Evaluate a flag for a user context
- list_stale_flags: Find flags not evaluated recently
- retrieve_documentation: Search UbieFlags documentation for features, best practices, troubleshooting

Use retrieve_documentation for questions about how UbieFlags works, features, best practices, or troubleshooting.

Be concise, friendly, and technical when needed.`;

      // Create agent with tools
      this.agent = createAgent({
        model,
        tools: [
          this.createListFlagsTool(),
          this.createGetFlagDetailsTool(),
          this.createEvaluateFlagTool(),
          this.createListStaleFlagsTool(),
          this.createRetrieveDocumentationTool(),
        ],
        systemPrompt,
      });

      this.logger.log('LangChain agent initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize agent:', error);
      throw error;
    }
  }

  /**
   * Tool 1: List flags
   */
  private createListFlagsTool() {
    return tool(
      async ({ environment }) => {
        const flags = await this.flagsService.findAll();
        const filtered = environment
          ? flags.filter((f) => f.environment === environment)
          : flags;

        // Format as ON/OFF display
        const formatted = filtered.map((f) => ({
          key: f.key,
          name: f.name,
          state: f.state,
          environment: f.environment,
          value: f.defaultValue ? 'ON' : 'OFF',
        }));

        return JSON.stringify(formatted, null, 2);
      },
      {
        name: 'list_flags',
        description:
          'Get all feature flags. Returns flags with key, name, state (draft/live/deprecated), and current value (ON/OFF).',
        schema: z.object({
          environment: z
            .enum(['dev', 'staging', 'prod'])
            .optional()
            .describe('Filter by environment'),
        }),
      },
    );
  }

  /**
   * Tool 2: Get flag details
   */
  private createGetFlagDetailsTool() {
    return tool(
      async ({ flagKey, environment }) => {
        const flags = await this.flagsService.findAll();
        const flag = flags.find(
          (f) => f.key === flagKey && f.environment === environment,
        );

        if (!flag) {
          return JSON.stringify({
            error: `Flag '${flagKey}' not found in ${environment}`,
          });
        }

        return JSON.stringify(
          {
            key: flag.key,
            name: flag.name,
            description: flag.description,
            state: flag.state,
            environment: flag.environment,
            value: flag.defaultValue ? 'ON' : 'OFF',
            rules: flag.rules,
            createdAt: flag.createdAt,
            updatedAt: flag.updatedAt,
            lastEvaluatedAt: flag.lastEvaluatedAt,
          },
          null,
          2,
        );
      },
      {
        name: 'get_flag_details',
        description:
          'Get detailed information about a specific flag including rules, conditions, and current state.',
        schema: z.object({
          flagKey: z.string().describe('The flag key to look up'),
          environment: z
            .enum(['dev', 'staging', 'prod'])
            .describe('The environment'),
        }),
      },
    );
  }

  /**
   * Tool 3: Evaluate flag
   */
  private createEvaluateFlagTool() {
    return tool(
      async ({ flagKey, environment, context }) => {
        const result = await this.evaluationService.evaluateFlag(
          flagKey,
          environment as Environment,
          context,
        );
        return JSON.stringify(result, null, 2);
      },
      {
        name: 'evaluate_flag',
        description:
          'Evaluate a flag for a specific user context. Returns ON/OFF and detailed explanation of why.',
        schema: z.object({
          flagKey: z.string().describe('The flag key to evaluate'),
          environment: z
            .enum(['dev', 'staging', 'prod'])
            .describe('The environment'),
          context: z
            .record(z.string(), z.any())
            .describe("User context (e.g., {country: 'CA', userId: '123'})"),
        }),
      },
    );
  }

  /**
   * Tool 4: List stale flags
   */
  private createListStaleFlagsTool() {
    return tool(
      async ({ days }) => {
        const staleFlags = await this.flagsService.findStaleFlags(days || 30);
        return JSON.stringify(staleFlags, null, 2);
      },
      {
        name: 'list_stale_flags',
        description:
          'Find flags not evaluated recently. Helps identify candidates for deprecation or cleanup.',
        schema: z.object({
          days: z
            .number()
            .optional()
            .describe('Days since last evaluation (default 30)'),
        }),
      },
    );
  }

  /**
   * Tool 5: Retrieve documentation
   */
  private createRetrieveDocumentationTool() {
    return tool(
      async ({ query }) => {
        const docs = await this.semanticService.similaritySearch(query, 3);

        // Format results for the agent
        const formatted = docs.map((doc) => ({
          content: doc.pageContent,
          category: doc.metadata.category || 'general',
          title: doc.metadata.title || 'Documentation',
        }));

        return JSON.stringify(formatted, null, 2);
      },
      {
        name: 'retrieve_documentation',
        description:
          'Search UbieFlags documentation for information about features, best practices, and troubleshooting. Use this when users ask how something works or need guidance.',
        schema: z.object({
          query: z
            .string()
            .describe(
              'Search query for documentation (e.g., "explainability", "lifecycle", "best practices")',
            ),
        }),
      },
    );
  }

  /**
   * Send a message to the agent and get a response
   * Now with persistent conversation storage
   */
  async sendMessage(
    message: string,
    threadId?: string,
  ): Promise<{ message: string; threadId: string }> {
    try {
      if (!this.agent) {
        throw new Error('Agent not initialized');
      }

      // Generate threadId if not provided
      const conversationThreadId = threadId || uuidv4();

      // Find or create conversation
      await this.conversationService.findOrCreateConversation(
        conversationThreadId,
      );

      // Load conversation history from database
      const history =
        await this.conversationService.getConversationHistory(
          conversationThreadId,
        );

      // Format messages for LangChain
      const messages = [
        ...history.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: 'user' as const, content: message },
      ];

      // Invoke agent (built-in ReAct loop handles tool calling)
      const result = await this.agent.invoke({
        messages,
      });

      // Extract final response from last message
      const lastMessage = result.messages[result.messages.length - 1];
      const agentResponse =
        typeof lastMessage.content === 'string'
          ? lastMessage.content
          : JSON.stringify(lastMessage.content);

      // Save user message to database
      await this.conversationService.saveMessage(
        conversationThreadId,
        MessageRole.USER,
        message,
      );

      // Save AI response to database
      await this.conversationService.saveMessage(
        conversationThreadId,
        MessageRole.ASSISTANT,
        agentResponse,
        lastMessage.tool_calls || null,
      );

      // Return response with threadId
      return {
        message: agentResponse,
        threadId: conversationThreadId,
      };
    } catch (error) {
      this.logger.error('Agent invocation failed:', error);
      throw new Error('Failed to process message with agent');
    }
  }
}
