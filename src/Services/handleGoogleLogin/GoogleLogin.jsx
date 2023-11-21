import { Navigate } from "react-router-dom";
import { auth } from '../../config/firebase/firebase';
import { GoogleAuthProvider, signInWithRedirect } from "firebase/auth";

const provider = new GoogleAuthProvider()

export const signInWithGoogle = () => {
    
    signInWithRedirect(auth, provider).then((result) => {
    if(auth) {
        return <Navigate replace to="/" />;
    }
  }).catch((error) => {
    console.log(error);
  })
};