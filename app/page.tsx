import AppShell from "./shell/AppShell";
import DashboardScreen from "./screens/DashboardScreen";

export default function Home() {
  return (
    <AppShell>
      <DashboardScreen />
    </AppShell>
  );
}
