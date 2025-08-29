import { Controller } from 'react-hook-form'
import type { Control, FieldValues, Path } from 'react-hook-form'
import { Checkbox } from '@fremtind/jokul'

interface CheckboxFieldProps<TFieldValues extends FieldValues> {
    name: Path<TFieldValues>
    control: Control<TFieldValues>
    label: string
    rules?: object
    className?: string
}

export const CheckboxField = <TFieldValues extends FieldValues>({
    name,
    control,
    label,
    rules,
    className,
}: CheckboxFieldProps<TFieldValues>) => {
    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: { value, onChange } }) => (
                <Checkbox
                    className={className}
                    name={name}
                    value={name}
                    checked={value || false}
                    onChange={(e) => onChange(e.target.checked)}
                >
                    {label}
                </Checkbox>
            )}
        />
    )
}
