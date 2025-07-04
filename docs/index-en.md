---
layout: default
lang: en
---

# Vinyl Lens Chrome Extension Support

## Why I Built This

I made this extension to make record shopping a bit easier (and more justifiable at home).

Here's the thing: I love collecting vinyl, but space at home is getting tight. These days, when I want to buy a record, I need a solid excuse for my family - something like "Hey, this is vinyl-only, you can't get it digitally!"

But to use that excuse, I actually need to check if it's really vinyl-only, right? That's where this extension comes in. Just click it while browsing a record shop online, and boom - it tells you if that release is vinyl-only or available in other formats too.

## How to Use It

### 1. First Things First: Get Your Gemini API Key

This extension uses Google's Gemini AI to extract music info from web pages and search on Discogs.  
You'll need a **Gemini API key** to make it work.

#### Getting Your API Key

1. Head over to [Google AI Studio](https://aistudio.google.com/app/apikey){:target="_blank" rel="noopener noreferrer"}
2. Sign in with your Google account
3. Click "Create API key"
4. Choose "Create API key in new project"
5. Copy that key - you'll need it in a sec

<div class="security-warning">
<h4>🔒 Important Security Notice</h4>
<p>Your API key is sensitive information. Never share it with others or commit it to public repositories. If your API key gets compromised, revoke it immediately and generate a new one.</p>
</div>

#### Which Model Should I Use?

- **I recommend:** `gemini-2.0-flash-lite` for now (It's fast, cheap, and gets the job done)
  - You can use fancier models if you want, but honestly, this extension doesn't need anything too powerful

**Full model list:** [Google AI Models](https://ai.google.dev/models){:target="_blank" rel="noopener noreferrer"}

### 2. Setting Up the Extension

1. Click the Chrome extension icon (it looks like a little record player!)
2. Hit the Settings button (the gear icon)
3. Paste your API key in the "Gemini API Key" field
4. Click Save

### 3. Using the Extension

1. Go to any record product page
2. Click the extension icon
3. Hit "Search"
4. Wait for the magic to happen

#### Understanding the Results

- **🎵 VINYL ONLY RELEASE** (green): This one's vinyl-only!
- **📀 MULTIPLE FORMATS AVAILABLE** (red): Available in other formats too

## Heads Up

### ⚠️ Things to Know

1. **About Accuracy**

   - The music detection and search aren't 100% perfect
   - Since it's AI-powered, you might get the odd weird result

2. **About Costs**

   - You'll be charged for Gemini API usage
   - **But don't worry - most people will stay within Google's free tier**
   - Check out [Google AI Studio pricing](https://ai.google.dev/pricing){:target="_blank" rel="noopener noreferrer"} for details

3. **Where It Might Not Work**

   - Some websites just don't play nice
   - Chrome blocks extensions on certain pages (like chrome:// URLs and other extension pages)

### FAQ

**Q: The extension isn't working. Help?**

A: Check these things:

- Is your API key set up correctly?
- Does the page actually have music content?
- Is your internet connection working?

**Q: Why am I getting different results sometimes?**

A: AI can be a bit moody. For the final word, always double-check on the actual label site, Bandcamp, or Discogs page.

**Q: How much is this gonna cost me?**

A: For normal use, Google's free tier (1,500 requests per month) should be plenty.  
Check the pricing page for specifics.

## Tech Stuff

- Why Gemini?

  - I figured most people already have Google accounts, making Gemini the easiest to set up
    - Plus, I'm using Google search features too, so it made sense to keep everything in the Google ecosystem
    - No plans to support OpenAI or Anthropic right now, sorry!

- The code lives here:

  - **GitHub**: [chrome-extension-vinyl-lens](https://github.com/junyan21/chrome-extension-vinyl-lens){:target="_blank" rel="noopener noreferrer"}

  - Got issues? Hit me up on [GitHub Issues](https://github.com/junyan21/chrome-extension-vinyl-lens/issues){:target="_blank" rel="noopener noreferrer"}
