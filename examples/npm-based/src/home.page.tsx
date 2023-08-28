import { IGNISIGN_SIGNATURE_METHOD_REF } from "@ignisign/public";
import React, {useEffect, useState} from "react";
import { useSignatureProfiles } from "./contexts/signature-profile.context";

const methods = {
  [IGNISIGN_SIGNATURE_METHOD_REF.SIMPLE_STD]: 'Simple',
  [IGNISIGN_SIGNATURE_METHOD_REF.ADVANCED_STD]: 'Advanced',
  [IGNISIGN_SIGNATURE_METHOD_REF.QUALIFIED_STD]: 'Qualified',
}

export function HomePage() {
  const {signatureProfiles, doSelectSignatureProfile, selectedSignatureProfile} = useSignatureProfiles()

  return (
      <div>
        {/* <div>Signature profiles</div>
        {
          signatureProfiles?.map((e)=>{
            return <div key={e._id} className={`flex border ${e._id === selectedSignatureProfile?._id ? 'border-green-500' : ''}`}>
              <div>{e.name}</div>
              <div>{methods[e.signatureMethodRef]}</div>
            </div>
          })
        } */}
      </div>
    
  )
}

