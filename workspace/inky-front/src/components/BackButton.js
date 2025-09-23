import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function BackButton({ className = "" }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className={`btn btn-outline-secondary ${className}`}
      aria-label="Revenir en arrière"
    >
      <FaArrowLeft />
    </button>
  );
}
