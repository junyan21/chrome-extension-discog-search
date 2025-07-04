interface SearchButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export const SearchButton = ({ onClick, disabled }: SearchButtonProps) => {
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
      {disabled ? "処理中..." : "音源情報を検索"}
    </button>
  );
};
