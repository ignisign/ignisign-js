
import axios, { AxiosRequestConfig } from "axios";
import { MySignatureRequestSigners } from "../models/signature-request.front.model";

const APP_BACKEND_ENDPOINT = process.env.REACT_APP_BACKEND_ENDPOINT || "http://localhost:4242"

const getUrl = (url) => `${APP_BACKEND_ENDPOINT}${url}}`

const http = {
  post    : async (url, body, options: AxiosRequestConfig = {}) => (await axios.post(getUrl(url), body, options))?.data,
  get     : async (url, options: AxiosRequestConfig = {})       => (await axios.get(getUrl(url), options))?.data,
  delete  : async (url, options: AxiosRequestConfig = {})       => (await axios.delete(getUrl(url), options))?.data
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
  return http.get(`/v1/files/${documentHash}`)
}

async function getSignatureProfiles(){
  return http.get("/v1/signature-profiles")
}

async function getSignatureRequests(signatureProfileId) {
  return http.get(`/v1/signature-profiles/${signatureProfileId}/signature-requests`)
}

async function getSignatureRequestSigners(signatureRequestId): Promise<MySignatureRequestSigners>{
  return http.get(`/v1/signature-requests/${signatureRequestId}`)
}

async function addUser(signatureProfileId, body) {
  return http.post(`/v1/signature-profiles/${signatureProfileId}/users`, body)
}

async function getUsers() {
  return http.get(`/v1/users`)
}

async function deleteUser(userId) {
  return http.delete(`/v1/users/${userId}`)
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

  return http.post(`/v1/signature-profiles/${signatureProfileId}/signature-requests`,
    formData, 
    { headers: {'Content-Type': 'multipart/form-data'} })
}