import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import Background1 from "../../../public/assets/manajement-dokumen-login-4.svg";
import Cookies from "js-cookie";
import { loginRequest } from "@/helpers/apiClient";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const SectionRight = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [captchaInput, setCaptchaInput] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const [captchaID, setCaptchaID] = useState<string>("");
  const [captchaURL, setCaptchaURL] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Generate CAPTCHA
  const fetchCaptcha = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API}/auths/generate-captcha`,
      );
      const data = await response.json();

      setCaptchaID(data.captcha_id);
      setCaptchaURL(`${process.env.NEXT_PUBLIC_API}${data.captcha_url}`);
    } catch (error) {
      console.error("Error fetching CAPTCHA:", error);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleSubmitLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!captchaInput) {
      setErrorMessage("Captcha is required");
      return;
    }
    try {
        const payload = {
          username: username,
          password: password,
          captcha_id: captchaID,
          captcha: captchaInput,
        };
        const response = await loginRequest("/auths/login", "POST", payload);
        const data = await response.json();
        // console.log(data);
        

      if (response.ok && data.responseCode === 200) {
        localStorage.setItem("hasVisited", "true");
        Cookies.set("token", data.responseData.token, { expires: 7 });
        Cookies.set("user", JSON.stringify(data.responseData.user), { expires: 7 });
        router.push("/dashboard");
      } else {
        setErrorMessage(data.responseDesc || "Login failed. Please try again.");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again later.");
    }
  };

  // Fungsi Bypass Login
  // const handleBypassLogin = () => {
  //   Cookies.set("token", "bypassToken", { expires: 7 }); // Simpan token manual
  //   router.push("/dashboard"); // Redirect langsung ke dashboard
  // };

  return (
    <>
      <div className="block sm:hidden md:block">
        <div className="relative z-[2] flex h-screen flex-col items-center justify-center px-12 lg:px-[100px] xl:px-[120px] 2xl:px-[150px]">
          <div className="2xl:w-full">
            {/* <div className="relative z-[2] mt-[250px] md:mt-[220px] md:px-12 lg:mt-[230px] lg:px-[100px] 2xl:mt-[250px] xl:mt-[170px] xl:px-[120px] 2xl:px-[150px]"> */}
            <div className="w-full font-poppins font-semibold text-[#1D92F9] md:text-[23px] lg:text-[24px] xl:text-[28px]">
              Masuk ke dalam Sipaduke
            </div>
            <div className="w-full pt-1 font-inter font-normal leading-normal text-[#0C479F] md:text-[13px] lg:text-[14px] xl:text-[14px]">
              Silahkan masuk untuk melakukan aktifitas anda
            </div>
            <section className="w-full">
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

                <div className="relative mt-[15px]">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Masukkan Password..."
                    className="block w-full rounded-[7px] border-0 px-[30px] py-[17px] font-inter font-normal text-gray-900 shadow-sm ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 md:text-[15px] lg:text-[16px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <FaEyeSlash size={20} />
                    ) : (
                      <FaEye size={20} />
                    )}
                  </button>
                </div>

                {errorMessage && (
                  <p className="mt-[10px] text-sm text-red-500">
                    {errorMessage}
                  </p>
                )}
                {/* CAPTCHA */}
                <div className="mt-[15px]">
                  {/* <label htmlFor="captcha" className="font-inter font-medium text-[#1D92F9]">
                  Captcha
                </label> */}
                  <div className="mt-2 flex items-center">
                    <Image
                      src={captchaURL}
                      alt="captcha"
                      width={240}
                      height={80}
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={fetchCaptcha}
                      className="ml-2 font-poppins text-blue-600 hover:text-blue-800 md:text-[15px] lg:text-[16px]"
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

              {/* Tombol Bypass Login */}
              {/* <button
                type="button"
                onClick={handleBypassLogin}
                className="mt-[20px] w-full rounded-[7px] bg-green-500 font-poppins font-normal text-white shadow-sm hover:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 md:py-[16px] lg:py-[16px] lg:text-[16px] xl:text-[16px]"
              >
                Bypass Login
              </button> */}
            </section>
          </div>
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
