import { TbRectangularPrismPlus } from "react-icons/tb";
import { FaPlusCircle } from "react-icons/fa";
import { Button } from "./button";

interface INoContentProps {
  title       ?: string;
  description ?: string;
  className   ?: string;
  button      ?: {
    label   : string;
    onClick : () => void;
  }
};

export const NoContent = ({title, description, className = '', button}: INoContentProps) => {

  return (
    <div className={`mx-auto p-3 mt-10 w-max ${className}`}>
      <div className='w-8 h-8 rounded-lg border border-gray-500 flex justify-center items-center mb-4'>
        <TbRectangularPrismPlus className='w-5 h-5'/>
      </div>

      <div className="font-semibold mx-auto mb-1">
        {title}
      </div>

      {description &&
        <div className="text-xs text-gray-500 mb-1 max-w-xs">
          {description}
        </div>
      }

      <Button onClick={button.onClick}>
        <div className="flex items-center gap-3">
          <FaPlusCircle/>

          {button.label}
        </div>
      </Button>
    </div>
  )
}