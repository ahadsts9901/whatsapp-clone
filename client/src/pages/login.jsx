import React, { useEffect } from "react";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { firebaseAuth } from "@/utils/FirebaseConfig";
import axios from "axios";
import { CHECK_USER_ROUTE } from "@/utils/ApiRoutes";
import { useRouter } from "next/router";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";

function login() {
  const router = useRouter();
  const [{ userInfo, newUser }, dispatch] = useStateProvider();
  useEffect(() => {
    if (userInfo?.id && !newUser) {
      router.push("/");
    }
  }, [userInfo, newUser]);
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    const {
      user: { displayName: name, email, photoURL: profileImage },
    } = await signInWithPopup(firebaseAuth, provider);
    try {
      if (email) {
        const { data } = await axios.post(CHECK_USER_ROUTE, { email: email });
        dispatch({
          type: reducerCases.SET_USER_INFO,
          userInfo: {
            id: data.data.id,
            name: data.data.name,
            email: data.data.email,
            profileImage: data.data.profilePicture,
            status: data.data.about,
          },
        });
        router.push("/");
      }
    } catch (err) {
      dispatch({ type: reducerCases.SET_NEW_USER, newUser: true });
      dispatch({
        type: reducerCases.SET_USER_INFO,
        userInfo: { name, email, profileImage, status: "Available" },
      });
      router.push("/onboarding");
    }
  };
  return (
    <div className="flex justify-center items-center bg-panel-header-background h-screen w-screen flex-col gap-6">
      <div className="flex items-center justify-center gap-2 text-white">
        <Image
          src={"/whatsapp.gif"}
          alt="whatsapp"
          height={300}
          width={300}
        ></Image>
        <span className="text-7xl">Whatsapp</span>
      </div>
      <button
        className="flex items-center justify-center gap-7 bg-search-input-container-background p-5 rounded-lg"
        onClick={handleLogin}
      >
        <FcGoogle className="text-4xl"></FcGoogle>
        <span className="text-white text-2xl">Login with Google</span>
      </button>
    </div>
  );
}

export default login;
