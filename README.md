# Discog Search Chrome Extension

A Chrome extension that extracts music information from web pages and searches for corresponding Discogs entries using AI-powered content analysis.

## Features

- **Smart Content Extraction**: Analyzes web page content to identify music-related information (artist, album/song titles)
- **AI-Powered Analysis**: Uses Google Gemini AI to filter noise and extract relevant music information
- **Automated Discogs Search**: Automatically searches Google for Discogs pages related to the identified music
- **Vinyl-Only Detection**: Analyzes Discogs pages to determine if releases are available only on vinyl or across multiple formats
- **Visual Format Indicators**: Clear visual cues showing vinyl-only releases vs. multi-format availability
- **Interactive Progress Animation**: Beautiful turntable-style spinning record animation during processing
- **Custom Extension Icon**: Professional record-themed icon design optimized for all sizes
- **Detailed Information Display**: Fetches and displays comprehensive information from Discogs pages including format availability

## How It Works

1. Click the extension icon on any music-related web page
2. Watch the turntable animation as the extension extracts page content using simple DOM parsing
3. Google Gemini AI analyzes the content to identify artist and title information
4. The extension searches Google for relevant Discogs pages
5. AI analyzes the Discogs page to determine available formats (vinyl, CD, digital, etc.)
6. Results are displayed with visual indicators:
   - 🎵 **VINYL ONLY RELEASE** (green) - Available only on vinyl formats
   - 📀 **MULTIPLE FORMATS AVAILABLE** (red) - Available across various formats
7. Detailed music information including format availability is shown

## Installation

### Prerequisites

- Google Chrome browser
- Google Gemini API key

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd discog-search
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load the extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

5. **Configure API Key**
   - Right-click the extension icon and select "Options"
   - Enter your Google Gemini API key
   - Save the settings

## Configuration

### Google Gemini API Key

1. Visit the [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key and paste it in the extension options

## Usage

1. Navigate to any music-related website (artist pages, album reviews, music stores, etc.)
2. Click the Discog Search extension icon (record-themed design)
3. Watch the spinning turntable animation as processing occurs
4. View the results with format availability indicators:
   - **Green "VINYL ONLY RELEASE"** - Only available on vinyl/records
   - **Red "MULTIPLE FORMATS AVAILABLE"** - Available in various formats
5. Check the "Available Formats" list to see all detected formats
6. Review the extracted music information and Discogs page details in JSON format
7. Click the "Go to Discogs Page" link to visit the original Discogs entry

## Technical Stack

- **Frontend**: TypeScript, HTML, CSS with CSS3 animations
- **Build Tool**: Vite
- **AI Service**: Google Gemini API (with enhanced format analysis prompts)
- **Platform**: Chrome Extension Manifest V3
- **Content Extraction**: Custom DOM parsing (no external libraries)
- **Icons**: SVG-to-PNG conversion using macOS qlmanage
- **Animations**: Pure CSS turntable-style record player effects

## Supported Pages

The extension works on most HTTP/HTTPS web pages containing music information. It cannot operate on:

- Chrome internal pages (`chrome://`)
- Extension pages (`chrome-extension://`)
- Local files (`file://`)
- Some restricted domains

## Limitations

- Requires active internet connection
- API usage is subject to Google Gemini rate limits
- Content extraction quality depends on page structure
- Limited to English language content analysis

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview built extension

### Project Structure

```
src/
├── main.ts          # Popup UI logic with vinyl indicators
├── content.ts       # Content script for DOM extraction
├── background.ts    # Background service worker with format analysis
├── offscreen.ts     # Offscreen document for HTML parsing
├── options.ts       # Options page functionality
└── style.css        # Extension styles with turntable animation

public/
├── manifest.json    # Extension manifest with icon configuration
├── index.html       # Popup HTML with record player animation
├── options.html     # Options page HTML
├── icon.svg         # Source SVG icon design
└── icons/           # Generated PNG icons (16, 32, 48, 128px)
    ├── icon-16.png
    ├── icon-32.png
    ├── icon-48.png
    └── icon-128.png
```

## Privacy

- No user data is collected or stored
- Page content is only processed temporarily for music information extraction
- API communications are made directly to Google's servers
- No tracking or analytics

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## Support

If you encounter any issues or have questions, please open an issue in the repository.