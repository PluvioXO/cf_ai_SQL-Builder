#!/usr/bin/env node

/**
 * SQL Query Builder - Interactive Setup
 * Run this script to get started quickly
 */

const readline = require('readline');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

function run(command, options = {}) {
  try {
    console.log(`\n⚡ Running: ${command}`);
    const result = execSync(command, { 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
    return result ? result.toString() : '';
  } catch (error) {
    console.error(`❌ Error running command: ${command}`);
    if (options.ignoreError) return '';
    throw error;
  }
}

async function main() {
  console.clear();
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║     🤖 SQL Query Builder - Cloudflare AI Stack Setup         ║
║                                                               ║
║  This will set up your complete SQL Query Builder with:      ║
║                                                               ║
║  ✅ Workers AI (Llama 3.3)      - SQL Generation             ║
║  ✅ Workflows                   - Orchestration              ║
║  ✅ Cloudflare Pages            - Frontend UI                ║
║  ✅ Durable Objects             - Conversation Memory        ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);

  const answer = await ask('\nReady to start setup? (y/n): ');
  if (answer.toLowerCase() !== 'y') {
    console.log('\n👋 Setup cancelled. Run this script again when ready!');
    rl.close();
    return;
  }

  console.log('\n📦 Step 1/5: Checking dependencies...');
  
  // Check Node version
  const nodeVersion = process.version;
  console.log(`   Node.js version: ${nodeVersion}`);
  
  // Check if wrangler is available
  try {
    const wranglerVersion = run('npx wrangler --version', { silent: true });
    console.log(`   ✅ Wrangler: ${wranglerVersion.trim()}`);
  } catch {
    console.log('   ℹ️  Wrangler will be installed with npm packages');
  }

  console.log('\n📦 Step 2/5: Installing npm packages...');
  run('npm install');

  console.log('\n🔐 Step 3/5: Cloudflare authentication...');
  console.log('   This will open your browser to login to Cloudflare.');
  
  const loginAnswer = await ask('\nProceed with login? (y/n): ');
  if (loginAnswer.toLowerCase() === 'y') {
    try {
      run('npx wrangler login');
      console.log('   ✅ Successfully logged in!');
    } catch (error) {
      console.log('   ⚠️  Login failed or was cancelled.');
      console.log('   You can run "npx wrangler login" manually later.');
    }
  } else {
    console.log('   ⏭️  Skipped. You can login later with: npx wrangler login');
  }

  console.log('\n🗄️  Step 4/5: Creating KV namespace...');
  console.log('   This stores database schemas for caching.');
  
  const kvAnswer = await ask('\nCreate KV namespace? (y/n): ');
  if (kvAnswer.toLowerCase() === 'y') {
    try {
      const kvOutput = run('npx wrangler kv:namespace create SCHEMA_CACHE');
      
      // Try to extract ID
      const idMatch = kvOutput.match(/id = "([^"]+)"/);
      if (idMatch) {
        const kvId = idMatch[1];
        console.log(`\n   ✅ KV Namespace created: ${kvId}`);
        console.log('\n   📝 Updating wrangler.toml...');
        
        // Update wrangler.toml
        const wranglerPath = path.join(__dirname, 'wrangler.toml');
        let wranglerContent = fs.readFileSync(wranglerPath, 'utf8');
        wranglerContent = wranglerContent.replace(
          /id = "preview_id"/,
          `id = "${kvId}"`
        );
        fs.writeFileSync(wranglerPath, wranglerContent);
        console.log('   ✅ wrangler.toml updated!');
      } else {
        console.log('   ⚠️  Could not extract KV ID automatically.');
        console.log('   Please update wrangler.toml manually with the ID from above.');
      }
    } catch (error) {
      console.log('   ⚠️  KV creation failed. You may need to create it manually:');
      console.log('   npx wrangler kv:namespace create SCHEMA_CACHE');
    }
  } else {
    console.log('   ⏭️  Skipped. Create manually later if needed.');
  }

  console.log('\n🧪 Step 5/5: Testing setup...');
  console.log('   Starting dev server...');
  
  const testAnswer = await ask('\nStart development server? (y/n): ');
  if (testAnswer.toLowerCase() === 'y') {
    console.log(\`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║  ✅ Setup Complete!                                           ║
║                                                               ║
║  Starting development server...                               ║
║  Open http://localhost:8787 in your browser                   ║
║                                                               ║
║  Press Ctrl+C to stop the server                              ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    \`);
    
    rl.close();
    
    // Start dev server
    try {
      run('npm run dev');
    } catch (error) {
      console.log('\\n   Server stopped.');
    }
  } else {
    console.log(\`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║  ✅ Setup Complete!                                           ║
║                                                               ║
║  Next steps:                                                  ║
║                                                               ║
║  1. Start dev server:                                         ║
║     npm run dev                                               ║
║                                                               ║
║  2. Open in browser:                                          ║
║     http://localhost:8787                                     ║
║                                                               ║
║  3. Try example queries in the chat interface                 ║
║                                                               ║
║  4. Deploy to production when ready:                          ║
║     npm run deploy                                            ║
║                                                               ║
║  📚 Documentation:                                            ║
║     • QUICKSTART.md - Quick start guide                       ║
║     • TESTING.md - Test your application                      ║
║     • DEPLOYMENT.md - Deploy to production                    ║
║     • DIAGRAM.md - Architecture visualization                 ║
║                                                               ║
║  Need help? Check README.md for full documentation            ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    \`);
    
    rl.close();
  }
}

main().catch(error => {
  console.error('\\n❌ Setup failed:', error.message);
  rl.close();
  process.exit(1);
});
