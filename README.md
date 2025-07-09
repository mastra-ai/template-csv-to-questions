# CSV to Questions Generator

A Mastra template that processes CSV files from URLs and generates comprehensive questions from their content using OpenAI GPT-4o.

## Overview

This template demonstrates a streamlined workflow:

1. **Input**: CSV URL
2. **Download & Parse**: Fetch and parse the CSV file
3. **Generate Questions**: Create questions using OpenAI GPT-4o with CSV-specific context

## Prerequisites

- Node.js 20.9.0 or higher
- OpenAI API key

## Setup

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Set up environment variables:**

   ```bash
   export OPENAI_API_KEY="your-openai-api-key-here"
   ```

3. **Run the example:**

   ```bash
   npx tsx example.ts
   ```

## Usage

### Basic Usage

```typescript
import { mastra } from './src/mastra';

async function runCSVExample() {
  const run = await mastra.getWorkflow('csvToQuestionsWorkflow').createRunAsync();

  const result = await run.start({
    inputData: {
      csvUrl: 'https://example.com/data.csv',
    },
  });

  if (result.status === 'success' && result.result?.success) {
    console.log(result.result.questions);
  }
}
```

### Expected Output

```javascript
{
  status: 'success',
  result: {
    questions: [
      "What are the main columns in this CSV dataset?",
      "How many total entries are included in the data?",
      "Which category shows the highest values?",
      "What patterns can you identify in the data?",
      // ... more questions
    ],
    success: true
  }
}
```

## Architecture

### Components

- **`csvToQuestionsWorkflow`**: Main workflow orchestrating the process
- **`csvQuestionAgent`**: Mastra agent specialized in generating questions from CSV data
- **`csv-tool`**: CSV fetching and parsing utility with data analysis

### Workflow Steps

1. **`download-parse-csv`**: Downloads CSV from URL and parses it into structured data
2. **`generate-questions`**: Creates comprehensive questions using the CSV question generator agent

## Features

- ✅ **URL-based CSV Processing**: Fetches CSV files from any public URL
- ✅ **Smart CSV Parsing**: Handles quoted fields, different delimiters, and data types
- ✅ **Data Analysis**: Provides insights about data structure, types, and patterns
- ✅ **CSV-Specific Questions**: Generates questions tailored for tabular data
- ✅ **Statistical Context**: Includes row/column counts and data type analysis
- ✅ **Structured Output**: Returns organized, educational questions

## How It Works

### CSV Processing Strategy

1. **Download**: Fetches CSV content from provided URL
2. **Parse**: Uses custom CSV parser to handle various formats
3. **Analyze**: Determines data types, structure, and provides sample data
4. **Format**: Creates formatted text suitable for question generation

### Question Generation

The CSV-specific agent creates questions that cover:
- **Data Structure**: Column names, data types, row/column counts
- **Statistical Analysis**: Patterns, trends, ranges, and distributions
- **Comparative Analysis**: Comparisons between different data points
- **Practical Applications**: Real-world use cases and insights

## Configuration

### Environment Variables

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### Customization

You can customize the question generation by modifying the `csvQuestionAgent`:

```typescript
export const csvQuestionAgent = new Agent({
  name: 'CSV Question Generator',
  instructions: `
    // Customize instructions here for different question types
    // Focus on specific aspects like statistical analysis, patterns, etc.
  `,
  model: openai('gpt-4o'),
});
```

## Development

### Project Structure

```text
src/mastra/
├── agents/
│   └── csv-question-agent.ts       # CSV-specific question generation agent
├── tools/
│   └── csv-tool.ts                 # CSV fetching and parsing utility
├── workflows/
│   └── csv-to-questions-workflow.ts # Main workflow
└── index.ts                        # Mastra configuration
```

### Testing

```bash
# Run with a test CSV
export OPENAI_API_KEY="your-api-key"
npx tsx example.ts
```

## Example CSV URLs

For testing, you can use these public CSV files:

- World Cities: `https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/1_OneNum.csv`
- Sample Data: `https://people.sc.fsu.edu/~jburkardt/data/csv/cities.csv`
- Weather Data: `https://raw.githubusercontent.com/plotly/datasets/master/2014_world_gdp_with_codes.csv`

## Common Issues

### "OPENAI_API_KEY is not set"
- Make sure you've set the environment variable
- Check that your API key is valid and has sufficient credits

### "Failed to fetch CSV"
- Verify the CSV URL is accessible and returns valid CSV data
- Check network connectivity
- Ensure the URL points to a raw CSV file (not a webpage)

### "CSV has no valid rows"
- The CSV file might be empty or have formatting issues
- Check if the CSV uses standard comma delimiters
- Verify the file is a valid CSV format

## What Makes This Template Special

### 🎯 **CSV-Optimized Question Generation**
- Questions specifically designed for tabular data
- Covers data structure, patterns, and statistical analysis
- Includes comparative and analytical questions

### 📊 **Smart Data Analysis**
- Automatic data type detection
- Row/column analysis
- Sample data extraction for context

### 🔧 **Flexible CSV Processing**
- Handles various CSV formats and delimiters
- Supports quoted fields and mixed data types
- Robust error handling

### 🚀 **Easy Integration**
- Simple URL-based input
- Structured JSON output
- Clear workflow steps

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
