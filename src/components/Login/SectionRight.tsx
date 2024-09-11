import Image from "next/image";
import Background1 from "../../../public/assets/manajement-dokumen-login-4.svg";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SectionRight = () => {
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
      <div className="block sm:hidden md:block">
        <div className="relative z-[2] mt-[250px] md:mt-[220px] md:px-12 lg:mt-[230px] lg:px-[100px] xl:mt-[250px] xl:px-[120px] 2xl:px-[200px]">
          <div className="font-poppins font-semibold text-[#1D92F9] md:text-[23px] lg:text-[24px] xl:text-[28px]">
            Masuk ke Manajemen Dokumen
          </div>
          <div className="pt-1 leading-normal font-inter font-normal text-[#0C479F] md:text-[13px] lg:text-[14px] xl:text-[14px]">
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
                className="mt-[15px] block w-full rounded-[7px] border-0 px-[30px] py-[17px] font-inter font-normal text-gray-900 shadow-sm ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 md:text-[15px] lg:text-[16px]"
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
              <div>
                <span className="float-right mt-[20px] font-poppins text-[#1D92F9] hover:text-[#0C479F] md:text-[15px] lg:text-[16px]">
                  <Link href={`#`}>Lupa Password?</Link>
                </span>
              </div>

              <button
                type="submit"
                className="w-full font-poppins mt-[5px] rounded-[7px] bg-[#0C479F]  lg:py-[18px] md:py-[16px] xl:text-[20px] lg:text-[18px] font-normal text-white shadow-sm hover:bg-[#1775C7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Masuk
              </button>
            </form>
          </section>
        </div>

        <div className="margin absolute right-0 top-0 z-[1] overflow-hidden">
          <Image
            className="pointer-events-none relative top-0 max-h-full max-w-full select-none object-cover md:right-[-50px] md:top-[-60px] lg:right-[-10px] lg:top-[-50px]"
            src={Background1}
            alt=""
            priority
          />
        </div>
      </div>
    </>
  );
};

export default SectionRight;