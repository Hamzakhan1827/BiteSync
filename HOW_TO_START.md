# CraveSync - How to Start Everything

## Every time you open your PC, run these commands:

### 1. Mobile App (Terminal 1)
```
cd F:\antigravity\projects\CraveSync\mobile
npx expo start --tunnel
```
- Wait for QR code to appear
- Open Expo Go on phone → Scan QR
- Works on any network (tunnel mode)

### 2. Dashboard (Terminal 2)
```
cd F:\antigravity\projects\CraveSync\dashboard
npm run dev
```
- Open browser → localhost:3000

## Important Notes
- Keep BOTH terminal windows open while working
- If phone shows "Something went wrong" → just shake phone and tap Reload
- If port is busy → type Y when asked to use another port
- Dashboard login: localhost:3000/login
