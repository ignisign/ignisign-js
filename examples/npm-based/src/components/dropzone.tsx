
import React, { useEffect } from "react";
import {DropzoneOptions, useDropzone} from "react-dropzone";
import { LoadingSpinner } from "./LoadingSpinner";

interface IDropzoneProps extends DropzoneOptions {
  files                : File[] | {fullPrivacy: boolean, file: File}[];
  title               ?: string,
  description         ?: string;
  displayExtensions   ?: boolean;
  isLoading           ?: boolean;
}

export function Dropzone({ title, description, files, displayExtensions = false, isLoading = false, ...dropzoneOptions }: IDropzoneProps) {
  const {getRootProps, getInputProps} = useDropzone(dropzoneOptions);

  useEffect(() => {
    console.log('files 2', files);
  }, [files])
  

  return (
    <div className="w-full text-gray-400">
      { title && <p> {title} </p>}

      <section className="rounded border-2 border-primary-500 border-dashed	 p-6 cursor-pointer">
        { isLoading ? 
          <div className="flex items-center justify-center">
            <LoadingSpinner size={30} />
          </div> : 

          <div {...getRootProps({className: 'dropzone'})}>
            <input {...getInputProps()} />
            <p className="flex flex-col items-center font-semibold text-xl text-gray-500 px-6 text-center text-primary-600 truncate">
              {/* <IgniIcon_Folder className="mt-4 text-5xl text-secondary-600" /> */}
              <span className="text-base text-primary-300">{ description || 'Upload' }</span>
              
              {files?.map(file => <span className="text-sm text-primary-200">{ file?.name  || file?.file?.name }</span>)}
            </p>
          </div>
        }
      </section>
    </div>
  )
}
