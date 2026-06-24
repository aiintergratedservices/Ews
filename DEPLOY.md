# Deploy to Fly.io (Free)

1. Install flyctl: `curl -L https://fly.io/install.sh | sh`
2. Sign up at fly.io (GitHub auth)
3. Run: `flyctl launch`
4. Get URL: `flyctl open`
5. Update CampLoJack line 604: `const SELF_HOSTED_URL = 'your-fly-url';`

Audit runs daily at 3am UTC automatically.
