
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useHistory, useLocation } from "react-router";
import Dropdown from './dropdown';
import { useSignatureProfiles } from '../contexts/signature-profile.context';
import { FrontUrlProvider } from '../utils/front-url-provider';

const drawerWidth = 240;

const MenuItem = ({link, text}) => {
  const history                   = useHistory();
  const location                  = useLocation();
  const [isSelected, setSelected] = useState(false);

  useEffect(() => {
    setSelected(location.pathname === link);
  }, [location.pathname, link]);

  return <>
    <div onClick={()=>history.push(link)} className={`justify-center py-3 px-5 border-t border-b ${isSelected ? 'bg-primary-900' : ''} cursor-pointer`}>
      {text}
    </div>
  </>
}

const MenuContent = () => {

  return <div className='mt-2'>
    <MenuItem link={FrontUrlProvider.homePage()} text='Home'/>
    <MenuItem link={FrontUrlProvider.usersPage()} text='Users'/>
    <MenuItem link={FrontUrlProvider.signatureRequestsPage()} text='Signature request'/>
  </div>
}

const Menu = ({children}) => {
  const {selectedSignatureProfile, selectedSignatureProfileId, signatureProfiles, doSelectSignatureProfile} = useSignatureProfiles()

  const selectSignatureProfile = (e) => {
    doSelectSignatureProfile(e) 
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar className='bg-primary-500' position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar className='flex justify-between'>
          <Typography variant="h6" noWrap component="div">
            Ignisign demo
          </Typography>
          <Dropdown 
          callback={e=>selectSignatureProfile(e)} 
          value={selectedSignatureProfileId}
          items={signatureProfiles?.map(e=>({label: e.name, value: e._id}))}
          label='Choose signature profile'
          name='signatureProfile'/>
        </Toolbar>
        {/* {selectedSignatureProfile?._id} */}
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <div className='pt-14 h-screen bg-gray-800'>
          <MenuContent/>
        </div>
      </Drawer>
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <div className='pt-4 h-full'>
              <div className='mx-auto max-w-7xl'>
                {children}
              </div>
            </div>
          </Box>
    </Box>
  )
}

export default Menu