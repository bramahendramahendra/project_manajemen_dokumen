import Image from "next/image";
import Background1 from "../../../public/assets/manajement-dokumen-login-4.svg";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { lupaPassRequest } from "@/helpers/apiClient";

const SectionLupaPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const [username, setUsername] = useState<string>("");
  // const [password, setPassword] = useState<string>("");
  const router = useRouter();

  const handleSubmitLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await lupaPassRequest(`/auths/lupa-pass/${username}`, 'PUT');

      if (response.ok) {
        setSuccess(true);

        setUsername('');
      } else {
        const result = await response.json();
        setError(result.message || 'Terjadi kesalahan saat menambahkan user');
      }
    } catch (error: any) {
      setError(error.message || 'Terjadi kesalahan saat mengirim data');
    } finally {
      setLoading(false);
    }

    // router.push("/login");

    // console.log({ username, password });
  };

  return (
    <>
      <div className="block sm:hidden md:block">
        <div className="relative z-[2] mt-[250px] md:mt-[220px] md:px-12 lg:mt-[230px] lg:px-[100px] xl:mt-[250px] xl:px-[120px] 2xl:px-[200px]">
          <div className="font-poppins font-semibold text-[#1D92F9] md:text-[23px] lg:text-[24px] xl:text-[28px]">
            Jika Lupa Password Sipaduke
          </div>
          <div className="pt-1 font-inter font-normal leading-normal text-[#0C479F] md:text-[13px] lg:text-[14px] xl:text-[14px]">
            Silahkan inputkan Username anda
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

              <button
                type="submit"
                className="mt-[10px] w-full rounded-[7px] bg-[#0C479F] font-poppins font-normal text-white shadow-sm hover:bg-[#1775C7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 md:py-[16px] lg:py-[16px] lg:text-[16px] xl:text-[16px]"
              >
                {loading ? 'Melaporkan...' : 'Lapor Admin'}
              </button>

              {/* Error and Success Messages */}
              {error && <p className="text-red-500 mt-2">{error}</p>}
              {success && <p className="text-green-500 mt-2">Berhasil melaporkan ke Admin!</p>}  
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

export default SectionLupaPassword;