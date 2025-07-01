# CLAUDE.md - Technical Architecture Documentation

This document provides comprehensive technical details for AI development assistants working on the Discog Search Chrome Extension.

## Architecture Overview

The extension follows a simplified, dependency-light architecture designed for maximum reliability and maintainability. The original complex design with external libraries was replaced with a streamlined approach using native browser APIs and AI-powered content processing.

### Design Philosophy

- **Simplicity First**: Minimize external dependencies to avoid compatibility issues
- **AI-Powered Processing**: Leverage LLM capabilities for content analysis and noise filtering
- **Reliable Communication**: Use direct Chrome extension APIs without complex injection patterns
- **Manifest V3 Compliance**: Follow latest Chrome extension standards

## Component Architecture

### 1. Popup UI (`src/main.ts`)
**Role**: User interface and orchestration
- Handles user interactions and UI state management
- Orchestrates communication between content scripts and background script
- Implements fallback content script injection for existing tabs
- Provides progress feedback and error handling

**Key Functions**:
- `extractContentDirectly()`: Direct communication with content scripts
- `isRestrictedUrl()`: URL validation for extension compatibility
- Progress tracking and user feedback

### 2. Content Script (`src/content.ts`)
**Role**: DOM content extraction
- Performs simple, reliable DOM content extraction
- Removes unwanted elements (scripts, styles, ads)
- Limits content length to optimize API token usage
- No external dependencies for maximum compatibility

**Key Functions**:
- `removeScriptsAndStyles()`: Clean HTML content extraction
- `limitContent()`: Smart content truncation preserving sentence boundaries
- Direct text extraction using `textContent` and `innerText`

### 3. Background Script (`src/background.ts`)
**Role**: AI processing and external API coordination
- Handles Google Gemini AI communication
- Performs Google search for Discogs URLs
- Manages Discogs page fetching and processing
- Coordinates with offscreen document for HTML parsing

**Key Functions**:
- LLM prompt engineering for music information extraction
- Google search result parsing for Discogs URL discovery
- Progress messaging to popup UI
- Error handling and fallback mechanisms

### 4. Offscreen Document (`src/offscreen.ts`)
**Role**: Secure HTML parsing
- Processes external HTML content in isolated environment
- Provides clean text extraction from Discogs pages
- Simplified implementation without external parsing libraries

### 5. Options Page (`src/options.ts`)
**Role**: Configuration management
- API key storage and validation
- User preference management
- Simple, functional interface

## Data Flow

```
1. User clicks extension icon
2. Popup validates current tab URL
3. Content script extracts page content (fallback injection if needed)
4. Background receives content and processes with Gemini AI
5. AI extracts artist/title information with noise filtering
6. Background searches Google for Discogs URLs
7. Background fetches Discogs page content
8. Offscreen document parses Discogs HTML
9. Background processes Discogs content with AI for detailed info
10. Results displayed in popup UI
```

## Key Technical Decisions

### Readability Library Removal
**Problem**: The `@mozilla/readability` library caused ES Modules compatibility issues with dynamic content script injection.

**Solution**: Implemented custom DOM extraction using native browser APIs:
- Simple `textContent`/`innerText` extraction
- Manual script/style tag removal
- Content length limiting for API efficiency

### Manifest Configuration
**Key Settings**:
```json
{
  "content_scripts": [{
    "matches": ["http://*/*", "https://*/*"],
    "js": ["assets/content.js"],
    "run_at": "document_idle",
    "all_frames": false
  }]
}
```

**Note**: `"type": "module"` was removed to ensure compatibility with dynamic injection.

### LLM Prompt Engineering
**Integrated Content Processing**: Combined content extraction and music information identification in a single LLM call for efficiency.

**Noise Filtering**: LLM instructions specifically address common web page noise (navigation, ads, widgets).

## Development Commands

- `npm run dev` - Development mode with hot reload
- `npm run build` - Production build with TypeScript compilation and Vite bundling
- `npm install` - Install dependencies (minimal set: only Google Generative AI)

## Common Issues and Solutions

### Content Script Communication Errors
**Symptom**: "Receiving end does not exist" errors
**Cause**: Content script not available on existing tabs
**Solution**: Automatic fallback injection with proper error messaging

### ES Modules Compatibility
**Symptom**: Import errors in dynamically injected scripts
**Cause**: `type: "module"` in manifest.json
**Solution**: Remove module type, use IIFE bundle format

### API Token Limits
**Symptom**: Large content causing API errors
**Cause**: Excessive content length
**Solution**: Smart content truncation with sentence boundary preservation

## Error Handling Strategy

1. **URL Validation**: Check for restricted pages before attempting content extraction
2. **Progressive Fallbacks**: Static content script → Dynamic injection → Clear error message
3. **API Error Recovery**: Graceful handling of API failures with user-friendly messages
4. **Content Validation**: Ensure minimum content quality before processing

## Testing Considerations

- Test on various music-related websites (artist pages, reviews, stores)
- Verify behavior on restricted pages (chrome://, extensions, etc.)
- Test with and without existing content scripts
- Validate API key configuration and error states
- Check content extraction quality and length limits

## Future Enhancement Opportunities

1. **Caching**: Implement result caching to reduce API calls
2. **Language Support**: Extend LLM prompts for multiple languages
3. **Content Optimization**: Improve content extraction algorithms
4. **User Preferences**: Add customization options for search behavior
5. **Batch Processing**: Support multiple music items on single page

## Security Considerations

- All external API calls use HTTPS
- No user data persistence beyond API key storage
- Offscreen document provides isolated HTML processing
- Content Security Policy compliance for all components

## Performance Optimizations

- Content length limiting reduces API token usage
- Direct content script communication minimizes latency
- Simple DOM extraction avoids complex parsing overhead
- Minimal dependency tree reduces bundle size and load time