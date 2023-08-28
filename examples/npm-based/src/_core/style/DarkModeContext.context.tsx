import muiTheme from "./mui-theme";
import React, {useState, createContext, useContext, useEffect} from "react";
import { AppRoutesService, ImgRoutesService } from "../remote/app-routes.service";

/**
 * LIGHT | DARK
 */
export enum MODE {
  LIGHT = "light",
  DARK  = "dark",
}

export interface IDarkModeContext {
  theme : any,
  // setStyleMode : (string?) => void
  toogleMode,
  mode: MODE,
  
}



const DarkModeContext = createContext<IDarkModeContext>( {} as IDarkModeContext);

const DarkModeContextProvider = ({ children }) => {

  const [theme, setTheme]     = useState(muiTheme);
  const [mode, setMode] = useState<MODE>(MODE.DARK)
  

  const toogleMode = () => {
    setMode(mode === MODE.LIGHT ? MODE.DARK : MODE.LIGHT)
  }

  useEffect(() => {

    const htmlElement = document.getElementsByTagName("html");
    if(!htmlElement[0]) {
      console.error("Toggle darkMode: cannot find html root element")
    } else {
      htmlElement[0].classList.remove((mode === MODE.LIGHT) ? MODE.DARK : MODE.LIGHT)
      htmlElement[0].classList.add(mode)
    }
    // MUI Management
    const updatedTheme = {
      ...theme,
      palette: { ...theme.palette, type : mode }
    };

    setTheme(updatedTheme);
  }, [mode])

  const context = { 
    theme, 
    mode,
    toogleMode,
    
  };

  return (
    <DarkModeContext.Provider value={context}>
      { children }
    </DarkModeContext.Provider>
  )
};

const useDarkMode = () => useContext(DarkModeContext)

export {
  useDarkMode,
  DarkModeContextProvider,
};
