import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getApiKey } from './config.js';
import { Question, FileStructureItem } from '../types/index.js';
import ora from 'ora';
import chalk from 'chalk';

export class AIClient {
  private anthropic?: Anthropic;
  private gemini?: GoogleGenerativeAI;
  private provider: 'anthropic' | 'gemini';

  constructor(provider: 'anthropic' | 'gemini' = 'anthropic') {
    this.provider = provider;
  }

  async initialize(): Promise<void> {
    const apiKey = await getApiKey(this.provider);

    if (this.provider === 'anthropic') {
      this.anthropic = new Anthropic({ apiKey });
    } else {
      this.gemini = new GoogleGenerativeAI(apiKey);
    }
  }

  async generateQuestions(
    idea: string,
    round: number,
    previousQA?: Array<{ question: string; answer: string }>,
    config?: {
      questionsCount: number;
      answersPerQuestion: number;
    }
  ): Promise<Question[]> {
    const spinner = ora('Generating questions...').start();

    try {
      const prompt = this.buildQuestionsPrompt(idea, round, previousQA, config);
      const response = await this.sendPrompt(prompt);

      spinner.succeed('Questions generated');

      return this.parseQuestions(response);
    } catch (error) {
      spinner.fail('Failed to generate questions');
      throw error;
    }
  }

  async generateWriteup(
    idea: string,
    allQuestions: string[],
    allAnswers: string[]
  ): Promise<string> {
    const spinner = ora('Generating technical specification...').start();

    try {
      const prompt = this.buildWriteupPrompt(idea, allQuestions, allAnswers);
      const response = await this.sendPrompt(prompt);

      spinner.succeed('Technical specification generated');

      return this.extractWriteup(response);
    } catch (error) {
      spinner.fail('Failed to generate writeup');
      throw error;
    }
  }

  async generateFileStructure(writeup: string): Promise<string> {
    const spinner = ora('Generating file structure...').start();

    try {
      const prompt = this.buildFileStructurePrompt(writeup);
      const response = await this.sendPrompt(prompt);

      spinner.succeed('File structure generated');

      return this.extractFileStructure(response);
    } catch (error) {
      spinner.fail('Failed to generate file structure');
      throw error;
    }
  }

  async convertToJson(fileStructure: string): Promise<FileStructureItem> {
    const spinner = ora('Converting to JSON...').start();

    try {
      const prompt = this.buildJsonConversionPrompt(fileStructure);
      const response = await this.sendPrompt(prompt);

      spinner.succeed('JSON structure generated');

      return this.extractJson(response);
    } catch (error) {
      spinner.fail('Failed to convert to JSON');
      throw error;
    }
  }

