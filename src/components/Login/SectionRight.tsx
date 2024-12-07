import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import Background1 from "../../../public/assets/manajement-dokumen-login-4.svg";
import Cookies from "js-cookie";

const SectionRight = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [captcha, setCaptcha] = useState<string>("");
  // const [captchaCode, setCaptchaCode] = useState<string>("");
  const [captchaInput, setCaptchaInput] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const [captchaID, setCaptchaID] = useState<string>(""); // ID CAPTCHA dari backend
  const [captchaURL, setCaptchaURL] = useState<string>(""); // URL gambar CAPTCHA

  // Generate CAPTCHA
  // const generateCaptcha = () => {
  //   const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  //   let result = "";
  //   for (let i = 0; i < 6; i++) {
  //     result += characters.charAt(Math.floor(Math.random() * characters.length));
  //   }
  //   return result;
  // };


  // const fetchCaptcha = async () => {
  //   try {
  //     const response = await fetch("http://127.0.0.1:8080/auths/generate-captcha");
  //     console.log("Response status:", response.status); // Debug status response
  
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
  
  //     const data = await response.json();
  //     console.log("CAPTCHA Response Data:", data); // Debug data
  
  //     setCaptchaCode(data.captcha); // Simpan CAPTCHA dari API
  //   } catch (error) {
  //     console.error("Error fetching CAPTCHA:", error);
  //   }
  // };

  // useEffect(() => {
  //   fetchCaptcha();
  // }, []);

  const fetchCaptcha = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8080/auths/generate-captcha");
      const data = await response.json();

      setCaptchaID(data.captcha_id); // Simpan ID CAPTCHA
      setCaptchaURL(`http://127.0.0.1:8080${data.captcha_url}`); // Simpan URL gambar CAPTCHA
    } catch (error) {
      console.error("Error fetching CAPTCHA:", error);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  // const handleSubmitLogin = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   setErrorMessage(null);
  
  //   if (captchaInput !== captchaCode) {
  //     alert("CAPTCHA tidak valid!");
  //     return;
  //   } 
      
  //   try {
  //     const response = await fetch("http://localhost:8080/auths/login", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         accept: "application/json",
  //       },
  //       body: JSON.stringify({ username, password }),
  //     });
  
  //     const data = await response.json();
  
  //     if (response.ok && data.responseCode === 200) {
  //       // Simpan token ke cookie
  //       Cookies.set("token", data.responseData.token, { expires: 7 });
  
  //       // Redirect ke dashboard
  //       router.push("/dashboard");
  //     } else {
  //       setErrorMessage(data.responseDesc || "Login failed. Please try again.");
  //     }
  //   } catch (error) {
  //     setErrorMessage("An error occurred. Please try again later.");
  //   }
  // };

  const handleSubmitLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!captchaInput) {
      setErrorMessage("Captcha is required");
      return;
    }
    try {
        const response = await fetch("http://localhost:8080/auths/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                accept: "application/json",
            },
            body: JSON.stringify({ 
                username, 
                password, 
                captcha_id: captchaID, 
                captcha: captchaInput 
            }),
        });

        const data = await response.json();

        if (response.ok && data.responseCode === 200) {
            Cookies.set("token", data.responseData.token, { expires: 7 });
            router.push("/dashboard");
        } else {
            setErrorMessage(data.responseDesc || "Login failed. Please try again.");
        }
    } catch (error) {
        setErrorMessage("An error occurred. Please try again later.");
    }
  };

  // const handleError = () => {
  //     setErrorMessage("Invalid login or CAPTCHA.");
  //     fetchCaptcha(); // Refresh CAPTCHA
  // };


  return (
    <>
      <div className="block sm:hidden md:block">
        <div className="relative z-[2] mt-[250px] md:mt-[220px] md:px-12 lg:mt-[230px] lg:px-[100px] xl:mt-[250px] xl:px-[120px] 2xl:px-[150px]">
          <div className="font-poppins font-semibold text-[#1D92F9] md:text-[23px] lg:text-[24px] xl:text-[28px]">
            Masuk ke dalam Sipaduke
          </div>
          <div className="pt-1 font-inter font-normal leading-normal text-[#0C479F] md:text-[13px] lg:text-[14px] xl:text-[14px]">
            Silahkan masuk untuk melakukan aktifitas anda
          </div>
          <section>
            <form onSubmit={handleSubmitLogin}>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Masukkan Username..."
                className="mt-[15px] block w-full rounded-[7px] border-0 px-[30px] py-[17px] font-inter font-normal text-gray-900 shadow-sm ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 md:text-[15px] lg:text-[16px]"
              />

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Masukkan Password..."
                className="mt-[15px] block w-full rounded-[7px] border-0 px-[30px] py-[17px] font-inter font-normal text-gray-900 shadow-sm ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 md:text-[15px] lg:text-[16px]"
              />

              {errorMessage && (
                <p className="mt-[10px] text-red-500 text-sm">{errorMessage}</p>
              )}
              {/* CAPTCHA */}
              <div className="mt-[15px]">
                {/* <label htmlFor="captcha" className="font-inter font-medium text-[#1D92F9]">
                  Captcha
                </label> */}
                <div className="mt-2 flex items-center">
                  <img src={captchaURL} alt="captcha" style={{ width: "240px", height: "80px" }} />
                  <button
                    type="button"
                    onClick={fetchCaptcha}
                    className="ml-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    🔄 Refresh
                  </button>
                </div>
                <input
                  type="text"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  required
                  placeholder="Masukkan CAPTCHA..."
                  className="mt-[10px] block w-full rounded-[7px] border-0 px-[30px] py-[17px] font-inter font-normal text-gray-900 shadow-sm ring-1 ring-[#1D92F9]"
                />
              </div>

              <div>
                <span className="float-right mt-[20px] font-poppins text-[#1D92F9] hover:text-[#0C479F] md:text-[15px] lg:text-[16px]">
                  <Link href={`lupa-password`}>Lupa Password?</Link>
                </span>
              </div>

              <button
                type="submit"
                className="mt-[10px] w-full rounded-[7px] bg-[#0C479F] font-poppins font-normal text-white shadow-sm hover:bg-[#1775C7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 md:py-[16px] lg:py-[16px] lg:text-[16px] xl:text-[16px]"
              >
                Masuk
              </button>
            </form>
          </section>
        </div>

        <motion.div
          className="margin absolute right-0 top-0 z-[1] overflow-hidden"
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Image
            className="pointer-events-none relative top-0 max-h-full max-w-full select-none object-cover md:right-[-50px] md:top-[-60px] lg:right-[-10px] lg:top-[-50px]"
            src={Background1}
            alt=""
            priority
          />
        </motion.div>
      </div>
    </>
  );
};

export default SectionRight;
