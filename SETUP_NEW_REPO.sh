#!/bin/bash

# Instructions: Replace YOUR_GITHUB_USERNAME with your actual GitHub username
# Then run: bash SETUP_NEW_REPO.sh

# Change this to your GitHub username
GITHUB_USERNAME="YOUR_GITHUB_USERNAME"

# Change this to your desired repository name
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
