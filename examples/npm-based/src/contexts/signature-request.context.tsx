
import React, {useState, createContext, useContext, useEffect} from "react";
import { ApiService } from "../services/api.service";
import { useSignatureProfiles } from "./signature-profile.context";
import { MySignatureRequest } from "../models/signature-request.front.model";

export interface ISignatureRequestsContext {
  signatureRequests: MySignatureRequest[]
  createSignatureRequest: (data) => Promise<void>
}

const SignatureRequestsContext = createContext<ISignatureRequestsContext>( {} as ISignatureRequestsContext);

const SignatureRequestsContextProvider = ({ children }) => {
  const [signatureRequests, setSignatureRequests] = useState<MySignatureRequest[]>([])
  const {selectedSignatureProfileId} = useSignatureProfiles()

  const getSignatureRequests = async () => {
    if(selectedSignatureProfileId){
      const sr = await ApiService.getSignatureRequests(selectedSignatureProfileId);
      setSignatureRequests(sr);
    }
    else{
      setSignatureRequests([])
    }
  }

  const createSignatureRequest = async (data) => {
    await ApiService.createSignatureRequest(selectedSignatureProfileId, data)
    await getSignatureRequests()
  }

  useEffect(() => {
    getSignatureRequests()
  }, [selectedSignatureProfileId])

  const context = { 
    signatureRequests,
    createSignatureRequest,
  };

  return (
    <SignatureRequestsContext.Provider value={context}>
      {children}
    </SignatureRequestsContext.Provider>)
};

const useSignatureRequests = () => useContext(SignatureRequestsContext)

export {
  useSignatureRequests,
  SignatureRequestsContextProvider,
};
