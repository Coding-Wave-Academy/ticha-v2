import AppRoutes from "./routes";
import { ToastProvider } from "../context/ToastContext";
import OfflineStatus from "../components/OfflineStatus";

export default function App() {
  return (
    <ToastProvider>
      <OfflineStatus />
      <AppRoutes />
    </ToastProvider>
  );
}
