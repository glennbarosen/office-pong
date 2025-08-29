import { Button, FieldGroup, NavLink, PopupTip } from '@fremtind/jokul'
import { isBefore } from 'date-fns'
import { useMessageForm } from '../../hooks/useMessageForm'
import { useFormNavigation } from '../../hooks/useFormNavigation'
import {
    MultiSelectFieldGroup,
    DateTimeField,
    RadioButtonField,
    CheckboxField,
    MessageTypeField,
    TextInputField,
    TextAreaField,
    ConditionalField,
    FormError,
} from '../'
import { CLIENTS, DIST_GROUPS } from '../../utils/constants'
import { type MessageFormProps, MESSAGE_VARIANT_OPTIONS, FORM_VALIDATION_RULES, MESSAGE_LIMITS } from './types'

/**
 * Shared form component for creating and editing system messages
 */
export const MessageForm = ({ existingMessage }: MessageFormProps) => {
    const { handleGoBack, navigateToHome } = useFormNavigation()
    const { form, onSubmit, isSubmitting, submitError, isEditing } = useMessageForm({
        existingMessage,
        onSuccess: navigateToHome,
    })

    const { control, handleSubmit, watch } = form
    const selectedVariant = watch('variant')
    const publishFrom = watch('publishFrom')
    const pageTitle = isEditing ? 'Endre melding' : 'Ny melding'

    // Determine button text based on publish date
    const getButtonText = () => {
        if (!publishFrom) return 'Klar for publisering'

        const publishDate = new Date(publishFrom)
        const now = new Date()

        // If publish date is in the past, it should be published immediately
        if (isBefore(publishDate, now)) {
            return 'Publiser'
        }

        return 'Klar for publisering'
    }

    return (
        <div className="space-y-24">
            <NavLink as="button" type="button" back onClick={handleGoBack}>
                Tilbake
            </NavLink>
            <div>
                <h1>{pageTitle}</h1>

                {/* Show loading state */}
                {isSubmitting && (
                    <div className="bg-blue-50 border-blue-200 mb-16 rounded border p-12">
                        <p className="text-blue-800">Lagrer melding...</p>
                    </div>
                )}

                {/* Show global form error if any */}
                <FormError error={submitError} className="mb-16" />

                <form className="space-y-16" onSubmit={handleSubmit(onSubmit)}>
                    <RadioButtonField
                        name="variant"
                        control={control}
                        legend="Hvordan skal meldingen vises?"
                        options={MESSAGE_VARIANT_OPTIONS}
                        inline
                        defaultValue="BANNER"
                    />

                    <MultiSelectFieldGroup
                        name="distGroups"
                        control={control}
                        legend="Hvem skal se meldingen?"
                        options={DIST_GROUPS}
                        rules={FORM_VALIDATION_RULES.distGroups}
                    />

                    <FieldGroup
                        legend="Når skal meldingen vises?"
                        labelProps={{ variant: 'medium' }}
                        className="space-y-16"
                    >
                        <DateTimeField name="publishFrom" control={control} label="Fra:" />
                        <DateTimeField name="publishTo" control={control} label="Til:" />
                    </FieldGroup>

                    <ConditionalField condition={selectedVariant === 'POPUP'} className="md:w-1/2">
                        <TextInputField
                            name="title"
                            control={control}
                            label="Overskrift"
                            rules={FORM_VALIDATION_RULES.title}
                            width="100%"
                            tooltip={
                                <span className="small">
                                    <PopupTip placement="top" content="Overskrift vises kun i pop-up vindu" />
                                </span>
                            }
                        />
                    </ConditionalField>

                    <TextAreaField
                        name="message"
                        control={control}
                        label="Melding"
                        rules={FORM_VALIDATION_RULES.message}
                        className="md:w-1/2"
                        maxLength={MESSAGE_LIMITS[selectedVariant || 'BANNER']}
                        tooltip={
                            <span className="small">
                                <PopupTip
                                    placement="top"
                                    content={<p>Hvis meldingen er en banner bør lengden begrenses til å passe på en</p>}
                                />
                            </span>
                        }
                    />

                    <MultiSelectFieldGroup
                        name="clients"
                        control={control}
                        legend="Hvilke klienter gjelder meldingen for?"
                        options={CLIENTS}
                        rules={FORM_VALIDATION_RULES.clients}
                    />

                    <div className="w-full md:w-1/2">
                        <MessageTypeField name="type" control={control} legend="Meldingstype" />
                    </div>

                    <div className="w-full md:w-1/2">
                        <FieldGroup legend="Innstillinger" labelProps={{ variant: 'medium' }}>
                            <CheckboxField name="isDismissible" control={control} label="Kan lukkes av brukeren" />
                            <CheckboxField name="isDisabled" control={control} label="Deaktivert melding" />
                        </FieldGroup>
                    </div>

                    <div className="space-x-12">
                        <Button
                            variant="primary"
                            loader={{ showLoader: isSubmitting, textDescription: 'Lagrer' }}
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {getButtonText()}
                        </Button>
                        <Button variant="secondary" onClick={handleGoBack}>
                            Avbryt
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
