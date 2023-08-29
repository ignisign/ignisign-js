import { useEffect, useState } from 'react';
import { Button } from '../components/button';
import { useHistory, useLocation, useParams } from "react-router";
import { useUsers } from '../contexts/user.context';
import { ApiService } from '../services/api.service';
import { useSignatureRequests } from '../contexts/signature-request.context';
import { useSignatureProfiles } from '../contexts/signature-profile.context';
import { Snackbar } from '@mui/material';
import { useStateWithRef } from '../utils/useStateWithRef';
import { IGNISIGN_APPLICATION_ENV, IgnisignPrivateFileDto } from '@ignisign/public';
import { IgnisignJs } from '@ignisign/js';
import { MySignatureRequest, Signer } from '../models/signature-request.front.model';
import { BiUserCircle } from "react-icons/bi";
import { HiArrowNarrowRight } from "react-icons/hi";

const IGNISIGN_CLIENT_SIGN_URL = process.env.REACT_IGNISIGN_CLIENT_SIGN_URL || 'https://sign.ignisign.io';

const SignatureRequestsDetailPage = () => {
  const history                                            = useHistory();
  const location                                           = useLocation();
  const { users }                                          = useUsers();
  const { signatureRequests }                              = useSignatureRequests();
  const { selectedSignatureProfileId }                     = useSignatureProfiles();
  const { signatureRequestId }                             = useParams<{ signatureRequestId: string }>();
  const [userSelectToSign, setUserSelectToSign]            = useState<Signer>(null);
  const [, setIsDemmoSnackbarOpen, isDemmoSnackbarOpenRef] = useStateWithRef(false);
  const [signatureRequest, setSignatureRequest]            = useState<MySignatureRequest>();
  const [signers, setSigners]                              = useState<Signer[]>([]);


  const getSignatureRequestUsers = async (signatureRequestId) => {
    const sr = await ApiService.getSignatureRequestSigners(signatureRequestId);

    const signers = sr?.signers?.map(({myUserId, signerId, token}) => {
      const user = users.find(u => u._id.toString() === myUserId);

      if(!user) 
        return null;

      const { firstName, lastName, authSecret, _id } = user;
      
      return {
        _id,
        firstName,
        lastName,
        authSecret,
        token,
        signerId
      }
    }).filter(e=>e !== null)

    setSigners(signers);
  }
  
  useEffect(() => {
    setSignatureRequest(signatureRequests.find(e => e.signatureRequestId === signatureRequestId));
    getSignatureRequestUsers(signatureRequestId);
  }, [users])

  const SignerItem = ({ signer } : { signer: Signer }) => (
    <div className='cursor-pointer flex gap-5 items-center justify-between shadow bg-gray-900 rounded px-3 py-2' 
      onClick={() => setUserSelectToSign(signer)}
      key={`signer-item-${signer._id}`} 
    >
      <div className='flex gap-3 items-center'> 
        <span className='text-primary-500'>
          <BiUserCircle size={30}/>
        </span>

        <div className='font-bold'>
          {signer.firstName} {signer.lastName}
        </div>
        
      </div>
      

      <div className='text-primary-500'>
        <HiArrowNarrowRight size={25}/>
      </div> 
    </div>
  )

  return (
    <div>
      <Snackbar
        open={isDemmoSnackbarOpenRef.current}
        autoHideDuration={6000}
        onClose={()=>setIsDemmoSnackbarOpen(false)}
        message="Need start auth"
      />
      {
        userSelectToSign ? <>
          <div>
            <Button onClick={()=>setUserSelectToSign(null)}>Back</Button>
            {/* { signatureRequest &&  */}
              <EmbeddedSignature 
                signatureRequestId={signatureRequestId}
                signerId={userSelectToSign.signerId}
                token={userSelectToSign.token} 
                authSecret={userSelectToSign.authSecret}
              />
            {/* } */}
          </div>
        </> :
        <>
          {
            signers && 
            <div className='mt-5'>
              <div className='flex flex-col gap-3 w-full'>
                {signers.length ? 
                    signers?.map(s => <SignerItem key={`signer-${s?._id}`} signer={s}/>) :
                    <>
                      Check if webhook is linked
                    </>
                }
              </div>
            </div>
          }
        </>
      }
    </div>
  )
}

const EmbeddedSignature = ({signatureRequestId, signerId, token, authSecret}) => {

    useEffect(() => {
      start();
    }, [])
    
  const handlePrivateFileInfoProvisioning = async (documentId) : Promise<IgnisignPrivateFileDto> => {
    const url = await ApiService.getPrivateFileUrl(documentId);
    return url;
  }

  const start = async () => {
    try {
      const appId  = process.env.REACT_APP_IGNISIGN_APP_ID;
      const appEnv = process.env.REACT_APP_IGNISIGN_APP_ENV;
      
      const ignisign = new IgnisignJs(appId, appEnv as IGNISIGN_APPLICATION_ENV, IGNISIGN_CLIENT_SIGN_URL);

      console.debug('initSignatureRequest : ', {
        appId,
        appEnv,
        signatureRequestId,
        signerId, 
        token,
        authSecret,
      });

      ignisign.initSignatureRequest(
        'test-ignisign-sdk',
        signatureRequestId,
        signerId, 
        token,
        authSecret,
        true,
        { handlePrivateFileInfoProvisioning },
        { width:"100%", height:"710" }
      );
      
    } catch (e) {
      console.error(e);
    }
  }


  return(
    <div>
      <div className='mt-3'>
        <div id='test-ignisign-sdk'/>
      </div>
    </div>
  )

}

export default SignatureRequestsDetailPage  