
import MuiButton from '@mui/material/Button';
import { PropsWithChildren } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

type ButtonType = 'button' | 'submit';
interface IButtonProps {
  onClick  ?: () => void;
  type     ?: ButtonType;
  disabled ?: boolean;
  loading  ?: boolean;
};

const Button = ({
  onClick  = null,
  type     = 'button',
  disabled = false,
  loading  = false,
  children
} : PropsWithChildren<IButtonProps>) => {

  return (
    <div className='relative'> 
      { loading && 
        <LoadingSpinner className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'/> 
      }

      <MuiButton
        className={`${disabled || loading ? 'text-gray-500' : ''}`} 
        disabled={disabled || loading} 
        type={type} 
        sx={{textTransform: 'none'}} 
        variant='outlined' 
        onClick={() => !disabled && onClick && onClick()} 
      >
        {children}
      </MuiButton>
    </div>
  )
}

export {
  Button
}