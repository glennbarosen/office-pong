import React from 'react'
import {
    DatePicker,
    FieldGroup,
    TextInput,
    type DatePickerProps,
    type LabelProps,
    type TextInputProps,
} from '@fremtind/jokul'
import { format, set } from 'date-fns'

export interface Props {
    label?: string
    labelProps?: LabelProps
    datePickerProps?: DatePickerProps
    timePickerProps?: TextInputProps
    value?: string

    onChange: (newDateString: string) => void
}

/**
 * A reusable component that combines a DatePicker with a time input field
 */
export const DateTimePicker = ({
    label = '',
    labelProps = { variant: 'medium', children: label },
    datePickerProps,
    timePickerProps,
    value,
    onChange,
}: Props) => {
    // Parse the current date value
    const currentDate = value ? new Date(value) : new Date()

    // Format values for display
    const dateString = value ? format(currentDate, 'dd.MM.yyyy') : undefined
    const hours = format(currentDate, 'HH')
    const minutes = format(currentDate, 'mm')

    // Handle date change from the date picker
    const handleDateChange = (_: unknown, newDate: Date | null) => {
        if (newDate) {
            // Preserve the time from the current date
            const updatedDate = new Date(newDate)
            updatedDate.setHours(currentDate.getHours())
            updatedDate.setMinutes(currentDate.getMinutes())

            onChange(updatedDate.toString())
        }
    }

    // Handle time input changes
    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value

        // Try to parse the time input in various formats
        const timeMatch = input.match(/^(\d{1,2})[:.,-]?(\d{1,2})?$/)

        if (timeMatch) {
            const hours = parseInt(timeMatch[1], 10)
            // If minutes are not provided, use 0
            const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0

            // Validate hours and minutes
            if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
                // Use date-fns set to update time without changing date
                const updatedDate = set(currentDate, {
                    hours,
                    minutes,
                })

                onChange(updatedDate.toString())
            }
        }
    }

    return (
        <FieldGroup legend={label} labelProps={labelProps} className="flex gap-24">
            <DatePicker {...datePickerProps} value={dateString} onChange={handleDateChange} />
            <TextInput
                label="Tid"
                {...timePickerProps}
                width="8ch"
                defaultValue={`${hours}:${minutes}`}
                onChange={handleTimeChange}
                placeholder="hh:mm"
            />
        </FieldGroup>
    )
}
