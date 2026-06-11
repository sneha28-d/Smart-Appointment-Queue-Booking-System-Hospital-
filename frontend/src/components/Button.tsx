import type { ButtonProps } from "../types/button";

const Button = ({ text, variant = "primary", className = "", children, isLoading, disabled, ...props }: ButtonProps) => {
  const baseStyle = "px-6 py-3 rounded font-semibold transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer inline-flex justify-center items-center gap-2";

  const styles =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700 disabled:hover:bg-blue-600"
      : variant === "white"
      ? "bg-white text-blue-600 hover:bg-gray-100 disabled:hover:bg-white"
      : "border border-gray-400 text-gray-700 hover:bg-gray-100 disabled:hover:bg-transparent";

  return (
    <button disabled={isLoading || disabled} className={`${baseStyle} ${styles} ${className}`} {...props}>
      {isLoading && (
        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {text || children}
    </button>
  );
};

export default Button;