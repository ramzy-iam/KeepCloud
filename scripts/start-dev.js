#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const { platform } = require('os');

console.log('🚀 Starting KeepCloud development environment...\n');

// Function to execute a command and return a promise
function execCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    const child = exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });

    // Forward output to console
    if (options.pipe !== false) {
      child.stdout?.pipe(process.stdout);
      child.stderr?.pipe(process.stderr);
    }
  });
}

// Function to check if Redis is healthy
async function waitForRedis(maxAttempts = 30) {
  console.log('⏳ Waiting for Redis to be ready...');

  for (let i = 0; i < maxAttempts; i++) {
    try {
      await execCommand('docker compose exec redis redis-cli ping', {
        pipe: false,
      });
      console.log('✅ Redis is ready!\n');
      return true;
    } catch {
      if (i === maxAttempts - 1) {
        throw new Error('Redis failed to start within the expected time');
      }
      // Wait 1 second before next attempt
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

async function startDevelopment() {
  try {
    // Step 1: Start Redis with Docker Compose
    console.log('🐳 Starting Redis with Docker Compose...');
    await execCommand('docker compose up -d redis');

    // Step 2: Wait for Redis to be healthy
    await waitForRedis();

    // Step 3: Start the API server
    console.log('🏗️  Starting KeepCloud API server...');
    console.log('📍 API will be available at: http://localhost:3000');
    console.log('📍 Redis will be available at: localhost:6379\n');
    console.log('🛑 Press Ctrl+C to stop both services\n');

    // Start the API server (this will run until stopped)
    const apiProcess = spawn('npx', ['nx', 'serve', 'keepcloud-api'], {
      stdio: 'inherit',
      shell: platform() === 'win32',
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down development environment...');

      // Kill the API process
      apiProcess.kill('SIGINT');

      // Stop Redis
      try {
        await execCommand('docker compose down');
        console.log('✅ Services stopped successfully');
      } catch (error) {
        console.error('❌ Error stopping services:', error.message);
      }

      process.exit(0);
    });

    // Handle API process exit
    apiProcess.on('exit', (code) => {
      if (code !== 0) {
        console.error(`❌ API server exited with code ${code}`);
        process.exit(code);
      }
    });
  } catch (error) {
    console.error('❌ Error starting development environment:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure Docker is running');
    console.log('2. Check if ports 3000 and 6379 are available');
    console.log(
      '3. Run "docker compose down" to clean up any existing containers',
    );
    process.exit(1);
  }
}

startDevelopment();
