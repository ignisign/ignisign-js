import React from 'react'
import { Button } from "./button";

interface IHeaderPageProps {
  title           : string;
  subTitle       ?: string;
  action         ?: {
    label     : string;
    onClick  : () => void;
    disabled ?: boolean;
  }
}

export const HeaderPage = ({title, subTitle = '', action = null} : IHeaderPageProps) => {

  return (
    <div className="mt-3 mb-6 w-full">
      <div className="w-full flex gap-10 justify-between">
        <div className="text-3xl font-bold">
          {title}
        </div>

        {action && 
          <Button 
            onClick={action.onClick} 
            disabled={action?.disabled}
          >
            {action.label}
          </Button>
        }
      </div>

      {subTitle &&
        <div className="text-gray-300 text-sm">
          {subTitle}
        </div>
      }
    </div>
  )
}