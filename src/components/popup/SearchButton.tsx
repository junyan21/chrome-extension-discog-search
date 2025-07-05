import { useI18n } from "../../hooks/useI18n";

interface SearchButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export const SearchButton = ({ onClick, disabled }: SearchButtonProps) => {
  const { getMessage } = useI18n();
  return (
    <button
      id="extractAndProcess"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "12px 20px",
        backgroundColor: disabled ? "#ccc" : "var(--primary)",
        color: "white",
        border: "none",
        borderRadius: "5px",
        fontSize: "16px",
        fontWeight: "bold",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background-color 0.3s ease",
        marginBottom: "15px",
      }}
    >
      {disabled ? getMessage("processing") : getMessage("searchButton")}
    </button>
  );
};
