import React, { PropsWithChildren } from 'react'
import { Button } from './button'
import { FieldValues, UseFormReturn } from 'react-hook-form'

interface FormWrapperButtonProps {
  label      : string
  onClick    : () => void
  loading   ?: boolean
  disabled  ?: boolean
};

interface IFormWrapperProps {
  form       : UseFormReturn<FieldValues, any, undefined>,
  confirm    : FormWrapperButtonProps,
  cancel    ?: FormWrapperButtonProps
};

const FormWrapper = ({
    form,
    children,
    confirm,
    cancel = null
  } : PropsWithChildren<IFormWrapperProps>) => {

  return (
    <form onSubmit={form.handleSubmit(confirm?.onClick)}>
      <div className='mb-5'>
        {children}
      </div>

      <div className={`flex ${!!cancel ? 'justify-between' : 'justify-end'} items-center gap-5`}>
        { !!cancel &&
          <Button
            onClick={cancel.onClick}
            disabled={cancel?.disabled || cancel?.loading}
          >
            {cancel.label}
          </Button>
        }

        <Button 
          disabled={confirm?.disabled || confirm?.loading} 
          type='submit'
        >
          {confirm.label}
        </Button>
      </div>

    </form>
  )
}

export default FormWrapper;