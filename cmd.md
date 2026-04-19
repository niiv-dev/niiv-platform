node test/runner.js
git add .
git commit -m "feat: restructure + CRUD + DB support"
npm version patch/minor/major
git push origin main --follow-tags
npm pack
npm login
npm publish