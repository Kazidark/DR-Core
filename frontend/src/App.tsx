import { AppLayout } from "@/design-system";

import { Sidebar } from "@/app/sidebar";
import { TopBar } from "@/app/topbar";

import { HomePage } from "@/pages/HomePage";

function App() {
  return (
    <AppLayout
      sidebar={<Sidebar />}
      header={<TopBar />}
    >
      <HomePage />
    </AppLayout>
  );
}

export default App;