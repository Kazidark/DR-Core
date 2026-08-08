import { Box, Flex, Text } from "@/design-system";

export function SidebarHeader() {
  return (
    <Box
      style={{
        padding: "24px",
        borderBottom: "1px solid #E5E7EB",
      }}
    >
      <Flex
        direction="column"
        gap={4}
      >
        <Text
          as="h1"
          variant="title"
        >
          DR+ Core
        </Text>

        <Text
          variant="caption"
        >
          Plataforma Integral TI
        </Text>
      </Flex>
    </Box>
  );
}