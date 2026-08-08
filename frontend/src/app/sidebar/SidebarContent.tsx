import { Box, Text } from "@/design-system";

export function SidebarContent() {

  return (

    <Box
      style={{
        padding: "16px",
      }}
    >

      <Text variant="body">
        Dashboard
      </Text>

      <Text variant="body">
        Inventario
      </Text>

      <Text variant="body">
        VPN
      </Text>

      <Text variant="body">
        Correos
      </Text>

    </Box>

  );

}