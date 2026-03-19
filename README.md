<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1v753qvdTgY8b0T1VgeykV0kdvTP0sny1

## Run Locally

**Prerequisites:**  Node.js

> ⚠️ Firebase is no longer used by this project. All SMS/OTP logic has been migrated to MSG91 via the backend API, so you can safely uninstall the `firebase` package after pulling the latest changes.

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
