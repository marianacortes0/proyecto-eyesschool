import { useState, ChangeEvent } from 'react'

/**
 * Hook to manage form inputs easily
 */
export function useForm<T>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues)

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setValues({
      ...values,
      [name]: value,
    })
  }

  const resetForm = () => {
    setValues(initialValues)
  }

  return {
    values,
    handleChange,
    setValues,
    resetForm,
  }
}
