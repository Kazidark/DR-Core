import { Box, Flex, Text } from "@/design-system";

export function TopBar() {
  return (
    <Box
      style={{
        width: "100%",
      }}
    >
      <Flex
        justify="between"
        align="center"
      >
        <Text
          as="h2"
          variant="title"
        >
          Dashboard
        </Text>

        <Text variant="bodySmall">
          DR+ Core v1.0
        </Text>
      </Flex>
    </Box>
  );
}