import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { fetchAndParseCSV } from '../tools/csv-tool';

// Define schemas for input and outputs
const csvInputSchema = z.object({
  csvUrl: z.string().describe('URL to a CSV file to download and process'),
});

const parsedCSVSchema = z.object({
  csvData: z.string().describe('The parsed CSV data as formatted text'),
  rowCount: z.number().describe('Number of rows in the CSV'),
  columnCount: z.number().describe('Number of columns in the CSV'),
});

const questionsSchema = z.object({
  questions: z
    .array(z.string())
    .describe('The generated questions from the CSV content'),
  success: z
    .boolean()
    .describe('Indicates if the question generation was successful'),
});

// Step 1: Download and Parse CSV from URL
const downloadAndParseCSVStep = createStep({
  id: 'download-parse-csv',
  description: 'Downloads and parses CSV from URL',
  inputSchema: csvInputSchema,
  outputSchema: parsedCSVSchema,
  execute: async ({ inputData }) => {
    console.log('Executing Step: download-parse-csv');
    const { csvUrl } = inputData;

    console.log('Downloading and parsing CSV from URL:', csvUrl);
    try {
      const result = await fetchAndParseCSV(csvUrl);

      console.log(
        `Step download-parse-csv: Succeeded - Parsed ${result.rowCount} rows and ${result.columnCount} columns`
      );

      return result;
    } catch (error) {
      throw new Error(
        `Failed to download and parse CSV from URL: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  },
});

// Step 2: Generate Questions from CSV Data
const generateQuestionsStep = createStep({
  id: 'generate-questions',
  description: 'Generates questions from the parsed CSV data',
  inputSchema: parsedCSVSchema,
  outputSchema: questionsSchema,
  execute: async ({ inputData, mastra }) => {
    console.log('Executing Step: generate-questions');

    const { csvData, rowCount, columnCount } = inputData;

    if (!csvData) {
      console.error('Missing CSV data in question generation step');
      return { questions: [], success: false };
    }

    try {
      const agent = mastra?.getAgent('csvQuestionAgent');
      if (!agent) {
        throw new Error('CSV question generator agent not found');
      }

      const streamResponse = await agent.stream([
        {
          role: 'user',
          content: `Generate comprehensive questions based on the following CSV data analysis.
Please create questions that test understanding of the data structure, patterns, and practical applications.

Dataset Overview:
- Total Rows: ${rowCount}
- Total Columns: ${columnCount}

${csvData}

Create questions that help someone understand:
1. The structure and content of this CSV data
2. Patterns and trends within the data
3. Comparisons between different data points
4. Practical applications and insights from the data
5. Statistical and analytical aspects of the dataset`,
        },
      ]);

      let generatedContent = '';

      for await (const chunk of streamResponse.textStream) {
        generatedContent += chunk || '';
      }

      if (generatedContent.trim().length > 20) {
        // Parse the questions from the generated content
        const questions = parseQuestionsFromText(generatedContent);

        console.log(
          `Step generate-questions: Succeeded - Generated ${questions.length} questions`
        );
        return { questions, success: true };
      } else {
        console.warn(
          'Step generate-questions: Failed - Generated content too short'
        );
        return { questions: [], success: false };
      }
    } catch (error) {
      console.error(
        'Step generate-questions: Failed - Error during generation:',
        error
      );
      return { questions: [], success: false };
    }
  },
});

// Helper function to parse questions from generated text
function parseQuestionsFromText(text: string): string[] {
  // Split by common question patterns and clean up
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => line.includes('?') || line.match(/^\d+[\.\)]/)); // Question marks or numbered items

  // Extract actual questions
  const questions = lines
    .map((line) => {
      // Remove numbering patterns like "1.", "1)", etc.
      let cleaned = line.replace(/^\d+[\.\)]\s*/, '');
      // Remove bullet points
      cleaned = cleaned.replace(/^[\-\*\•]\s*/, '');
      return cleaned.trim();
    })
    .filter((q) => q.length > 5) // Filter out very short strings
    .slice(0, 10); // Limit to 10 questions

  return questions;
}

// Define the workflow with sequential steps
export const csvToQuestionsWorkflow = createWorkflow({
  id: 'csv-to-questions',
  description:
    'Downloads CSV from URL, parses the data, and generates questions from the content',
  inputSchema: csvInputSchema,
  outputSchema: questionsSchema,
})
  .then(downloadAndParseCSVStep)
  .then(generateQuestionsStep)
  .commit();
