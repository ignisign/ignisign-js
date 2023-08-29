import {Dispatch, MutableRefObject, useRef, useState} from "react";


export const useStateWithRef = <T>( defaultValue : T = null) : [T, Dispatch<T>, MutableRefObject<T>] => {
  const [ state, _setState] = useState<T>(defaultValue);
  const ref = useRef<T>(defaultValue);

  const setState = (data : T) => {
    ref.current = data;
    _setState(data)
  }

  return [state, setState, ref];
}


