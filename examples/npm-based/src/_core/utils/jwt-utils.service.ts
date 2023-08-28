import * as _ from "lodash";
const jwt = require('jsonwebtoken');

const JWT_PUBLIC      = loadKey( process.env.REACT_APP_JWT_PUBLIC);

export const JwtUtilsService = {
  verify,
  verifyWithPublicKey
}

function checkKey(key) {
  if(_.isNil(key))
    throw new Error('Cannot initiate JWT correctly, key is not initialized')
}

function loadKey(key){
  return (_.isNil(key)) ?
    null :
    key
      .replace(/\|/g, "\n")
      .replace(/\\n/gm, '\n')
}

async function verify(token) : Promise<any> {
  checkKey(JWT_PUBLIC)
  return new Promise( (resolve, reject) => {
    const opts = {  algorithms : ["RS256"] };
    jwt.verify(
      token, JWT_PUBLIC ,opts,
      (err, decoded) => (err) ? reject(err) : resolve(decoded));
  })
}

async function verifyWithPublicKey(token, publicKey : string): Promise<any> {
  const k = loadKey(publicKey)
  checkKey(k)
  return new Promise( (resolve, reject) => {
    const opts = {  algorithms : ["RS256"] };
    jwt.verify(
      token, k ,opts,
      (err, decoded) => (err) ? reject(err) : resolve(decoded));
  })
}
