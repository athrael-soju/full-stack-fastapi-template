import { Box, Container, Heading, Tabs } from '@chakra-ui/react'
import { createFileRoute } from '@tanstack/react-router'

import ColPaliCollections from '@/components/ColPali/ColPaliCollections'
import ColPaliSearch from '@/components/ColPali/ColPaliSearch'
import ColPaliUpload from '@/components/ColPali/ColPaliUpload'

const tabsConfig = [
  { value: 'search', title: 'Search', component: ColPaliSearch },
  { value: 'upload', title: 'Upload', component: ColPaliUpload },
  { value: 'collections', title: 'Collections', component: ColPaliCollections },
]

export const Route = createFileRoute('/_layout/colpali/')({
  component: ColPali,
})

function ColPali() {
  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: 'center', md: 'left' }} py={12}>
        ColPali Multimodal Search
      </Heading>
      <Tabs.Root defaultValue="search" variant="subtle">
        <Tabs.List>
          {tabsConfig.map((tab) => (
            <Tabs.Trigger key={tab.value} value={tab.value}>
              {tab.title}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <Box mt={4}>
          {tabsConfig.map((tab) => (
            <Tabs.Content key={tab.value} value={tab.value}>
              <tab.component />
            </Tabs.Content>
          ))}
        </Box>
      </Tabs.Root>
    </Container>
  )
}
