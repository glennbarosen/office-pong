import { Controller } from 'react-hook-form'
import type { Control, FieldValues, Path } from 'react-hook-form'
import { DateTimePicker } from '../DateTimePicker'

interface DateTimeFieldProps<TFieldValues extends FieldValues> {
    name: Path<TFieldValues>
    control: Control<TFieldValues>
    label: string
    rules?: object
}

export const DateTimeField = <TFieldValues extends FieldValues>({
    name,
    control,
    label,
    rules,
}: DateTimeFieldProps<TFieldValues>) => {
    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field }) => (
                <DateTimePicker
                    label={label}
                    datePickerProps={{
                        label: 'Dato',
                        disableBeforeDate: new Date().toISOString(),
                    }}
                    timePickerProps={{
                        label: 'Klokkeslett',
                        placeholder: 'hh:mm',
                    }}
                    value={field.value}
                    onChange={(newDateString) => field.onChange(newDateString)}
                />
            )}
        />
    )
}
