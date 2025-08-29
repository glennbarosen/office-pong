import { Controller } from 'react-hook-form'
import type { Control, FieldValues, Path } from 'react-hook-form'
import { TextInput, type TextInputProps } from '@fremtind/jokul'

interface TextInputFieldProps<TFieldValues extends FieldValues> {
    name: Path<TFieldValues>
    control: Control<TFieldValues>
    label: string
    rules?: object
    tooltip?: React.ReactNode
    placeholder?: string
    width?: string
    className?: string
    textInputProps?: Omit<TextInputProps, 'label' | 'errorLabel'>
}

export const TextInputField = <TFieldValues extends FieldValues>({
    name,
    control,
    label,
    rules,
    tooltip,
    placeholder,
    width = '100%',
    className,
    textInputProps,
}: TextInputFieldProps<TFieldValues>) => {
    return (
        <div className={className}>
            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({ field, fieldState }) => (
                    <TextInput
                        {...textInputProps}
                        {...field}
                        label={label}
                        width={width}
                        placeholder={placeholder}
                        tooltip={tooltip}
                        labelProps={{ variant: 'medium' }}
                        errorLabel={fieldState.error?.message}
                    />
                )}
            />
        </div>
    )
}
