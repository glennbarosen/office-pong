import { Controller } from 'react-hook-form'
import type { Control, FieldValues, Path } from 'react-hook-form'
import { RadioButton, RadioButtonGroup } from '@fremtind/jokul'
import { MessageTypeTag } from '../tags/MessageTypeTag'

interface MessageTypeFieldProps<TFieldValues extends FieldValues> {
    name: Path<TFieldValues>
    control: Control<TFieldValues>
    legend: string
    rules?: object
}

const MESSAGE_TYPE_OPTIONS = [
    { value: 'INFO' as const, label: 'Informasjon om endringer i løsningen' },
    { value: 'WARNING' as const, label: 'Brukeren kan oppleve ustabilitet i løsningen' },
    { value: 'ERROR' as const, label: 'Større problemer som betydelig påvirker løsningen' },
]

export const MessageTypeField = <TFieldValues extends FieldValues>({
    name,
    control,
    legend,
    rules,
}: MessageTypeFieldProps<TFieldValues>) => {
    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: { value, onChange } }) => (
                <RadioButtonGroup
                    legend={legend}
                    labelProps={{ variant: 'medium' }}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                >
                    {MESSAGE_TYPE_OPTIONS.map((option) => (
                        <RadioButton key={option.value} value={option.value}>
                            <MessageTypeTag messageType={option.value} /> - {option.label}
                        </RadioButton>
                    ))}
                </RadioButtonGroup>
            )}
        />
    )
}
