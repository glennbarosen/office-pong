import { Checkbox, FieldGroup } from '@fremtind/jokul'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Controller } from 'react-hook-form'

interface Option<T> {
    label: string
    value: T
}

interface MultiSelectFieldGroupProps<TFormData extends FieldValues, TOption extends string | number> {
    name: FieldPath<TFormData>
    control: Control<TFormData>
    legend: string
    options: Option<TOption>[]
    rules?: object
    selectAllLabel?: string
}

export const MultiSelectFieldGroup = <TFormData extends FieldValues, TOption extends string | number>({
    name,
    control,
    legend,
    options,
    rules,
    selectAllLabel = 'Velg alle',
}: MultiSelectFieldGroupProps<TFormData, TOption>) => {
    const handleSelectAll = (field: { onChange: (value: TOption[]) => void }, checked: boolean) => {
        if (checked) {
            field.onChange(options.map((option) => option.value))
        } else {
            field.onChange([])
        }
    }

    const handleIndividualChange = (
        field: { value: TOption[]; onChange: (value: TOption[]) => void },
        optionValue: TOption,
        checked: boolean
    ) => {
        const currentValues: TOption[] = field.value || []
        if (checked) {
            const newValues = [...currentValues]
            if (!newValues.includes(optionValue)) {
                newValues.push(optionValue)
            }
            field.onChange(newValues)
        } else {
            field.onChange(currentValues.filter((value: TOption) => value !== optionValue))
        }
    }

    const getSelectAllState = (selectedValues: TOption[] | undefined) => {
        if (!selectedValues || selectedValues.length === 0) {
            return { checked: false, indeterminate: false }
        }
        if (selectedValues.length === options.length) {
            return { checked: true, indeterminate: false }
        }
        return { checked: false, indeterminate: true }
    }

    return (
        <Controller
            name={name}
            rules={rules}
            control={control}
            render={({ field, fieldState }) => {
                const selectAllState = getSelectAllState(field.value)

                return (
                    <FieldGroup
                        legend={legend}
                        labelProps={{ variant: 'medium' }}
                        errorLabel={fieldState.error?.message}
                    >
                        <Checkbox
                            className="mb-24"
                            inline
                            invalid={!!fieldState.error}
                            name={`${name}-select-all`}
                            value="ALL"
                            checked={selectAllState.checked}
                            indeterminate={selectAllState.indeterminate}
                            onChange={(e) => handleSelectAll(field, e.target.checked)}
                        >
                            {selectAllLabel}
                        </Checkbox>
                        {options.map((option) => (
                            <Checkbox
                                key={String(option.value)}
                                inline
                                invalid={!!fieldState.error}
                                name={name}
                                value={String(option.value)}
                                checked={Array.isArray(field.value) && field.value.includes(option.value)}
                                onChange={(e) => handleIndividualChange(field, option.value, e.target.checked)}
                            >
                                {option.label}
                            </Checkbox>
                        ))}
                    </FieldGroup>
                )
            }}
        />
    )
}
