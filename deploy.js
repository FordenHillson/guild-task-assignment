// Simple deploy script for GitHub Pages
import { execSync } from 'child_process';

try {
  // Build the project
  console.log('Building the project...');
  execSync('npm run build', { stdio: 'inherit' });

  // Copy the .nojekyll file to the dist folder
  console.log('Ensuring .nojekyll file exists in dist folder...');
  execSync('copy public\\.nojekyll dist\\ /Y', { stdio: 'inherit' });
  
  // Deploy to GitHub Pages
  console.log('Deploying to GitHub Pages...');
  execSync('npm run deploy', { stdio: 'inherit' });

  console.log('Deployment completed successfully!');
} catch (error) {
  console.error('Deployment failed:', error);
  process.exit(1);
}
