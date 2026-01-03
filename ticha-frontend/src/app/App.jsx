import AppRoutes from "./routes";
import { ToastProvider } from "../context/ToastContext";

export default function App() {
  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  );
}
