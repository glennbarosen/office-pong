import {
    Table,
    TableCaption,
    TableHead,
    TableRow,
    TableHeader,
    TableBody,
    TableCell,
    TableFooter,
    TablePagination,
    Tag,
    ExpandableTableRow,
    ExpandableTableRowController,
    Loader,
    DescriptionList,
    DescriptionDetail,
    DescriptionTerm,
    Card,
    Button,
} from '@fremtind/jokul'
import { useRef, useState } from 'react'
import { useMessages } from '../hooks/useMessages'
import { MessageStatusTag } from '../components/tags/MessageStatusTag'
import { useDeleteMessage } from '../hooks/useDeleteMessage'
import { formatClients, formatDate, formatDistGroups } from '../utils/formatters'
import { MessageTypeTag } from '../components/tags/MessageTypeTag'
import { sortByCreatedAt } from '../utils/messages'

export function Archive() {
    const tableRef = useRef<HTMLTableElement>(null)
    const [activePage, setActivePage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(25)

    const { data: messages, isPending, isError } = useMessages()
    const { mutate: deleteMessage } = useDeleteMessage()

    const startIndex = activePage * rowsPerPage
    const visibleMessages =
        rowsPerPage === -1
            ? messages?.sort(sortByCreatedAt)
            : messages?.slice(startIndex, startIndex + rowsPerPage).sort(sortByCreatedAt)

    const handleDelete = (id: string | undefined) => {
        if (id) deleteMessage({ path: { id } })
    }

    return (
        <section>
            <h1 className="title-small mb-40">Arkiv</h1>
            <Table ref={tableRef} caption={undefined} fullWidth collapseToList>
                <TableCaption srOnly></TableCaption>
                <TableHead>
                    <TableRow>
                        <TableHeader>Melding</TableHeader>
                        <TableHeader>Klient</TableHeader>
                        <TableHeader>Distributørgrupper</TableHeader>
                        <TableHeader>Vises fra / til</TableHeader>
                        <TableHeader>Status</TableHeader>
                        <TableHeader />
                    </TableRow>
                </TableHead>
                <TableBody>
                    {isPending && (
                        <TableRow>
                            <TableCell colSpan={8}>
                                <div className="flex items-center justify-center">
                                    <Loader textDescription="Henter driftsmeldinger" />
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                    {isError && (
                        <TableRow>
                            <TableCell colSpan={8}>
                                <div className="flex items-center justify-center">
                                    <p className="text-text-subdued">
                                        Det oppstod en feil under lasting av driftsmeldinger
                                    </p>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                    {visibleMessages?.map((message) => {
                        return (
                            <ExpandableTableRow
                                key={message.id}
                                expandedChildren={
                                    <Card padding="xl">
                                        <div className="mb-24 flex justify-start gap-4">
                                            {message.isDismissible && <Tag>Fjernbar</Tag>}
                                            <MessageTypeTag messageType={message.type} />
                                        </div>
                                        <div className="md:w-1/2">
                                            <DescriptionList>
                                                <DescriptionTerm>Opprettet</DescriptionTerm>
                                                <DescriptionDetail>{formatDate(message.createdAt)}</DescriptionDetail>
                                                <DescriptionTerm>Opprettet av</DescriptionTerm>
                                                <DescriptionDetail>{message.createdBy}</DescriptionDetail>
                                                <DescriptionTerm>Klienter</DescriptionTerm>
                                                <DescriptionDetail>{formatClients(message.clients)}</DescriptionDetail>
                                                <DescriptionTerm>Distributører</DescriptionTerm>
                                                <DescriptionDetail>
                                                    {formatDistGroups(message.distGroups)}
                                                </DescriptionDetail>
                                                <DescriptionTerm>Type</DescriptionTerm>
                                                <DescriptionDetail>
                                                    {message.title ? 'Pop-up' : 'Banner'}
                                                </DescriptionDetail>

                                                <DescriptionTerm>Melding</DescriptionTerm>
                                                <DescriptionDetail>{message.message}</DescriptionDetail>
                                            </DescriptionList>
                                        </div>
                                        <Button
                                            density="compact"
                                            variant="tertiary"
                                            type="button"
                                            className="mt-24"
                                            onClick={() => handleDelete(message.id)}
                                        >
                                            Slett
                                        </Button>
                                    </Card>
                                }
                            >
                                <TableCell style={{ verticalAlign: 'middle' }}>
                                    <div className="max-w-[30ch] truncate">{message.message}</div>
                                </TableCell>
                                <TableCell style={{ verticalAlign: 'middle' }}>
                                    <div className="space-x-2">{formatClients(message.clients)}</div>
                                </TableCell>

                                <TableCell style={{ verticalAlign: 'middle' }}>
                                    {formatDistGroups(message.distGroups)}
                                </TableCell>

                                <TableCell style={{ verticalAlign: 'middle' }} width={400}>
                                    <div className="flex gap-4">
                                        <span>{formatDate(message.publishFrom)}</span>
                                        <span className="text-text-subdued">/</span>
                                        <span>{formatDate(message.publishTo)}</span>
                                    </div>
                                </TableCell>

                                <TableCell style={{ verticalAlign: 'middle' }}>
                                    <MessageStatusTag
                                        isActive={message.isActive}
                                        isDisabled={message.isDisabled}
                                        publishFrom={message.publishFrom}
                                    />
                                </TableCell>
                                <ExpandableTableRowController />
                            </ExpandableTableRow>
                        )
                    })}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={6}>
                            <TablePagination
                                activePage={activePage}
                                totalNumberOfRows={messages?.length || 0}
                                rowsPerPage={rowsPerPage}
                                rowsPerPageItems={[10, 25, 50, 100, 150, { label: 'Alle', value: -1 }]}
                                onChangeRowsPerPage={(e) => {
                                    const newRowsPerPage = Number.parseInt(e.target.value)
                                    setRowsPerPage(newRowsPerPage)
                                    setActivePage(0)
                                    if (tableRef.current) {
                                        tableRef.current.scrollIntoView({
                                            behavior: 'smooth',
                                        })
                                    }
                                }}
                                onChange={(_, toPage) => {
                                    setActivePage(toPage)
                                    if (tableRef.current) {
                                        tableRef.current.scrollIntoView({
                                            behavior: 'smooth',
                                        })
                                    }
                                }}
                            />
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </section>
    )
}
