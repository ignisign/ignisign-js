
import React, { useState } from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import { UseFormReturn } from 'react-hook-form';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

type MultiSelectData = {
  id    : string
  value : string
};

type IMultiSelectProps = {
  label : string;
  form  : UseFormReturn<any>;
  name  : string;
  datas : MultiSelectData[];
};

export default function MultiSelect({form, name, label, datas}: IMultiSelectProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleChange = (event: SelectChangeEvent<typeof selectedItems>) => {
    const v = event.target.value;
    
    const value: any = typeof v === 'string' ? v.split(',') : v
    form.setValue(name, value)
    setSelectedItems(value);
  };

  return (
    <div className='w-full'>
        <InputLabel id="demo-multiple-checkbox-label">{label}</InputLabel>
        <Select
          fullWidth
          labelId="demo-multiple-checkbox-label"
          id="demo-multiple-checkbox"
          multiple
          value={selectedItems}
          onChange={handleChange}
          input={<OutlinedInput label="Tag" />}
          renderValue={(selected) => selected.map(e=>datas.find(d=>e===d.id).value).join(',')}
          MenuProps={MenuProps}
          error={!!form.formState.errors[name]}
        >
          {datas.map(({id, value}) => (
            <MenuItem key={id} value={id}>
              <Checkbox checked={selectedItems.findIndex(e=>e === id) > -1}/>
              <ListItemText primary={value}/>
            </MenuItem>
          ))}
        </Select>
    </div>
  );
}