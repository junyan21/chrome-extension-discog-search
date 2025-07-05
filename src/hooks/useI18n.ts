/**
 * Custom hook for internationalization in React components
 * Uses Chrome's i18n API to get localized messages
 */
export function useI18n() {
  /**
   * Get a localized message
   * @param messageName - The key from messages.json
   * @param substitutions - Optional substitutions for placeholders
   * @returns The localized message string
   */
  const getMessage = (messageName: string, substitutions?: string | string[]): string => {
    if (chrome?.i18n) {
      return chrome.i18n.getMessage(messageName, substitutions);
    }
    // Fallback for development or when chrome.i18n is not available
    console.warn(`Missing translation for: ${messageName}`);
    return messageName;
  };

  /**
   * Get the current UI language
   * @returns The UI language code (e.g., 'en', 'ja')
   */
  const getUILanguage = (): string => {
    if (chrome?.i18n) {
      return chrome.i18n.getUILanguage();
    }
    return 'en'; // Default fallback
  };

  /**
   * Check if the current language is Japanese
   * @returns true if the UI language is Japanese
   */
  const isJapanese = (): boolean => {
    const lang = getUILanguage();
    return lang.startsWith('ja');
  };

  return {
    getMessage,
    getUILanguage,
    isJapanese,
  };
}