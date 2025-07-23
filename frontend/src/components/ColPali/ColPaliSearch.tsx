import { Alert, Box, Code, Heading, Input, Select, Spinner, Text, VStack, createListCollection } from '@chakra-ui/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { type ApiError, type ColPaliSearchResponse, ColpaliService } from '@/client'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { toaster } from '@/components/ui/toaster'

const ColPaliSearch = () => {
  const [query, setQuery] = useState('')
  const [limit, setLimit] = useState(10)
  const [collectionName, setCollectionName] = useState<string>('')
    

  const { data: collections, isLoading: isLoadingCollections } = useQuery<string[]>({
    queryKey: ['collections'],
    queryFn: () => ColpaliService.listCollections(),
  })

  useEffect(() => {
    if (collections && collections.length > 0 && !collectionName) {
      setCollectionName(collections[0])
    }
  }, [collections, collectionName])

  const selectItems = collections?.map(c => ({ label: c, value: c })) || []
  const collection = createListCollection({ items: selectItems })

  const searchMutation = useMutation({
    mutationFn: (params: { query: string; limit: number; collection_name: string }) =>
      ColpaliService.searchDocuments({ requestBody: params }),
    onSuccess: (data: ColPaliSearchResponse) => {
      toaster.success({
        title: 'Search successful',
        description: `Found ${data.results.length} results.`,
      })
    },
    onError: (err: ApiError) => {
      toaster.error({
        title: 'Search failed',
        description: (err.body as any)?.detail || 'An unexpected error occurred.',
      })
    },
  })

  const handleSearch = () => {
    if (!query) {
      toaster.error({ title: 'Query is required' })
      return
    }
    if (!collectionName) {
      toaster.error({ title: 'Collection must be selected' })
      return
    }
    searchMutation.mutate({ query, limit, collection_name: collectionName })
  }

  return (
    <Box>
      <Heading size="lg" mb={4}>Search</Heading>
            <VStack gap={4} align="stretch">
        <Field label="Query">
          <Input
            placeholder="Enter your search query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Field>
        <Field label="Collection">
          <Select.Root
            collection={collection}
            value={collectionName ? [collectionName] : []}
            onValueChange={(details) => {
              if (details.value.length > 0) {
                setCollectionName(details.value[0])
              }
            }}
            disabled={isLoadingCollections}
            width="100%"
          >
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Select a collection" />
              </Select.Trigger>
            </Select.Control>
            <Select.Positioner>
              <Select.Content>
                {selectItems.map((item) => (
                  <Select.Item key={item.value} item={item}>
                    <Select.ItemText>{item.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Select.Root>
        </Field>
        <Field label="Limit">
          <Input
            type="number"
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value, 10))}
          />
        </Field>
        <Button colorScheme="teal" onClick={handleSearch} loading={searchMutation.isPending}>
          Search
        </Button>
      </VStack>

      {searchMutation.isPending && <Spinner />}
      {searchMutation.isError && (
                <Alert.Root status="error" mt={4}>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{searchMutation.error.message}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
      {searchMutation.data && (
        <Box mt={6}>
          <Heading size="md" mb={4}>Results</Heading>
          <VStack gap={4} align="stretch">
            {searchMutation.data.results.map((result, index) => (
              <Box key={index} p={4} borderWidth="1px" borderRadius="md">
                <Text fontWeight="bold">Score: {result.score.toFixed(4)}</Text>
                <Code mt={2} p={2} display="block" whiteSpace="pre-wrap">
                  {JSON.stringify(result.payload, null, 2)}
                </Code>
              </Box>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  )
}

export default ColPaliSearch