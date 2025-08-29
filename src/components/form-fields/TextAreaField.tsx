import { Controller } from 'react-hook-form'
import type { Control, FieldValues, Path } from 'react-hook-form'
import { TextArea, type TextAreaProps } from '@fremtind/jokul'

interface TextAreaFieldProps<TFieldValues extends FieldValues> {
    name: Path<TFieldValues>
    control: Control<TFieldValues>
    label: string
    rules?: object
    tooltip?: React.ReactNode
    placeholder?: string
    className?: string
    maxLength?: number
    textAreaProps?: Omit<TextAreaProps, 'label' | 'errorLabel' | 'counter'>
}

export const TextAreaField = <TFieldValues extends FieldValues>({
    name,
    control,
    label,
    rules,
    tooltip,
    placeholder,
    className,
    maxLength,
    textAreaProps,
}: TextAreaFieldProps<TFieldValues>) => {
    return (
        <div className={className}>
            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({ field, fieldState }) => (
                    <TextArea
                        {...textAreaProps}
                        {...field}
                        label={label}
                        placeholder={placeholder}
                        tooltip={tooltip}
                        labelProps={{ variant: 'medium' }}
                        errorLabel={fieldState.error?.message}
                        counter={maxLength ? { maxLength } : undefined}
                        startOpen
                        autoExpand={true}
                    />
                )}
            />
        </div>
    )
}
