import { Box } from "@/design-system";

import { SidebarHeader } from "./SidebarHeader";
import { SidebarContent } from "./SidebarContent";
import { SidebarFooter } from "./SidebarFooter";

export function Sidebar() {

  return (

    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >

      <SidebarHeader />

      <Box
        style={{
          flex: 1,
        }}
      >
        <SidebarContent />
      </Box>

      <SidebarFooter />

    </Box>

  );

}