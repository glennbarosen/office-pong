import { createFileRoute } from '@tanstack/react-router'
import { EditMessage } from '../../pages/EditMessage'

export const Route = createFileRoute('/_auth/endre/$id')({
    component: EditComponent,
})

function EditComponent() {
    const { id } = Route.useParams()
    return <EditMessage id={id} />
}
