import { useState, useEffect } from "preact/hooks";
import { useChromeMessaging } from "../../hooks/useChromeMessaging";
import { useI18n } from "../../hooks/useI18n";
import { Header } from "./Header";
import { SearchButton } from "./SearchButton";
import { Progress } from "./Progress";
import { ResultDisplay } from "./ResultDisplay";
import { isRestrictedUrl } from "../../utils/urlUtils";

export interface DiscogsResult {
  artist?: string;
  title?: string;
  year?: number;
  identifiers?: string;
  url?: string;
  isVinylOnly?: boolean;
  availableFormats?: string[];
}

export const App = () => {
  const [result, setResult] = useState<DiscogsResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { getMessage } = useI18n();

  const { sendMessage, sendTabMessage, setupProgressListener, progress, setProgress } =
    useChromeMessaging();

  useEffect(() => {
    // Setup progress listener
    const cleanup = setupProgressListener();
    return cleanup;
  }, [setupProgressListener]);

  const handleExtractAndProcess = async () => {
    const startTime = performance.now();

    // Reset UI
    setResult(null);
    setError(null);
    setIsProcessing(true);
    setProgress(getMessage("initializing"));

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        throw new Error(getMessage("noActiveTab"));
      }

      // Check if URL is restricted
      if (isRestrictedUrl(tab.url || "")) {
        throw new Error(getMessage("restrictedPage"));
      }

      // Extract content from the page
      setProgress(getMessage("extractingContent"));
      const contentResponse = await sendTabMessage(tab.id, { action: "extractContent" });

      if (!contentResponse || !contentResponse.success || !contentResponse.content) {
        throw new Error(contentResponse?.message || getMessage("emptyContent"));
      }

      // Process with AI
      setProgress(getMessage("searching"));
      const llmResponse = await sendMessage({
        action: "processContent",
        content: contentResponse.content,
        url: contentResponse.url,
      });

      if (llmResponse && llmResponse.success && llmResponse.result) {
        // Parse the result
        let jsonString = llmResponse.result.trim();
        if (jsonString.startsWith("```json")) {
          jsonString = jsonString.substring("```json".length, jsonString.lastIndexOf("```")).trim();
        }

        const parsedJson = JSON.parse(jsonString);
        setResult(parsedJson);

        const endTime = performance.now();
        const time = ((endTime - startTime) / 1000).toFixed(2);
        setProgress(getMessage("processingComplete", time));
      } else {
        throw new Error(llmResponse?.message || "Unknown error processing with LLM");
      }
    } catch (err) {
      console.error("[App] Error:", err);
      setError(err instanceof Error ? err.message : getMessage("unexpectedError"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenSettings = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <div id="app" style={{ width: "400px", padding: "20px" }}>
      <Header onSettingsClick={handleOpenSettings} />
      <SearchButton onClick={handleExtractAndProcess} disabled={isProcessing} />

      {isProcessing && <Progress message={progress} />}

      {error && <div style={{ color: "var(--error)", marginTop: "10px" }}>{getMessage("errorPrefix")}{error}</div>}

      {result && !isProcessing && <ResultDisplay result={result} />}
    </div>
  );
};
