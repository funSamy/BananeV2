import { Service } from 'node-windows';
import { join } from 'path';

const serviceName = 'BananeV2 Production Manager';
const serviceDescription =
  'Service de gestion de production de bananes - Backend API and Frontend Server';

// Path to the main script
const scriptPath = join(__dirname, '..', 'main.js');

// Create a new service object
const svc = new Service({
  name: serviceName,
  description: serviceDescription,
  script: scriptPath,
  nodeOptions: ['--harmony', '--max_old_space_size=4096'],
  env: [
    {
      name: 'NODE_ENV',
      value: 'production',
    },
    {
      name: 'PORT',
      value: '5000',
    },
    {
      name: 'VITE_API_URL',
      value: process.env.VITE_API_URL,
    },
  ],
  //   workingDirectory: join(__dirname, '..', '..'),
  //   allowServiceLogon: true,
});

svc.workingdirectory = join(__dirname, '..', '..');

// Function to install the service
export function installService() {
  svc.on('install', () => {
    console.log('✅ Service installed successfully!');
    console.log(`   Name: ${serviceName}`);
    console.log(`   Script: ${scriptPath}`);
    console.log('\n🚀 Starting service...');
    svc.start();
  });

  svc.on('alreadyinstalled', () => {
    console.log('ℹ️  Service is already installed.');
    console.log('   Use uninstall command first if you want to reinstall.');
  });

  svc.on('error', (err) => {
    console.error('❌ Service installation error:', err);
  });

  console.log('📦 Installing Windows Service...');
  console.log(`   Service Name: ${serviceName}`);
  console.log(`   Description: ${serviceDescription}`);
  console.log(`   Script Path: ${scriptPath}`);
  console.log('\n⚠️  Note: This requires Administrator privileges!\n');

  svc.install();
}

// Function to uninstall the service
export function uninstallService() {
  svc.on('uninstall', () => {
    console.log('✅ Service uninstalled successfully!');
  });

  svc.on('alreadyuninstalled', () => {
    console.log('ℹ️  Service is not installed.');
  });

  svc.on('error', (err) => {
    console.error('❌ Service uninstallation error:', err);
  });

  console.log('🗑️  Uninstalling Windows Service...');
  console.log(`   Service Name: ${serviceName}\n`);

  svc.uninstall();
}

// Function to start the service
export function startService() {
  svc.on('start', () => {
    console.log('✅ Service started successfully!');
  });

  svc.on('error', (err) => {
    console.error('❌ Service start error:', err);
  });

  console.log('▶️  Starting Windows Service...');
  svc.start();
}

// Function to stop the service
export function stopService() {
  svc.on('stop', () => {
    console.log('✅ Service stopped successfully!');
  });

  svc.on('error', (err) => {
    console.error('❌ Service stop error:', err);
  });

  console.log('⏹️  Stopping Windows Service...');
  svc.stop();
}

// Function to restart the service
export function restartService() {
  svc.on('stop', () => {
    console.log('⏹️  Service stopped. Restarting...');
    svc.start();
  });

  svc.on('start', () => {
    console.log('✅ Service restarted successfully!');
  });

  svc.on('error', (err) => {
    console.error('❌ Service restart error:', err);
  });

  console.log('🔄 Restarting Windows Service...');
  svc.stop();
}

// CLI handler
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case 'install':
      installService();
      break;
    case 'uninstall':
      uninstallService();
      break;
    case 'start':
      startService();
      break;
    case 'stop':
      stopService();
      break;
    case 'restart':
      restartService();
      break;
    default:
      console.log(`
🔧 BananeV2 Windows Service Manager

Usage: node windows-service.js [command]

Commands:
  install     Install the service (requires Administrator)
  uninstall   Uninstall the service (requires Administrator)
  start       Start the service
  stop        Stop the service
  restart     Restart the service

Examples:
  node dist/service/windows-service.js install
  node dist/service/windows-service.js start
  node dist/service/windows-service.js stop
  node dist/service/windows-service.js restart
  node dist/service/windows-service.js uninstall

⚠️  Note: Install and uninstall commands require Administrator privileges.
         Run PowerShell or Command Prompt as Administrator.
      `);
      process.exit(1);
  }
}
