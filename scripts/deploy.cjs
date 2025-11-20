#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const distDir = path.resolve(__dirname, '..', 'dist');
const ghPagesDir = path.resolve(__dirname, '..', '.gh-pages');

if (!fs.existsSync(distDir)) {
  console.error('❌ dist/ folder not found. Run npm run build first.');
  process.exit(1);
}

try {
  console.log('📦 Preparing gh-pages branch...');

  // Clean up old worktree if exists
  if (fs.existsSync(ghPagesDir)) {
    console.log('🧹 Cleaning up old gh-pages checkout...');
    execSync('git worktree remove .gh-pages', { stdio: 'ignore' });
  }

  // Check if gh-pages branch exists, if not create it
  try {
    execSync('git rev-parse --verify gh-pages', { stdio: 'ignore' });
    console.log('✅ gh-pages branch exists.');
  } catch {
    console.log('🆕 Creating new gh-pages branch...');
    execSync('git checkout --orphan gh-pages', { stdio: 'inherit' });
    execSync('git rm -rf .', { stdio: 'inherit' });
    execSync('git commit --allow-empty -m "Initial gh-pages commit"', { stdio: 'inherit' });
    execSync('git checkout master', { stdio: 'inherit' });
  }

  // Create worktree for gh-pages
  console.log('📂 Setting up worktree for gh-pages...');
  execSync('git worktree add .gh-pages gh-pages', { stdio: 'inherit' });

  // Clear existing content in gh-pages worktree
  const ghPagesFiles = fs.readdirSync(ghPagesDir);
  ghPagesFiles.forEach(file => {
    if (file !== '.git') {
      const filePath = path.join(ghPagesDir, file);
      if (fs.statSync(filePath).isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(filePath);
      }
    }
  });

  // Copy dist contents
  console.log('📋 Copying dist/ to gh-pages...');
  const distFiles = fs.readdirSync(distDir);
  distFiles.forEach(file => {
    const src = path.join(distDir, file);
    const dest = path.join(ghPagesDir, file);
    if (fs.statSync(src).isDirectory()) {
      fs.cpSync(src, dest, { recursive: true });
    } else {
      fs.copyFileSync(src, dest);
    }
  });

  // Commit and push
  console.log('💾 Committing changes...');
  execSync('git add -A', { cwd: ghPagesDir, stdio: 'inherit' });
  const commitMsg = 'Deploy: ' + new Date().toISOString();
  execSync('git commit -m "' + commitMsg + '"', { cwd: ghPagesDir, stdio: 'inherit' });

  console.log('🚀 Pushing to gh-pages...');
  execSync('git push -u origin gh-pages', { cwd: ghPagesDir, stdio: 'inherit' });

  console.log('✅ Deployment complete!');
  console.log('📍 Your site should be live at: https://zixuanng.github.io/Seoul-Bites/');

  // Cleanup worktree
  console.log('🧹 Cleaning up worktree...');
  execSync('git worktree remove .gh-pages', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
