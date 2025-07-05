import type { DiscogsResult } from "./App";
import { useI18n } from "../../hooks/useI18n";

interface ResultDisplayProps {
  result: DiscogsResult;
}

export const ResultDisplay = ({ result }: ResultDisplayProps) => {
  const { getMessage } = useI18n();

  return (
    <div id="result" style={{ marginTop: "20px" }}>
      {result.isVinylOnly !== undefined && (
        <div
          style={{
            background: result.isVinylOnly ? "#2d5a2d" : "#5a2d2d",
            color: "white",
            padding: "10px",
            margin: "5px 0",
            borderRadius: "5px",
            fontWeight: "bold",
          }}
        >
          {result.isVinylOnly ? getMessage("vinylOnlyRelease") : getMessage("multipleFormats")}
        </div>
      )}

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          // background: "var(--bg-secondary)",
          borderRadius: "5px",
          overflow: "hidden",
          fontSize: "14px",
          color: "var(--text-primary)",
        }}
      >
        <tbody>
          {result.artist && (
            <tr style={{ borderBottom: "1px solid rgba(128, 128, 128, 0.2)" }}>
              <td style={{ padding: "10px", fontWeight: "bold", width: "40%" }}>{getMessage("artist")}</td>
              <td style={{ padding: "10px" }}>{result.artist}</td>
            </tr>
          )}
          {result.title && (
            <tr style={{ borderBottom: "1px solid rgba(128, 128, 128, 0.2)" }}>
              <td style={{ padding: "10px", fontWeight: "bold" }}>{getMessage("title")}</td>
              <td style={{ padding: "10px" }}>{result.title}</td>
            </tr>
          )}
          {result.year && (
            <tr style={{ borderBottom: "1px solid rgba(128, 128, 128, 0.2)" }}>
              <td style={{ padding: "10px", fontWeight: "bold" }}>{getMessage("releaseYear")}</td>
              <td style={{ padding: "10px" }}>{result.year}</td>
            </tr>
          )}
          {result.identifiers && (
            <tr style={{ borderBottom: "1px solid rgba(128, 128, 128, 0.2)" }}>
              <td style={{ padding: "10px", fontWeight: "bold" }}>{getMessage("id")}</td>
              <td style={{ padding: "10px" }}>{result.identifiers}</td>
            </tr>
          )}
          {result.isVinylOnly !== undefined && (
            <tr style={{ borderBottom: "1px solid rgba(128, 128, 128, 0.2)" }}>
              <td style={{ padding: "10px", fontWeight: "bold" }}>{getMessage("vinylOnly")}</td>
              <td style={{ padding: "10px" }}>
                <span
                  style={{
                    color: result.isVinylOnly ? "#4ade80" : "#f87171",
                    fontSize: "16px",
                  }}
                >
                  {result.isVinylOnly ? "✓" : "✗"}
                </span>
              </td>
            </tr>
          )}
          {result.availableFormats && result.availableFormats.length > 0 && (
            <tr>
              <td style={{ padding: "10px", fontWeight: "bold", verticalAlign: "top" }}>
                {getMessage("availableFormats")}
              </td>
              <td style={{ padding: "10px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  {result.availableFormats.map((format, index) => (
                    <span
                      key={index}
                      style={{
                        background: "rgba(139, 92, 246, 0.2)",
                        color: "var(--primary)",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        border: "1px solid rgba(139, 92, 246, 0.3)",
                      }}
                    >
                      {format}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {result.url && (
        <p style={{ marginTop: "10px" }}>
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--primary)",
              textDecoration: "none",
            }}
          >
            {getMessage("goToDiscogs")}
          </a>
        </p>
      )}
    </div>
  );
};
