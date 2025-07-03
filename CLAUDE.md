# CLAUDE.md - Technical Architecture Documentation

This document provides comprehensive technical details for AI development assistants working on the Discog Search Chrome Extension.

## Architecture Overview

The extension follows a simplified, dependency-light architecture designed for maximum reliability and maintainability. The original complex design with external libraries was replaced with a streamlined approach using native browser APIs and AI-powered content processing.

### Design Philosophy

- **Simplicity First**: Minimize external dependencies to avoid compatibility issues
- **AI-Powered Processing**: Leverage LLM capabilities for content analysis and noise filtering
- **Reliable Communication**: Use direct Chrome extension APIs without complex injection patterns
- **Manifest V3 Compliance**: Follow latest Chrome extension standards
- **Avoid Hardcoding**: モデル名などはハードコーディングしないでください

## Component Architecture

### 1. Popup UI (`src/main.ts`)
**Role**: User interface and orchestration with enhanced vinyl detection display
- Handles user interactions and UI state management
- Orchestrates communication between content scripts and background script
- Implements fallback content script injection for existing tabs
- Provides progress feedback with turntable animation and error handling
- Displays vinyl-only status with visual indicators

**Key Functions**:
- `extractContentDirectly()`: Direct communication with content scripts
- `isRestrictedUrl()`: URL validation for extension compatibility
- Progress tracking and user feedback with spinner animation control
- Visual format indicator rendering (vinyl-only vs multi-format)
- Available formats list display

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
**Role**: AI processing and external API coordination with format analysis
- Handles Google Gemini AI communication with enhanced prompts
- Performs Google search for Discogs URLs
- Manages Discogs page fetching and processing
- Coordinates with offscreen document for HTML parsing
- Analyzes format availability (vinyl, CD, digital, etc.)

**Key Functions**:
- Enhanced LLM prompt engineering for music information and format extraction
- Vinyl-only detection using AI analysis of Discogs content
- Format categorization (vinyl formats vs non-vinyl formats)
- Google search result parsing for Discogs URL discovery
- Progress messaging to popup UI with detailed status updates
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
1. User clicks extension icon (record-themed design)
2. Popup validates current tab URL and shows turntable animation
3. Content script extracts page content (fallback injection if needed)
4. Background receives content and processes with Gemini AI
5. AI extracts artist/title information with noise filtering
6. Background searches Google for Discogs URLs
7. Background fetches Discogs page content
8. Offscreen document parses Discogs HTML
9. Background processes Discogs content with AI for detailed info + format analysis
10. AI determines vinyl-only status and available formats
11. Results displayed in popup UI with visual format indicators:
    - Vinyl-only status (green/red indicators)
    - Available formats list
    - JSON data with isVinylOnly and availableFormats fields
12. Progress animation stops on completion
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

**Enhanced Format Analysis**: Extended LLM prompts to analyze Discogs pages for format availability:
- Vinyl formats: Vinyl, LP, 12", 7", 45 RPM, EP (vinyl), Album (vinyl), Single (vinyl)
- Non-vinyl formats: CD, Digital, Cassette, Tape, MP3, FLAC, Streaming
- Boolean isVinylOnly determination logic
- Available formats array extraction

**Noise Filtering**: LLM instructions specifically address common web page noise (navigation, ads, widgets).

### Vinyl Detection Implementation
**Format Categorization Logic**: AI-powered analysis to distinguish between vinyl and non-vinyl formats with specific keyword recognition.

**Response Structure Enhancement**: Extended JSON response to include:
```json
{
  "artist": "Artist Name",
  "title": "Album Title", 
  "year": 2023,
  "identifiers": "CAT-123",
  "url": "https://www.discogs.com/release/123",
  "isVinylOnly": true,
  "availableFormats": ["Vinyl", "LP", "12\""]
}
```

## Development Commands

