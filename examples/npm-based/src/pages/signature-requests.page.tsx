import { useHistory } from "react-router";
import { useSignatureRequests } from '../contexts/signature-request.context';
import { useSignatureProfiles } from '../contexts/signature-profile.context';
import { HeaderPage } from '../components/headerPage';
import { NoContent } from '../components/noContent';  
import { MySignatureRequest } from '../models/signature-request.front.model';
import { FaFileSignature } from "react-icons/fa";
import { FrontUrlProvider } from '../utils/front-url-provider';

const SignatureRequestsPage = () => {
  const history                      = useHistory();
  const {signatureRequests}          = useSignatureRequests()
  const {selectedSignatureProfileId} = useSignatureProfiles()

  return (
    <div>
      <HeaderPage
        title='Signature requests'
        action={signatureRequests?.length === 0 ? null : {
          label: 'Create a signature request',
          onClick: () => history.push(FrontUrlProvider.signatureRequestCreationPage()),
          disabled: !selectedSignatureProfileId
        }}
      />

      <div>
        {signatureRequests?.length === 0 ?
          <NoContent
            title='No signature request'
            description='Create a signature request to start using Ignisign'
            button={{
              label: 'Create a signature request',
              onClick: () => history.push(FrontUrlProvider.signatureRequestCreationPage()),
            }}
          /> :
          <div className='flex flex-col gap-3 w-full'>
            {signatureRequests
              .sort(() => -1)
              .map(sr => 
                <SignatureRequestItem key={`signature-request-${sr?._id}`} signatureRequest={sr}/> )
            }
          </div>
        }
      </div>
    </div>
  )
}

interface ISignatureRequestItemProps {
  signatureRequest : MySignatureRequest;
}

const SignatureRequestItem = ({signatureRequest} : ISignatureRequestItemProps) => {
  const history = useHistory();

  const openSignatureRequest = () => history.push(FrontUrlProvider.signatureRequestsDetailPage(signatureRequest._id));

  return (
    <div className='cursor-pointer shadow bg-gray-900 rounded px-3 py-2 flex gap-3 items-center' onClick={openSignatureRequest}>
      <span className='text-primary-500'>
        <FaFileSignature size={20}/>
      </span>

      <span>
        {signatureRequest.title}
      </span>
    </div>
  )
}

export default SignatureRequestsPage