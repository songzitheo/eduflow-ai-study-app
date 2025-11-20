#!/bin/bash

# Instructions: This script will push your code to your GitHub repository
# Run: bash SETUP_NEW_REPO.sh

# Your GitHub username
GITHUB_USERNAME="songzitheo"

# Your repository name
REPO_NAME="eduflow-ai-study-app"

echo "Setting up new GitHub repository..."
echo "Repository: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""

# Remove the old origin
git remote remove origin

# Add your new repository as origin
git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

# Rename branch to main (if needed)
git branch -M main

# Push to your new repository
git push -u origin main

echo ""
echo "✅ Done! Your code is now in your own GitHub repository:"
echo "https://github.com/$GITHUB_USERNAME/$REPO_NAME"
