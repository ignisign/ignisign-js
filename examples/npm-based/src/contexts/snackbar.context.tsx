import React, {createContext, useContext, useState} from "react";
import {SnackbarProvider, useSnackbar} from "notistack";
import * as _ from "lodash";

export interface IIgnisignSnackbarContext {
  notifyWarn    : (message: string) => void,
  notifyError   : (message: string, errorToLog?: any) => void,
  notifySuccess : (message: string) => void,
  notifyInfo    : (message: string) => void
}

const IgnisignSnackbarProvider = ({children}) => {
  return (
    <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      <IgnisignSnackbarProviderContent>
         {children}
       </IgnisignSnackbarProviderContent>
    </SnackbarProvider>
  )
}

const IgnisignSnackbarContext = createContext<IIgnisignSnackbarContext>({} as IIgnisignSnackbarContext)

const IgnisignSnackbarProviderContent = ({ children}) => {
  const notiSnackBar = useSnackbar();

  const getVariantButtonColor = (variant : string) => {
    return  (variant === "warning") ? " border-yellow-400 bg-yellow-100 text-yellow-400" :
            (variant === "error")   ? " border-red-400 bg-red-100 text-red-400" :
            (variant === "success") ? " border-green-400 bg-green-100 text-green-400" :
            (variant === "info")    ? " border-blue-400 bg-blue-100 text-blue-400" :
            "border-primary-400 bg-primary-100 text-primary-400";
  }

  const treatFormattedNotification = (message,  variant) => {

    const k = new Date().getTime() + Math.random();
    const notifDto = {
      message: message,
      dismissed : true,
      key : k,
      options: {
        key: k,
        autoHideDuration: 5000,
        variant: variant,
        action: key => (
          <div className={"border px-2 py-1 rounded text-xs" + getVariantButtonColor(variant)} onClick={() => notiSnackBar.closeSnackbar(key)}> Hide </div>
        ),
        onClose: (event, reason, myKey) => {

        },
        onExited: (event, myKey) => {
          notiSnackBar.closeSnackbar(myKey);
        },
      },
    }
    notiSnackBar.enqueueSnackbar(notifDto.message, notifDto.options)
  }

  const notifyWarn = ( message)    => treatFormattedNotification(message, "warning")

  const notifySuccess = ( message) => treatFormattedNotification(message, "success")
  const notifyInfo = ( message)    => treatFormattedNotification(message, "info")

  const notifyError = ( message, errorToLog?: any)   => {

  treatFormattedNotification(message, "error")
  }

  const context = { notifyWarn, notifyError, notifySuccess, notifyInfo};

  return (
      <IgnisignSnackbarContext.Provider value={context}>
        {children}
      </IgnisignSnackbarContext.Provider>

  )
}


const useIgniSnackbar = () => useContext(IgnisignSnackbarContext)

export {
  useIgniSnackbar,
  IgnisignSnackbarProvider
}



