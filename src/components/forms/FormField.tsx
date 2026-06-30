import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from 'react-hook-form'
import { type TextInputProps } from 'react-native'

import { Input } from '@/components/ui'

interface FormFieldProps<T extends FieldValues> extends TextInputProps {
  control: Control<T>
  name: Path<T>
  label?: string
  rules?: Omit<
    RegisterOptions<T, Path<T>>,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
  >
}

/** A react-hook-form-controlled text input built on the UI `Input` primitive. */
export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  rules,
  ...inputProps
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <Input
          label={label}
          value={value ?? ''}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          {...inputProps}
        />
      )}
    />
  )
}
