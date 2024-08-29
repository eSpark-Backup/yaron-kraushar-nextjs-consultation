#!/bin/bash

# Checkout to production branch
git checkout production

# Pull latest changes from main branch
git pull origin main

# Build the Next.js application
npm run build

# Ask user for confirmation
read -p "Do you want to deploy this version? (y/n): " confirm

if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
    # Get current version from package.json
    current_version=$(node -p "require('./package.json').version")
    
    # Increment patch version
    new_version=$(echo $current_version | awk -F. '{$NF = $NF + 1;} 1' | sed 's/ /./g')
    
    # Update version in package.json
    sed -i '' "s/\"version\": \"$current_version\"/\"version\": \"$new_version\"/" package.json
    
    # Commit and push changes
    git add .
    git commit -m "bump to version $new_version"
    git push origin production
    git checkout -
    
    echo "Deployed version $new_version"
else
    echo "Deployment cancelled"
fi