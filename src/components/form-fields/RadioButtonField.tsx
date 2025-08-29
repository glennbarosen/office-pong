import { Controller } from 'react-hook-form'
import type { Control, FieldValues, Path } from 'react-hook-form'
import { RadioButton, RadioButtonGroup } from '@fremtind/jokul'

interface Option {
    label: string
    value: string
}

interface RadioButtonFieldProps<TFieldValues extends FieldValues> {
    name: Path<TFieldValues>
    control: Control<TFieldValues>
    legend: string
    options: readonly Option[] | Option[]
    rules?: object
    inline?: boolean
    defaultValue?: string
}

export const RadioButtonField = <TFieldValues extends FieldValues>({
    name,
    control,
    legend,
    options,
    rules,
    inline = false,
    defaultValue,
}: RadioButtonFieldProps<TFieldValues>) => {
    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field }) => {
                const selectedValue = field.value || defaultValue
                return (
                    <RadioButtonGroup
                        legend={legend}
                        inline={inline}
                        labelProps={{ variant: 'medium' }}
                        value={selectedValue}
                        onChange={(e) => field.onChange(e.target.value)}
                    >
                        {options.map((option) => (
                            <RadioButton key={option.label} value={option.value}>
                                {option.label}
                            </RadioButton>
                        ))}
                    </RadioButtonGroup>
                )
            }}
        />
    )
}
