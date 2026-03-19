# 🎬 MSG91 Widget Integration - ACTION CARD

## ⏱️ Quick Action Plan (Choose Your Time)

---

## 🏃 **OPTION 1: 5-Minute Version (Just Get It Done!)**

### Step 1: Get Credentials (2 min)
```
Login: https://www.msg91.com/app/
Go to: OTP Verification → Widget Settings
Copy: Widget ID
Copy: Token Auth
Done!
```

### Step 2: Configure (2 min)
```env
# Create file: .env.local

VITE_MSG91_WIDGET_ID=your_widget_id_here
VITE_MSG91_TOKEN_AUTH=your_token_auth_here
VITE_MSG91_ENABLED=true
```

### Step 3: Test (1 min)
```bash
# Clear cache & restart
npm run dev

# In browser console
window.sendOtp ? console.log('✅ Ready!') : console.log('⏳ Loading...')
```

**DONE!** Your app now has OTP! 🎉

---

## 📖 **OPTION 2: 15-Minute Version (Understand It)**

### Follow This Guide
👉 [MSG91_CREDENTIALS_SETUP.md](MSG91_CREDENTIALS_SETUP.md)

**It includes:**
- Step-by-step credential retrieval
- Screenshots of MSG91 dashboard
- Troubleshooting for common issues
- Security best practices
- Verification checklist

**Result**: You'll know how to get credentials anytime

---

## 🎓 **OPTION 3: 30+ Minute Version (Master It)**

### Read These In Order
1. [MSG91_WIDGET_QUICK_START.md](MSG91_WIDGET_QUICK_START.md) - Quick overview (5 min)
2. [MSG91_CREDENTIALS_SETUP.md](MSG91_CREDENTIALS_SETUP.md) - Get credentials (10 min)
3. [MSG91_WIDGET_COMPLETE_GUIDE.md](MSG91_WIDGET_COMPLETE_GUIDE.md) - Full guide (20 min)
4. [MSG91_USAGE_EXAMPLES.tsx](MSG91_USAGE_EXAMPLES.tsx) - Code examples (10 min)

**Result**: You'll be an MSG91 expert!

---

## 🎯 **YOUR NEXT STEP**

### Choose One:

**⚡ I'm in a rush**
→ Do OPTION 1 above (5 min)

**📚 I want to understand**
→ Start with [MSG91_WIDGET_QUICK_START.md](MSG91_WIDGET_QUICK_START.md) (5 min quick start)

**🧠 I need everything**
→ Read [MSG91_COMPLETE_OVERVIEW.md](MSG91_COMPLETE_OVERVIEW.md) for full context

---

## 📋 **Credential Checklist**

After setup, verify you have:

- [ ] **Widget ID**
  - Format: 24+ hexadecimal characters
  - Example: `36624272444f333931393831`
  - Source: MSG91 Dashboard → OTP Verification → Widget Settings

- [ ] **Token Auth**
  - Format: 32+ alphanumeric characters
  - Example: `497026TZDdbCze69a336a2P1`
  - Source: Same location as Widget ID

- [ ] **.env.local file** has:
  ```env
  VITE_MSG91_WIDGET_ID=your_value
  VITE_MSG91_TOKEN_AUTH=your_value
  ```

- [ ] **Cache cleared**
  ```
  Ctrl+Shift+Delete (Windows)
  Cmd+Shift+Delete (Mac)
  ```

- [ ] **Dev server restarted**
  ```bash
  npm run dev
  ```

---

## 🧪 **Quick Validation Tests**

### Test 1: Script Loaded?
```javascript
// In browser console after 2 seconds
typeof window.sendOtp === 'function' ? 
  console.log('✅ MSG91 Ready') : 
  console.log('⏳ Still loading...')
```

### Test 2: Can Send OTP?
```javascript
window.sendOtp(
  '9999999999',  // Test number
  (d) => console.log('✅ Sent:', d),
  (e) => console.log('❌ Error:', e)
)
```

### Test 3: Can Verify OTP?
```javascript
window.verifyOtp(
  1234,  // Test OTP for 9999999999
  (d) => console.log('✅ Verified:', d),
  (e) => console.log('❌ Failed:', e)
)
```

---

## 🔗 **All Documentation Files**

### Essential (Start Here)
- ✅ [MSG91_WIDGET_QUICK_START.md](MSG91_WIDGET_QUICK_START.md) - 5 min quick start
- ✅ [MSG91_CREDENTIALS_SETUP.md](MSG91_CREDENTIALS_SETUP.md) - Get credentials
- ✅ [MSG91_WIDGET_COMPLETE_GUIDE.md](MSG91_WIDGET_COMPLETE_GUIDE.md) - Full guide
- ✅ [MSG91_UPDATE_v2.md](MSG91_UPDATE_v2.md) - What changed

### Reference
- 📄 [MSG91_QUICK_REFERENCE.md](MSG91_QUICK_REFERENCE.md) - API methods
- 📄 [MSG91_SETUP_GUIDE.md](MSG91_SETUP_GUIDE.md) - Detailed setup
- 📄 [MSG91_USAGE_EXAMPLES.tsx](MSG91_USAGE_EXAMPLES.tsx) - Code examples
- 📄 [MSG91_COMPLETE_OVERVIEW.md](MSG91_COMPLETE_OVERVIEW.md) - Full overview

