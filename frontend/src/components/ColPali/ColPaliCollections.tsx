import { Badge, Box, Flex, Heading, IconButton, Input, Table, Text } from '@chakra-ui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { FiPlus, FiTrash2 } from 'react-icons/fi'

import { type ApiError, ColpaliService } from '@/client'
import { Button } from '@/components/ui/button'
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field } from '@/components/ui/field'
import { toaster } from '@/components/ui/toaster'
import useAuth from '@/hooks/useAuth'

const ColPaliCollections = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [newCollectionName, setNewCollectionName] = useState('')
  const [open, setOpen] = useState(false)

  const { data: collections, isLoading: isLoadingCollections } = useQuery<
    string[]
  >({
    queryKey: ['collections'],
    queryFn: () => ColpaliService.listCollections(),
  })

  const { data: health, isLoading: isLoadingHealth } = useQuery<{
    status: string
  }>({
    queryKey: ['health'],
    queryFn: () => ColpaliService.healthCheck() as Promise<{ status: string }>,
    refetchInterval: 5000, // Refetch every 5 seconds
  })

  const createCollectionMutation = useMutation({
    mutationFn: (collectionName: string) =>
      ColpaliService.createCollection({ collectionName }),
    onSuccess: (_, collectionName) => {
      toaster.success({
        title: 'Collection created',
        description: `Collection "${collectionName}" has been created successfully.`,
      })
      queryClient.invalidateQueries({ queryKey: ['collections'] })
      setOpen(false)
      setNewCollectionName('')
    },
    onError: (err: ApiError, collectionName) => {
      toaster.error({
        title: `Error creating collection "${collectionName}"`,
        description: (err.body as any)?.detail || 'An unexpected error occurred.',
      })
    },
  })

  const deleteCollectionMutation = useMutation({
    mutationFn: (collectionName: string) =>
      ColpaliService.deleteCollection({ collectionName }),
    onSuccess: (_, collectionName) => {
      toaster.success({
        title: 'Collection deleted',
        description: `Collection "${collectionName}" has been deleted successfully.`,
      })
      queryClient.invalidateQueries({ queryKey: ['collections'] })
    },
    onError: (err: ApiError, collectionName) => {
      toaster.error({
        title: `Error deleting collection "${collectionName}"`,
        description: (err.body as any)?.detail || 'An unexpected error occurred.',
      })
    },
  })

  const handleCreateCollection = () => {
    if (newCollectionName) {
      createCollectionMutation.mutate(newCollectionName)
    }
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="lg">Collections</Heading>
        <DialogRoot open={open} onOpenChange={(details) => setOpen(details.open)}>
          <DialogTrigger asChild>
            <Button>
              <Flex as="span" align="center" gap={2}>
                <FiPlus />
                New Collection
              </Flex>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>Create New Collection</DialogHeader>
            <DialogCloseTrigger />
            <DialogBody>
              <Field label="Collection Name">
                <Input
                  placeholder="Enter collection name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                />
              </Field>
            </DialogBody>
            <DialogFooter>
              <Button
                variant="solid"
                colorScheme="teal"
                onClick={handleCreateCollection}
                loading={createCollectionMutation.isPending}
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogRoot>
      </Flex>

      <Box mb={4}>
        <Text fontSize="lg" fontWeight="bold">
          Service Status
        </Text>
        {isLoadingHealth ? (
          <Text>Loading status...</Text>
        ) : (
          <Badge colorScheme={health?.status === 'ok' ? 'green' : 'red'}>
            {health?.status || 'Unknown'}
          </Badge>
        )}
      </Box>

      <Table.Root size={{ base: 'sm', md: 'md' }}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Name</Table.ColumnHeader>
            <Table.ColumnHeader>Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {isLoadingCollections ? (
            <Table.Row>
              <Table.Cell colSpan={2}>Loading collections...</Table.Cell>
            </Table.Row>
          ) : (
            collections?.map((collectionName) => (
              <Table.Row key={collectionName}>
                <Table.Cell>{collectionName}</Table.Cell>
                <Table.Cell>
                  {/* @ts-ignore */}
                  <IconButton
                    aria-label="Delete collection"
                    variant="ghost"
                    icon={<FiTrash2 />}
                    onClick={() => deleteCollectionMutation.mutate(collectionName)}
                    disabled={!user?.is_superuser || deleteCollectionMutation.isPending}
                  />
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Root>
    </Box>
  )
}

export default ColPaliCollections
