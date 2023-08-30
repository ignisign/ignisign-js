import { useState } from 'react';
import { useHistory } from "react-router";
import { Input } from '../components/input';
import { useForm } from 'react-hook-form';
import MultiSelect from '../components/multiselect';
import { useUsers } from '../contexts/user.context';
import { useSignatureRequests } from '../contexts/signature-request.context';
import { HeaderPage } from '../components/headerPage';
import { useSignatureProfiles } from '../contexts/signature-profile.context';
import FormWrapper from '../components/formWrapper';
import { Dropzone } from '../components/dropzone';
import { IGNISIGN_DOCUMENT_TYPE } from '@ignisign/public';
import { useIgniSnackbar } from '../contexts/snackbar.context';
import { FrontUrlProvider } from '../utils/front-url-provider';

const SignatureRequestCreationPage = () => {
  const { notifyError }                                        = useIgniSnackbar();
  const history                                                = useHistory();
  const [selectedFiles, setSelectedFiles]                      = useState([]);
  const [isDirty, setIsDirty]                                  = useState(false);
  const {users}                                                = useUsers();
  const {selectedSignatureProfileId, selectedSignatureProfile} = useSignatureProfiles();
  const {createSignatureRequest}                               = useSignatureRequests();
  const [isLoading, setIsLoading]                              = useState(false);

  const form = useForm({
    resolver: (data, context) => {
      setIsDirty(true)
      const errors: any = {};
      if(!data.title || data.title === '') 
        errors.title = 'This field is required';
      
      if(!data.users || data.users.length === 0) 
        errors.users = 'This field is required';

      return {
        values: data,
        errors,
      };
    },
  })

  const submit = async () => {
    const values = form.getValues();

    if(selectedFiles && selectedFiles.length){
      const data = {
        title: values.title,
        usersIds: values.users,
        files: selectedFiles
      };
      setIsLoading(true);

      try {
        await createSignatureRequest(data);
        history.replace(FrontUrlProvider.signatureRequestsPage());
      } catch (error) {
        console.error(error);        
        notifyError('Failed to create signature request');
      } finally {
        setIsLoading(false);
      }
    }
    
  }

  const handleFileChange = (files : File[], fullPrivacy : boolean = false) => {
    // const files = Array.from(event.target.files);
    const keepFiles = selectedFiles.filter(e=>e.fullPrivacy !== fullPrivacy)
    const newFiles = files.map(e=>({
      fullPrivacy,
      file: e
    }))
    setSelectedFiles([...keepFiles, ...newFiles]);

    console.log('files', files);
  };

  return (
    <>
      <HeaderPage title='Create a file signature instance'/>

      <div className='max-w-lg'>

        <FormWrapper form={form} 
          confirm={{
            label    : 'Submit',
            onClick  : submit,
            disabled : !selectedSignatureProfileId,
            loading  : isLoading
          }}
          cancel={{
            label    : 'Cancel',
            disabled : isLoading,
            onClick  : () => history.replace(FrontUrlProvider.signatureRequestsPage()),
          }}
        >
          <div className='w-full flex flex-col gap-3'>
            <div>
              <Input form={form} label='Title' name='title'/>
            </div>

            {selectedSignatureProfile?.documentTypes?.includes(IGNISIGN_DOCUMENT_TYPE.PRIVATE_FILE) ?
              <Dropzone
                title="Full privacy files"
                onDrop={async files => handleFileChange(files)}
                files={selectedFiles}
                maxFiles={1}
                multiple={false}
              /> :
              
              <Dropzone
                title="Files"
                onDrop={async files => handleFileChange(files)}
                files={selectedFiles}
                maxFiles={1}
                multiple={false}
              />
            }

            <MultiSelect 
              form={form} label='Users' name='users'
              datas={users.map(u=>({
                id    : u._id,
                value : `${u.firstName} ${u.lastName}` 
              }))} 
            />

            {(isDirty && !selectedFiles) &&
              <div className='text-red-500'>
                At least one file is required
              </div>
            }
          </div>
        </FormWrapper>
      </div>
  </>
  )
}

export default SignatureRequestCreationPage