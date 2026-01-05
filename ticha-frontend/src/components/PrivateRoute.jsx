import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute() {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PrivateRoute.jsx:4',message:'PrivateRoute check',data:{hasToken:!!localStorage.getItem("ticha_token")},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  const token = localStorage.getItem("ticha_token");
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PrivateRoute.jsx:6',message:'PrivateRoute decision',data:{hasToken:!!token,willNavigate:!token},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  return token ? <Outlet /> : <Navigate to="/auth" replace />;
}
