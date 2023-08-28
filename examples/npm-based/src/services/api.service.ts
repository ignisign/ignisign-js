
import axios from "axios";
import { MySignatureRequestSigners } from "../models/signature-request.front.model";

const urls = {
  signatureRequest: '/v1/signature-requests',
  signatureProfiles: '/v1/signature-profiles',
  users: '/v1/users',
  getPrivateFileUrl: '/v1/files'
}

const getUrl = (url, params = null) => {
  return `${process.env.REACT_APP_BACKEND_ENDPOINT}${url}${params ? `/${params}` : ''}`
}

type Options = {
  urlParams?: any
  headers?: any
}

const http = {
  post: async (url, body, options: Options = {}) => {
    return (await axios.post(getUrl(url), body, options)).data
  },
  get: async (url, options: Options = {}) => {
    return (await axios.get(getUrl(url), options)).data
  },
  delete: async (url, options: Options = {}) => {
    return (await axios.delete(getUrl(url), options)).data
  }
}

export const ApiService = {
  addUser,
  getUsers,
  deleteUser,
  createSignatureRequest,
  getSignatureRequests,
  getSignatureRequestSigners,
  getSignatureProfiles,
  getPrivateFileUrl,
}

async function getPrivateFileUrl(documentHash){
  return http.get(`${urls.getPrivateFileUrl}/${documentHash}`)
}

async function getSignatureProfiles(){
  return http.get(urls.signatureProfiles)
}

async function createSignatureRequest(signatureProfileId, body: {title, usersIds, files}){
  // Create a FormData object
  const formData = new FormData();

  // Add body parameters
  formData.append('title', body.title);
  formData.append('usersIds', body.usersIds);

  // Add file(s) to the FormData
  body.files.forEach(({fullPrivacy, file}, i) => {
    formData.append(`file`, file);
    formData.append(`fullPrivacy[${i}]`, fullPrivacy.toString())
  });

  return http.post(`${urls.signatureProfiles}/${signatureProfileId}/signature-requests`, formData, {urlParams: {signatureProfileId}, headers: {'Content-Type': 'multipart/form-data'}})
}

async function getSignatureRequests(signatureProfileId) {
  return http.get(`${urls.signatureProfiles}/${signatureProfileId}/signature-requests`)
}

async function getSignatureRequestSigners(signatureRequestId): Promise<MySignatureRequestSigners>{
  return http.get(`${urls.signatureRequest}/${signatureRequestId}`)
}

async function addUser(signatureProfileId, body) {
  return http.post(`${urls.signatureProfiles}/${signatureProfileId}/users`, body)
}

async function getUsers() {
  return http.get(`${urls.users}`)
}

async function deleteUser(userId) {
  return http.delete(`${urls.users}/${userId}`)
}