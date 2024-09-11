import Image from "next/image";
import Background1 from '../../../public/assets/login-left2.svg';
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
      <div className="relative mt-[100px] lg:mx-[58px] z-[2] md:mx-[30px] 2xsm:mx-[32px]">
        <h1 className="font-poppins font-bold text-[42px] xl:text-[42px] text-white leading-[15px] 2xsm:text-[28px] ">Manajemen Dokumen<span className="font-poppins text-[#1D92F9] text-[72px] ml-1">.</span></h1>
        <h2 className="font-poppins lg:font-bold xl:text-[21px] xl:pt-4 lg:text-[14px]  md:text-[14px] md:pr-7 text-white pt-4 2xsm:text-[15px] 2xsm:pt-2 2xsm:font-medium">Tertibkan & Arsipkan Dokumen Anda </h2>

        <div className="sm:block md:hidden pt-[40px]">
          <div className="bg-white p-[15px] rounded-[8px] shadow-md">
            <div className="font-poppins leading-none font-bold text-[#1D92F9] text-[20px]">
              Masuk ke Manajemen Dokumen
            </div>
            <div className="mt-2 leading-none font-inter font-normal text-[#0C479F] text-[14px]">
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
                  <div className="w-full text-right text-[14px] mt-[20px] font-poppins text-[#1D92F9] hover:text-[#0C479F]">
                    <Link href={`#`}>Lupa Password?</Link>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full font-poppins mt-[5px] rounded-[7px] bg-[#0C479F]  py-[10px] text-[14px] font-normal text-white shadow-sm hover:bg-[#1775C7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Masuk
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
      <div className="absolute bottom-[0px] left-[0px] z-[1] block sm:block md:block lg:block lg:w-[98%] xl:block xl:w-[100%] overflow-hidden">
        <Image
          className="relative pointer-events-none select-none object-contain max-w-full max-h-full"
          src={Background1}
          alt=""
          priority
        />
      </div>
      
    </>
  );
};

export default SectionLeft;
