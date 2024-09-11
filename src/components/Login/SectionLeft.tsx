import Image from "next/image";
import Background1 from "../../../public/assets/login-left2.svg";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SectionLeft = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();

  const handleSubmitLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Here, you would typically send a request to your server to authenticate
    console.log({ username, password });

    // For demo purposes, redirect to the home page after "login"
    router.push("/");
  };
  return (
    <>
      <div className="relative z-[2] mt-[100px] 2xsm:mx-[32px] md:mx-[30px] lg:mx-[58px]">
        <h1 className="font-poppins text-[42px] font-bold leading-[15px] text-white 2xsm:text-[28px] xl:text-[42px]">
          Manajemen Dokumen
          <span className="ml-1 font-poppins text-[72px] text-[#1D92F9]">
            .
          </span>
        </h1>
        <h2 className="pt-4 font-poppins text-white 2xsm:pt-2 2xsm:text-[15px] 2xsm:font-medium md:pr-7 md:text-[14px] lg:text-[14px] lg:font-bold xl:pt-4 xl:text-[21px]">
          Tertibkan & Arsipkan Dokumen Anda{" "}
        </h2>

        <div className="pt-[40px] sm:block md:hidden">
          <div className="rounded-[8px] bg-white p-[15px] shadow-md">
            <div className="font-poppins text-[20px] font-bold leading-none text-[#1D92F9]">
              Masuk ke Manajemen Dokumen
            </div>
            <div className="mt-2 font-inter text-[14px] font-normal leading-none text-[#0C479F]">
              Silahkan masuk untuk melakukan aktifitas anda
            </div>
            <section>
              <form onSubmit={handleSubmitLogin}>
                <input
                  id="mobileUsername"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Masukkan Username..."
                  className="mt-[15px] block w-full rounded-[7px] border-0 px-[15px] py-[15px] font-inter font-normal text-gray-900 shadow-sm ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                />
                <input
                  id="mobilePassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Masukkan Password..."
                  className="mt-[15px] block w-full rounded-[7px] border-0 px-[15px] py-[15px] font-inter font-normal text-gray-900 shadow-sm ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                />
                <div>
                  <div className="mt-[20px] w-full text-right font-poppins text-[14px] text-[#1D92F9] hover:text-[#0C479F]">
                    <Link href={`#`}>Lupa Password?</Link>
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-[5px] w-full rounded-[7px] bg-[#0C479F] py-[10px] font-poppins text-[14px] font-normal text-white shadow-sm hover:bg-[#1775C7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Masuk
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
      <div className="absolute bottom-[0px] left-[0px] z-[1] block overflow-hidden sm:block md:block lg:block lg:w-[98%] xl:block xl:w-[100%]">
        <Image
          className="pointer-events-none relative max-h-full max-w-full select-none object-contain"
          src={Background1}
          alt=""
          priority
        />
      </div>
    </>
  );
};

export default SectionLeft;
