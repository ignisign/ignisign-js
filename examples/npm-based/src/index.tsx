import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { configureInterceptors } from "./_core/remote/http-apis";
import { HomePage } from './home.page';
import './index.css';
import './additional-style.css';

import "./_core/style/tailwind-theme.css";

import { useDarkMode } from './_core/style/DarkModeContext.context';
import { CssBaseline, MuiThemeProvider } from "@material-ui/core";
import nightwind from "nightwind/helper";
import { createTheme } from "@material-ui/core/styles";
import { AppRoutesService } from "./_core/remote/app-routes.service";
import Menu from './layouts/menu';
import SignatureRequestsPage from './pages/signature-requests.page';
import SignatureRequestCreationPage from './pages/signature-request-creation.page';
import { UsersContextProvider } from './contexts/user.context';
import SignatureRequestsDetailPage from './pages/signature-request-details.page';
import { SignatureRequestsContextProvider } from './contexts/signature-request.context';
import { SignatureProfilesContextProvider } from './contexts/signature-profile.context';
import UsersPage from './pages/users.page';
import { IgnisignSnackbarProvider } from './contexts/snackbar.context';

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
    <div>
      <Switch>
        {/************** ORGANIZATIONS ******************/}

        <Route exact path={AppRoutesService.homePage()}>                     <HomePage/>                      </Route>
        <Route exact path={AppRoutesService.usersPage()}>                    <UsersPage/>                     </Route>
        <Route exact path={AppRoutesService.signatureRequestsPage()}>        <SignatureRequestsPage/>         </Route>
        <Route exact path={AppRoutesService.signatureRequestCreationPage()}> <SignatureRequestCreationPage/>  </Route>
        <Route exact path={AppRoutesService.signatureRequestsDetailPage()}>  <SignatureRequestsDetailPage/>   </Route>

        <Route> <NotFoundPage /></Route>
      </Switch>
    </div>
  )
}

function App() {
  const { theme } = useDarkMode();
  const themeConfig = createTheme(theme);

  useEffect(() => {
    // document.body.className = "bg-gray-50"
  }, []);

  return (
     <MuiThemeProvider theme={themeConfig}>
       <script dangerouslySetInnerHTML={{ __html: nightwind.init() }} />^
       <CssBaseline/>
        <Router>
          <IgnisignSnackbarProvider>
            <SignatureProfilesContextProvider>
              <Menu>
                <SignatureRequestsContextProvider>
                  <UsersContextProvider>
                    <AppRouter/>
                  </UsersContextProvider>
                </SignatureRequestsContextProvider>
              </Menu>
            </SignatureProfilesContextProvider>
          </IgnisignSnackbarProvider>
        </Router>
      </MuiThemeProvider>
  )
}

function AppContainerDarkMode() {
  return <App />
  // (<DarkModeContextProvider>
  //   <App />
  // </DarkModeContextProvider>)
}

ReactDOM.render(<AppContainerDarkMode />, document.getElementById('root'));

configureInterceptors();


