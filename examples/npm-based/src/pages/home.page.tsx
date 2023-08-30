
import React, {useEffect, useState} from "react";
import { useSignatureProfiles } from "../contexts/signature-profile.context";
import { HeaderPage } from "../components/headerPage";


export function HomePage() {
  const {signatureProfiles, doSelectSignatureProfile, selectedSignatureProfile} = useSignatureProfiles()

  return (
      <div>
         <HeaderPage title='Welcome to the Ignisign Demo Application'/>
      </div>
    
  )
}