- `npm run dev` - Development mode with hot reload
- `npm run build` - Production build with TypeScript compilation and Vite bundling
- `npm install` - Install dependencies (minimal set: only Google Generative AI)
- `npm run test:visual` - Run visual regression tests with Playwright
- `npm run test:visual:update` - Update visual test baseline snapshots
- `npm run test:visual:ui` - Open Playwright UI mode for interactive visual testing

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

### Manual Testing
- Test on various music-related websites (artist pages, reviews, stores)
- Verify behavior on restricted pages (chrome://, extensions, etc.)
- Test with and without existing content scripts
- Validate API key configuration and error states
- Check content extraction quality and length limits

### Visual Regression Testing
**Framework**: Playwright Test framework for automated visual testing

**Test Structure**:
```
tests/
├── popup.visual.spec.ts    # Popup UI visual tests
└── options.visual.spec.ts  # Options page visual tests
```

**Key Features**:
- **Snapshot Testing**: Captures screenshots and compares against baselines
- **Diff Tolerance**: Configured with 0.5% pixel difference tolerance (`maxDiffPixelRatio: 0.005`)
- **Single Worker**: Tests run with `workers: 1` for stability with local dev server
- **Chromium Only**: Tests target Chrome browser specifically

**Test Coverage**:
1. **Popup Tests**:
   - Initial empty state
   - Loading state with turntable animation
   - Vinyl-only result display
   - Multi-format result display
   - Error state handling

2. **Options Tests**:
   - Initial form state
   - API key input states
   - Save confirmation display
   - Button hover effects
   - Input focus states

**Running Tests**:
```bash
# First time setup - create baseline snapshots
npm run test:visual:update

# Run tests against baselines
npm run test:visual

# Interactive UI mode for debugging
npm run test:visual:ui
```

**Best Practices**:
- Wait for elements to be visible before interactions (`waitForSelector`)
- Use stable selectors (IDs for inputs, text content for buttons)
- Disable animations where possible for consistent snapshots
- Store snapshots in version control for team consistency

## UI/UX Enhancements

### Turntable Animation Implementation
**CSS-Only Animation**: Pure CSS3 implementation for smooth performance:
- Record player with spinning vinyl disc
- Realistic gradients and shadows for depth
- Multiple groove circles for authentic appearance
- Rotation animation with 1.8s duration (realistic RPM speed)
- Automatic stopping on process completion

**Visual Components**:
```css
.record-player → Container with relative positioning
.record → Main vinyl disc with radial gradients
.record-grooves → Concentric circles simulating record grooves
.record::before → Center label with extension theme color
.record::after → Center spindle hole
```

### Format Indicator System
**Visual Status Display**: Color-coded indicators for immediate format recognition:
- Green background: "🎵 VINYL ONLY RELEASE" 
- Red background: "📀 MULTIPLE FORMATS AVAILABLE"
- Format list display: Available formats as comma-separated list
- Prominent placement above JSON data

### Extension Icon Design
**SVG-to-PNG Workflow**: macOS native toolchain for icon generation:
1. Master SVG design (`icon.svg`) with record player theme
2. Size-optimized variants for different dimensions
3. `qlmanage` command conversion to PNG: `qlmanage -t -s [SIZE] -o [DIR] [SVG]`
4. Manifest integration with proper path configuration
5. Chrome compatibility with PNG format requirement

**Design Elements**:
- Black vinyl disc with realistic gradients
- Blue center label (extension theme color)
- Concentric grooves for texture
- Optimized for 16x16 pixel visibility
- Full canvas utilization for maximum clarity

## Future Enhancement Opportunities

1. **Advanced Format Detection**: Expand format recognition to include regional variants
2. **Format Preferences**: User settings for preferred format highlighting  
3. **Caching**: Implement result caching to reduce API calls
4. **Language Support**: Extend LLM prompts for multiple languages
5. **Content Optimization**: Improve content extraction algorithms
6. **User Preferences**: Add customization options for search behavior
7. **Batch Processing**: Support multiple music items on single page
8. **Animation Themes**: Alternative progress animations (CD, cassette, etc.)

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