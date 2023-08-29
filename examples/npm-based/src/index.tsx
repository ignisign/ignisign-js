import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { CssBaseline, MuiThemeProvider } from "@material-ui/core";
import { createTheme } from "@material-ui/core/styles";

import { SignatureRequestsContextProvider } from './contexts/signature-request.context';
import { SignatureProfilesContextProvider } from './contexts/signature-profile.context';
import { IgnisignSnackbarProvider } from './contexts/snackbar.context';
import { UsersContextProvider } from './contexts/user.context';

import SignatureRequestsPage from './pages/signature-requests.page';
import SignatureRequestCreationPage from './pages/signature-request-creation.page';
import SignatureRequestsDetailPage from './pages/signature-request-details.page';
import UsersPage from './pages/users.page';
import { HomePage } from './pages/home.page';

import Menu from './components/menu';

import muiTheme from './utils/mui-theme';
import { FrontUrlProvider } from './utils/front-url-provider';

import './index.css';




const NotFoundPage = () => {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>The requested page could not be found.</p>
    </div>
  );
};

function AppRouter() {
  return (
    <div className='mt-12'>
      <Switch>
        <Route exact path={FrontUrlProvider.homePage()}>                     <HomePage/>                      </Route>
        <Route exact path={FrontUrlProvider.usersPage()}>                    <UsersPage/>                     </Route>
        <Route exact path={FrontUrlProvider.signatureRequestsPage()}>        <SignatureRequestsPage/>         </Route>
        <Route exact path={FrontUrlProvider.signatureRequestCreationPage()}> <SignatureRequestCreationPage/>  </Route>
        <Route exact path={FrontUrlProvider.signatureRequestsDetailPage()}>  <SignatureRequestsDetailPage/>   </Route>
        <Route> <NotFoundPage /></Route>
      </Switch>
    </div>
  )
}

function App() {
  const themeConfig = createTheme(muiTheme);

  return (
     <MuiThemeProvider theme={themeConfig}>
       <CssBaseline/>
        <Router>
          <IgnisignSnackbarProvider>
            <SignatureProfilesContextProvider>
              <SignatureRequestsContextProvider>
                <UsersContextProvider>
                  <Menu>
                    <AppRouter/>
                  </Menu>
                </UsersContextProvider>
              </SignatureRequestsContextProvider>
              
            </SignatureProfilesContextProvider>
          </IgnisignSnackbarProvider>
        </Router>
      </MuiThemeProvider>
  )
}

ReactDOM.render(<App />, document.getElementById('root'));