### Navigation
- 🗂️ [MSG91_INDEX.md](MSG91_INDEX.md) - Navigation hub

---

## 💻 **Code Integration (3 Lines!)**

After setup, use in your app:

```typescript
import { auth } from './auth';

// Send OTP
await auth.sendOTP(mobile);

// Verify OTP
await auth.verifyOTP(mobile, otp);

// Done! ✨
```

**That's it!** MSG91 automatically activates with fallback to backend.

---

## 🚨 **Common Mistakes to Avoid**

### ❌ Mistake 1: Wrong Credential Copy
```env
# WRONG - using Template ID instead of Widget ID
VITE_MSG91_TOKEN_AUTH=template_id_here  ❌

# RIGHT - using actual Widget ID
VITE_MSG91_WIDGET_ID=36624272444f333931393831  ✅
```

### ❌ Mistake 2: Not Clearing Cache
```bash
# WRONG - just reloading page
# Page still loads old credentials

# RIGHT - clear cache first
Ctrl+Shift+Delete  ✅
npm run dev  ✅
```

### ❌ Mistake 3: Wrong Mobile Format
```javascript
// WRONG - no country code
window.sendOtp('9999999999')  ❌

// RIGHT - with country code (91 for India)
window.sendOtp('919999999999')  ✅
```

### ❌ Mistake 4: Not Waiting for Script Load
```javascript
// WRONG - immediate check
console.log(window.sendOtp);  // undefined ❌

// RIGHT - wait for script
setTimeout(() => {
  console.log(window.sendOtp);  // function ✅
}, 2000);
```

---

## 🎯 **Success Indicators**

You'll know it's working when:

✅ Browser console shows no errors  
✅ `window.sendOtp` is a function  
✅ `window.verifyOtp` is a function  
✅ OTP sends to test mobile  
✅ OTP verification succeeds with code 1234  
✅ Retry channels work  
✅ Backend fallback works  

---

## 🆘 **If Something Goes Wrong**

### Script Not Loading?
→ Check [MSG91_WIDGET_COMPLETE_GUIDE.md](MSG91_WIDGET_COMPLETE_GUIDE.md) → Troubleshooting

### OTP Not Received?
→ Check [MSG91_CREDENTIALS_SETUP.md](MSG91_CREDENTIALS_SETUP.md) → Mobile format

### Credentials Wrong?
→ Re-read [MSG91_CREDENTIALS_SETUP.md](MSG91_CREDENTIALS_SETUP.md) → Step 2-3

### Need Help?
→ Go to [MSG91_INDEX.md](MSG91_INDEX.md) → Find what you need

---

## 📊 **What Gets Installed**

### Code Files (3)
- msg91Service.ts (Service wrapper)
- msg91Config.ts (Configuration)
- types.msg91.ts (TypeScript types)

### Component (1)
- MSG91OTPVerification.tsx (Pre-built UI)

### Updated Files (2)
- auth.ts (Added MSG91 support)
- index.html (Added script loading)

### Documentation (11)
- Setup guides, API reference, examples, etc.

### Total Setup Time
- **5 minutes** if just configuring
- **15-30 minutes** if learning
- **1 hour** if mastering all features

---

## 🚀 **Ready to Go!**

### RIGHT NOW:
```
1. Read this card (already done ✅)
2. Choose your time option above ⏰
3. Follow the guide 📖
4. Get credentials 🔑
5. Add to .env.local ⚙️
6. Clear cache & restart 🔄
7. Test in console 🧪
8. Done! 🎉
```

### Pick Your Path:

| Time | Action |
|------|--------|
| **5 min** | Do OPTION 1 quick setup above |
| **15 min** | Read [MSG91_WIDGET_QUICK_START.md](MSG91_WIDGET_QUICK_START.md) |
| **30 min** | Follow [MSG91_WIDGET_COMPLETE_GUIDE.md](MSG91_WIDGET_COMPLETE_GUIDE.md) |

---

## 📞 **Need Anything?**

All 11 documentation files are in your project root.

Start with what you need:
- Quick start? → [MSG91_WIDGET_QUICK_START.md](MSG91_WIDGET_QUICK_START.md)
- Get credentials? → [MSG91_CREDENTIALS_SETUP.md](MSG91_CREDENTIALS_SETUP.md)
- Full guide? → [MSG91_WIDGET_COMPLETE_GUIDE.md](MSG91_WIDGET_COMPLETE_GUIDE.md)
- See examples? → [MSG91_USAGE_EXAMPLES.tsx](MSG91_USAGE_EXAMPLES.tsx)
- Find something? → [MSG91_INDEX.md](MSG91_INDEX.md)

---

## ✨ **You're All Set!**

**Everything is installed and ready to use.**

Your next action: Choose your time option (5, 15, or 30+ minutes) and start with the corresponding guide.

**Let's go! 🚀**

---

**Widget Integration v2.0** | Production Ready | Enterprise Grade  
Last Updated: March 1, 2026
