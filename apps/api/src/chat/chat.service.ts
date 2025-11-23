import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { FlagsService } from '../flags/flags.service';
import { EvaluationService } from '../evaluation/evaluation.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { Environment } from '../entities/feature-flag.entity';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private openai: OpenAI;
  private readonly systemPrompt = `You are a helpful assistant for UbieFlags, a feature flag management platform.

Your role:
- Help users understand their feature flags
- Explain why flags evaluate to ON or OFF (not true/false)
- Provide insights about flag lifecycle and usage
- Answer questions about flag rules and conditions

Key concepts:
- Flags have: key, name, environment (dev/staging/prod), state (draft/live/deprecated)
- Flags have rules with conditions (country, role, etc.) and operators (AND/OR)
- Flags can have rollout percentages
- You can evaluate flags with user context to see ON/OFF and explanation

When explaining evaluations:
- Always say ON or OFF (never true or false)
- Show which rules matched or didn't match
- Explain the reasoning in simple, clear terms
- Use ✓ for matched conditions and ✗ for unmatched

Available functions: list_flags, get_flag_details, evaluate_flag, list_stale_flags

Be concise, friendly, and technical when needed. Format responses with clear structure.`;

  constructor(
    private configService: ConfigService,
    private flagsService: FlagsService,
    private evaluationService: EvaluationService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Send a message to the chatbot and get a response
   */
  async sendMessage(
    message: string,
    conversationHistory: ChatMessageDto[] = [],
  ): Promise<{ message: string; conversationHistory: ChatMessageDto[] }> {
    try {
      // Build messages array with system prompt + history + new message
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: this.systemPrompt },
        ...conversationHistory.map((msg) => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        })),
        { role: 'user', content: message },
      ];

      // Call OpenAI with function calling
      const response = await this.openai.chat.completions.create({
        model: this.configService.get('OPENAI_MODEL', 'gpt-4-turbo-preview'),
        messages,
        tools: this.getFunctionDefinitions(),
        tool_choice: 'auto',
      });

      const responseMessage = response.choices[0].message;

      console.log('OpenAI response message:', responseMessage);

      // Handle function calls if any
      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        return await this.handleFunctionCalls(
          messages,
          responseMessage,
          conversationHistory,
          message,
        );
      }

      // No function calls, return direct response
      const updatedHistory = [
        ...conversationHistory,
        { role: 'user' as const, content: message },
        {
          role: 'assistant' as const,
          content:
            responseMessage.content ||
            'I apologize, I could not generate a response.',
        },
      ];

      return {
        message:
          responseMessage.content ||
          'I apologize, I could not generate a response.',
        conversationHistory: updatedHistory,
      };
    } catch (error) {
      this.logger.error('Error in sendMessage:', error);
      throw new Error('Failed to process chat message');
    }
  }

  /**
   * Handle function calls from OpenAI
   */
  private async handleFunctionCalls(
    messages: OpenAI.Chat.ChatCompletionMessageParam[],
    responseMessage: OpenAI.Chat.ChatCompletionMessage,
    conversationHistory: ChatMessageDto[],
    userMessage: string,
  ): Promise<{ message: string; conversationHistory: ChatMessageDto[] }> {
    // Add assistant's message with tool calls to the conversation
    const messagesWithToolCalls = [
      ...messages,
      responseMessage as OpenAI.Chat.ChatCompletionMessageParam,
    ];

    // Execute each function call
    const toolResults: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    for (const toolCall of responseMessage.tool_calls || []) {
      if (toolCall.type === 'function') {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);

        this.logger.log(
          `Executing function: ${functionName} with args:`,
          functionArgs,
        );

        const result = await this.executeFunction(functionName, functionArgs);

        toolResults.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }
    }

    // Send function results back to OpenAI for final response
    const finalResponse = await this.openai.chat.completions.create({
      model: this.configService.get('OPENAI_MODEL', 'gpt-4-turbo-preview'),
      messages: [...messagesWithToolCalls, ...toolResults],
    });

    const finalMessage =
      finalResponse.choices[0].message.content || 'No response generated.';

    // Update conversation history
    const updatedHistory = [
      ...conversationHistory,
      { role: 'user' as const, content: userMessage },
      { role: 'assistant' as const, content: finalMessage },
    ];

    return {
      message: finalMessage,
      conversationHistory: updatedHistory,
    };
  }

  /**
   * Execute a function based on name and arguments
   */
  private async executeFunction(functionName: string, args: any): Promise<any> {
    try {
      switch (functionName) {
        case 'list_flags':
          return await this.listFlags(args.environment);
        case 'get_flag_details':
          return await this.getFlagDetails(args.flagKey, args.environment);
        case 'evaluate_flag':
          return await this.evaluateFlag(
            args.flagKey,
            args.environment,
            args.context,
          );
        case 'list_stale_flags':
          return await this.listStaleFlags(args.days);
        default:
          return { error: `Unknown function: ${functionName}` };
      }
    } catch (error) {
      this.logger.error(`Error executing function ${functionName}:`, error);
      return { error: `Failed to execute ${functionName}: ${error.message}` };
    }
  }

  /**
   * Get function definitions for OpenAI function calling
   */
  private getFunctionDefinitions(): OpenAI.Chat.ChatCompletionTool[] {
    return [
      {
        type: 'function',
        function: {
          name: 'list_flags',
          description:
            'Get all feature flags, optionally filtered by environment',
          parameters: {
            type: 'object',
            properties: {
              environment: {
                type: 'string',
                enum: ['dev', 'staging', 'prod'],
                description: 'Filter flags by environment (optional)',
              },
            },
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_flag_details',
          description: 'Get detailed information about a specific flag',
          parameters: {
            type: 'object',
            properties: {
              flagKey: {
                type: 'string',
                description: 'The unique key of the flag',
              },
              environment: {
                type: 'string',
                enum: ['dev', 'staging', 'prod'],
                description: 'The environment to get the flag from',
              },
            },
            required: ['flagKey', 'environment'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'evaluate_flag',
          description:
            'Evaluate a flag for a specific user context and get detailed explanation of why it evaluated to ON or OFF',
          parameters: {
            type: 'object',
            properties: {
              flagKey: {
                type: 'string',
                description: 'The unique key of the flag to evaluate',
              },
              environment: {
                type: 'string',
                enum: ['dev', 'staging', 'prod'],
                description: 'The environment to evaluate in',
              },
              context: {
                type: 'object',
                description:
                  'User/evaluation context with attributes like userId, country, role, age, email, etc.',
              },
            },
            required: ['flagKey', 'environment', 'context'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'list_stale_flags',
          description:
            'Get flags that have not been evaluated recently (stale flags)',
          parameters: {
            type: 'object',
            properties: {
              days: {
                type: 'number',
                description:
                  'Number of days of inactivity to consider a flag stale (default 30)',
              },
            },
          },
        },
      },
    ];
  }

  /**
   * Function implementations
   */
  private async listFlags(environment?: string) {
    const flags = await this.flagsService.findAll();

    const filtered = environment
      ? flags.filter((f) => f.environment === environment)
      : flags;

    return {
      count: filtered.length,
      flags: filtered.map((f) => ({
        key: f.key,
        name: f.name,
        environment: f.environment,
        state: f.state,
        defaultValue: f.defaultValue ? 'ON' : 'OFF',
        lastEvaluated: f.lastEvaluatedAt,
      })),
    };
  }

  private async getFlagDetails(flagKey: string, environment: string) {
    const flags = await this.flagsService.findAll();
    const flag = flags.find(
      (f) => f.key === flagKey && f.environment === environment,
    );

    if (!flag) {
      return {
        error: `Flag '${flagKey}' not found in ${environment} environment`,
      };
    }

    return {
      key: flag.key,
      name: flag.name,
      description: flag.description,
      environment: flag.environment,
      state: flag.state,
      defaultValue: flag.defaultValue ? 'ON' : 'OFF',
      rules: flag.rules,
      createdAt: flag.createdAt,
      updatedAt: flag.updatedAt,
      lastEvaluatedAt: flag.lastEvaluatedAt,
    };
  }

  private async evaluateFlag(
    flagKey: string,
    environment: string,
    context: any,
  ) {
    try {
      const result = await this.evaluationService.evaluateFlag(
        flagKey,
        environment as Environment,
        context,
      );

      return {
        flagKey: result.explanation.flagKey,
        environment: result.explanation.environment,
        result: result.result ? 'ON' : 'OFF',
        defaultValue: result.explanation.defaultValue ? 'ON' : 'OFF',
        matchedRule: result.explanation.matchedRule,
        details: result.explanation.details,
        context: context,
      };
    } catch (error) {
      return { error: `Failed to evaluate flag: ${error.message}` };
    }
  }

  private async listStaleFlags(days: number = 30) {
    const staleFlags = await this.flagsService.findStaleFlags(days);

    return {
      staleDays: days,
      staleCount: staleFlags.length,
      staleFlags: staleFlags.map((f) => ({
        key: f.key,
        name: f.name,
        environment: f.environment,
        state: f.state,
        lastEvaluatedAt: f.lastEvaluatedAt,
        daysSinceEvaluation: f.lastEvaluatedAt
          ? Math.floor(
              (Date.now() - new Date(f.lastEvaluatedAt).getTime()) /
                (1000 * 60 * 60 * 24),
            )
          : 'Never',
      })),
    };
  }
}
