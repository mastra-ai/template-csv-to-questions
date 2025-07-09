import { mastra } from './src/mastra';

async function runCSVToQuestionsExample() {
  try {
    console.log('🚀 Starting CSV to Questions Example...\n');

    // Example CSV URLs - you can replace this with any publicly accessible CSV URL
    const csvUrls = [
      'https://raw.githubusercontent.com/plotly/datasets/master/2014_world_gdp_with_codes.csv',
      'https://people.sc.fsu.edu/~jburkardt/data/csv/cities.csv',
      'https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/1_OneNum.csv'
    ];

    const csvUrl = csvUrls[0]; // Using the first URL as default

    console.log(`📊 Processing CSV from: ${csvUrl}`);
    console.log('⏳ This may take a moment to download, parse, and generate questions...\n');

    // Run the CSV to questions workflow
    const run = await mastra.getWorkflow('csvToQuestionsWorkflow').createRunAsync();

    const result = await run.start({
      inputData: { csvUrl },
    });

    if (result.status === 'success' && result.result?.success && result.result.questions.length > 0) {
      console.log('✅ Workflow completed successfully!\n');
      console.log('📋 Generated Questions:');
      console.log('=' .repeat(50));

      result.result.questions.forEach((question, index) => {
        console.log(`${index + 1}. ${question}`);
      });

      console.log('\n' + '=' .repeat(50));
      console.log(`🎯 Generated ${result.result.questions.length} questions from CSV data`);
    } else {
      console.log('❌ No questions were generated');
      if (result.status === 'failed') {
        console.error('Workflow failed:', result.error);
      }
    }

  } catch (error) {
    console.error('❌ Error running CSV to Questions workflow:', error);
    console.log('\n💡 Make sure you have set your OPENAI_API_KEY environment variable');
    console.log('   export OPENAI_API_KEY="your-api-key-here"');
  }
}

// Run the example
runCSVToQuestionsExample();
