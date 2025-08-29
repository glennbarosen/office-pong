import type { RegisterOptions } from 'react-hook-form'
import type { SystemMessageDto } from '../../types'

export interface MessageFormProps {
    existingMessage?: MessageFormData
}

export interface MessageFormData extends SystemMessageDto {
    variant?: 'BANNER' | 'POPUP'
}

export const MESSAGE_VARIANT_OPTIONS = [
    { label: 'Banner', value: 'BANNER' as const },
    { label: 'Pop-up vindu', value: 'POPUP' as const },
] as const

export const MESSAGE_TYPE_OPTIONS = [
    { label: 'INFO', value: 'INFO' as const },
    { label: 'WARNING', value: 'WARNING' as const },
    { label: 'ERROR', value: 'ERROR' as const },
] as const

export const MESSAGE_LIMITS = {
    BANNER: 80,
    POPUP: 500,
}

type FormFieldNames = keyof MessageFormData & string

export const FORM_VALIDATION_RULES = {
    message: { required: 'Systemmeldingen må inneholde tekst' },
    title: { required: 'Overskrift er påkrevd när meldingen er en pop-up' },
    distGroups: { required: 'Velg minst én distribusjonsgruppe' },
    clients: { required: 'Velg minst én klient' },
} satisfies Partial<Record<FormFieldNames, RegisterOptions>>
