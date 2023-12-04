import { GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
import { auth } from "../../config/firebase/firebase";

const provider = new GoogleAuthProvider()

export const signInWithGoogle = async () => {
    
    signInWithRedirect(auth, provider);
  
};