  private async sendPrompt(prompt: string): Promise<string> {
    if (this.provider === 'anthropic' && this.anthropic) {
      // Using Anthropic's Sonnet 4 model
      const response = await this.anthropic.messages.create({
        model: 'claude-4-sonnet',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      });

      return response.content[0].type === 'text' ? response.content[0].text : '';
    } else if (this.provider === 'gemini' && this.gemini) {
      // Using Google's Gemini 2.5 Pro thinking model
      const model = this.gemini.getGenerativeModel({ model: 'gemini-2.5-pro' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    }

    throw new Error('AI client not initialized');
  }

  private buildQuestionsPrompt(
    idea: string,
    round: number,
    previousQA?: Array<{ question: string; answer: string }>,
    config?: { questionsCount: number; answersPerQuestion: number }
  ): string {
    const questionsCount = config?.questionsCount || 5;
    const answersPerQuestion = config?.answersPerQuestion || 4;

    let prompt = `You are an expert AI agent architect and implementation specialist helping to design and develop AI agent playbooks.\n\n`;

    if (round === 1) {
      prompt += `I have an agent idea: "${idea}".\n\n`;
      prompt += `Please ask me ${questionsCount} multiple choice questions to better understand the agent's purpose, capabilities, and behavior patterns.\n`;
    } else {
      prompt += `Original idea: "${idea}"\n\n`;
      prompt += `Previous questions and answers:\n`;
      previousQA?.forEach((qa, index) => {
        prompt += `Q${index + 1}: ${qa.question}\n`;
        prompt += `A${index + 1}: ${qa.answer}\n\n`;
      });

      if (round === 2) {
        prompt += `Based on the previous answers, ask ${questionsCount} follow-up questions focusing on agent interactions, conversation flows, and unique capabilities.\n`;
      } else if (round === 3) {
        prompt += `Based on all previous answers, ask ${questionsCount} technical implementation questions about agent architecture, integrations, and deployment approach.\n`;
      }
    }

    prompt += `\nFormat your response as:\n`;
    prompt += `<questions>\n`;
    prompt += `<question>\n`;
    prompt += `<text>Your question here</text>\n`;
    prompt += `<choices>\n`;
    for (let i = 1; i <= answersPerQuestion; i++) {
      prompt += `<choice>Option ${i}</choice>\n`;
    }
    prompt += `</choices>\n`;
    prompt += `</question>\n`;
    prompt += `</questions>\n`;
    prompt += `\nProvide exactly ${questionsCount} questions with ${answersPerQuestion} choices each.`;

    return prompt;
  }

  private buildWriteupPrompt(idea: string, allQuestions: string[], allAnswers: string[]): string {
    const qaList = allQuestions.map((q, i) => `Q: ${q}\nA: ${allAnswers[i]}`).join('\n\n');

    return `You are an expert AI agent architect and implementation specialist. Based on the following agent idea and Q&A session, create a comprehensive agent playbook document.

Original Idea: "${idea}"

Questions and Answers:
${qaList}

Please create a detailed agent playbook that includes:
1. Executive Summary
2. Agent Overview and Purpose
3. Target Users and Use Cases
4. Core Capabilities and Behaviors
5. Technical Architecture
6. Data Models and Knowledge Base
7. API Design and Integrations
8. Security and Privacy Considerations
9. Performance and Scalability Requirements
10. Implementation Roadmap and Milestones

Use markdown formatting and be thorough but concise. Focus on actionable technical details.

Wrap your entire response in <writeup> tags.`;
  }

  private buildFileStructurePrompt(writeup: string): string {
    return `Based on this technical specification, create an optimal file structure for the project.

Technical Specification:
${writeup}

Please create a comprehensive file structure that:
1. Follows modern best practices
2. Groups related files logically
3. Includes all necessary configuration files
4. Identifies key dependencies and packages needed

Format the output as a tree structure with descriptions for important files/directories.

Wrap your response in <filestructure> tags.`;
  }

  private buildJsonConversionPrompt(fileStructure: string): string {
    return `Convert this file structure to a JSON format:

${fileStructure}

Create a JSON structure where each item has:
- type: "file" or "directory"
- name: the file/directory name
- description: (optional) description of the file/directory
- children: (for directories) array of child items

Wrap the JSON in <json> tags.`;
  }

  private parseQuestions(response: string): Question[] {
    const questions: Question[] = [];
    const questionRegex =
      /<question>[\s\S]*?<text>([\s\S]*?)<\/text>[\s\S]*?<choices>([\s\S]*?)<\/choices>[\s\S]*?<\/question>/g;
    const choiceRegex = /<choice>([\s\S]*?)<\/choice>/g;

    let match;
    while ((match = questionRegex.exec(response)) !== null) {
      const questionText = match[1].trim();
      const choicesText = match[2];
      const choices: string[] = [];

      let choiceMatch;
      while ((choiceMatch = choiceRegex.exec(choicesText)) !== null) {
        choices.push(choiceMatch[1].trim());
      }

      questions.push({ question: questionText, choices });
    }

    return questions;
  }

  private extractWriteup(response: string): string {
    const match = response.match(/<writeup>([\s\S]*?)<\/writeup>/);
    return match ? match[1].trim() : response;
  }

  private extractFileStructure(response: string): string {
    const match = response.match(/<filestructure>([\s\S]*?)<\/filestructure>/);
    return match ? match[1].trim() : response;
  }

  private extractJson(response: string): FileStructureItem {
    const match = response.match(/<json>([\s\S]*?)<\/json>/);
    const jsonStr = match ? match[1].trim() : response;

    try {
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error(chalk.red('Failed to parse JSON response'));
      throw error;
    }
  }
}
