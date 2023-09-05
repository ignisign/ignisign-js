
import React, {useEffect, useState} from "react";
import { useSignatureProfiles } from "../contexts/signature-profile.context";
import { HeaderPage } from "../components/headerPage";


export function HomePage() {
  const {signatureProfiles, doSelectSignatureProfile, selectedSignatureProfile, } = useSignatureProfiles()

  return (
      <div>
          <HeaderPage title='Welcome to the Ignisign Demo Application'/>
          <div className="mt-2">
            {
              signatureProfiles?.length === 0 && <>
                You need to have at least one signature profile with embed mode to be able to use this example
              </>
            }
          </div>
      </div>
    
  )
}

