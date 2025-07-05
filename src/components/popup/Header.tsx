import { SettingsButton } from "../common/SettingsButton";
import { useI18n } from "../../hooks/useI18n";

interface HeaderProps {
  onSettingsClick: () => void;
}

export const Header = ({ onSettingsClick }: HeaderProps) => {
  const { getMessage } = useI18n();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <img
          src="/icons/icon-128.png"
          alt={getMessage("extensionName")}
          style={{ width: "32px", height: "32px" }}
        />
        <h1 style={{ margin: 0, fontSize: "18px", color: "var(--text-primary)" }}>{getMessage("extensionName")}</h1>
      </div>
      <SettingsButton onClick={onSettingsClick} />
    </div>
  );
};
