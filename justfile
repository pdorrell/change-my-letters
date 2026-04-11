# Clean all caches and generated files
clean:
    rm -rf node_modules .npm-cache dist build deploy

# Initial setup
setup:
    npm install

# Run local dev server
run:
    npm run dev

# Deploy (version update, full build with tests, deploy to target)
deploy:
    npm run deploy

# Lint and type-check code
check:
    npm run check-code

# Run tests
test:
    npm run test

# Audit for security vulnerabilities
audit:
    npm audit
