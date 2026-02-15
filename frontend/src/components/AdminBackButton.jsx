import { useLocation, useNavigate } from "react-router-dom";

export default function AdminBackButton() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname || "";

  let target = null;
  let label = "";

  if (path === "/admin") {
    target = "/";
    label = "العودة للرئيسية";
  } else if (path.startsWith("/admin")) {
    target = "/admin";
    label = "العودة للوحة التحكم";
  }

  if (!target) return null;

  return (
    <button className="ghost-btn" type="button" onClick={() => navigate(target)}>
      {label}
    </button>
  );
}
