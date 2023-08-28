import { InputLabel, MenuItem, Select } from '@mui/material'
import React from 'react'
import { UseFormReturn } from 'react-hook-form'

type Props = {
  label: string
  // form: UseFormReturn<any>
  callback
  name: string
  value
  items: {label, value}[]
}

const Dropdown = ({label, value, items, callback = null, name}: Props) => {
  return <div>
    {/* <InputLabel id="simple-select-label">{label}</InputLabel> */}
    <Select
      // labelId="simple-select-label"
      value={value ?? null}
      label={label}
      onChange={(e)=>{
        callback(e.target.value)
        
      }}
    >
      {/* <MenuItem value={null}/> */}
      {
        items?.map(item=>{
          return <MenuItem value={item.value}>{item.label}</MenuItem>
        })
      }
    </Select>


  </div>
}

export default Dropdown

// export const Input = ({label, form, name, type = 'text', }: Props) => {
//   return <div className='my-2 w-80'>
//     <TextField
//     fullWidth
//     type={type}
//     label={label}
//     error={!!form.formState.errors[name]}
//     {...form.register(name, {required: true})}
//     onChange={(e)=>form.setValue(name, e.target.value)}
//     />
//   </div>
// }