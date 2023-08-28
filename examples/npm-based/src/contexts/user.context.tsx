
import React, {useState, createContext, useContext, useEffect} from "react";
import { ApiService } from "../services/api.service";
import { useSignatureProfiles } from "./signature-profile.context";
import { MyUser } from "../models/user.front.model";
import { useIgniSnackbar } from "./snackbar.context";
export interface IUsersContext {
  addUser: (user: MyUser) => void,
  deleteUser: (userId: string) => void,
  users: MyUser[]
}

const UsersContext = createContext<IUsersContext>( {} as IUsersContext);

const UsersContextProvider = ({ children }) => {
  const { notifyError }              = useIgniSnackbar();
  const {selectedSignatureProfileId} = useSignatureProfiles();
  const [users, setUsers]            = useState([]);

  const getUsers = async () => {
    try {
      const tmpUsers = await ApiService.getUsers();
      setUsers(tmpUsers || []);
    } catch (e) {
      console.error(e);
      notifyError('Failed to get users');
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      await ApiService.deleteUser(userId);
      await getUsers();
    } catch (e) {
      console.error(e);
      notifyError('Failed to delete user');
    }
  }

  const addUser = async (user: MyUser) => {
    try {
      await ApiService.addUser(selectedSignatureProfileId, user)
      await getUsers()
    } catch (e) {
      console.error(e);
      notifyError('Failed to add user');
    }
  }

  useEffect(() => {
    getUsers()
  }, [selectedSignatureProfileId])

  const context = { 
    addUser,
    deleteUser,
    users
  };

  return (
    <UsersContext.Provider value={context}>
      {children}
    </UsersContext.Provider>)
};

const useUsers = () => useContext(UsersContext)

export {
  useUsers,
  UsersContextProvider,
};
