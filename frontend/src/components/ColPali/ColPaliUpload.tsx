import { Box, Heading, Input, Progress, Select, Text, VStack, createListCollection } from '@chakra-ui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type ChangeEvent, useEffect, useState } from 'react'

import { type ApiError, ColpaliService, type ColPaliUploadResponse } from '@/client'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { toaster } from '@/components/ui/toaster'

const ColPaliUpload = () => {
  const [file, setFile] = useState<File | null>(null)
  const [collectionName, setCollectionName] = useState<string>('')
  const [datasetName, setDatasetName] = useState<string>('')
  const queryClient = useQueryClient()

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

  const uploadMutation = useMutation({
        mutationFn: (data: { file: File; collection_name: string; dataset_name: string }) =>
      ColpaliService.uploadDataset({ requestBody: data }),
    onSuccess: (data: ColPaliUploadResponse) => {
      toaster.success({
        title: 'Upload successful',
        description: data.message,
      })
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    },
    onError: (err: ApiError) => {
      toaster.error({
        title: 'Upload failed',
        description: (err.body as any)?.detail || 'An unexpected error occurred.',
      })
    },
  })

        const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = () => {
        if (!file) {
      toaster.error({ title: 'File is required' })
      return
    }
    if (!collectionName) {
      toaster.error({ title: 'Collection must be selected' })
      return
    }
    if (!datasetName) {
      toaster.error({ title: 'Dataset name is required' })
      return
    }
    uploadMutation.mutate({ file, collection_name: collectionName, dataset_name: datasetName })
  }

  return (
    <Box>
      <Heading size="lg" mb={4}>Upload Dataset</Heading>
            <VStack gap={4} align="stretch">
        <Field label="Collection">
          <Select.Root
            collection={collection}
            value={collectionName ? [collectionName] : []}
            onValueChange={(details) => {
              if (details.value.length > 0) {
                setCollectionName(details.value[0])
              }
            }}
            disabled={isLoadingCollections || uploadMutation.isPending}
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
        <Field label="Dataset Name">
          <Input
            placeholder="Enter a name for the dataset"
            value={datasetName}
            onChange={(e) => setDatasetName(e.target.value)}
          />
        </Field>
        <Field label="Select File">
          <Input type="file" onChange={handleFileChange} p={1.5} accept=".zip,.tar,.gz,.bz2" />
        </Field>
        <Button
          colorScheme="teal"
          onClick={handleUpload}
          loading={uploadMutation.isPending}
        >
          Upload
        </Button>
        {uploadMutation.isPending && (
          <Box>
            <Text>Uploading...</Text>
            <Progress.Root size="sm" value={null}>
              <Progress.Track>
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>
          </Box>
        )}
      </VStack>
    </Box>
  )
}

export default ColPaliUpload