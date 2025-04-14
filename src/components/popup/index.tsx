"use client";
import { AiOutlineCheckCircle, AiOutlineClose } from "react-icons/ai";

interface ModalPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalPopup: React.FC<ModalPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative max-w-sm rounded-lg bg-white p-6 text-center shadow-lg">
        {/* Tombol silang (X) */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
        >
          <AiOutlineClose size={20} />
        </button>

        {/* Ikon Check */}
        {/* <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-green-100"> */}
        <p>Selamat Datang!</p>
        {/* </div> */}

        {/* Judul Modal */}
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          User Andalanku
        </h3>

        {/* Deskripsi */}
        <p className="mt-2 text-sm text-gray-500">
          Aku hanya memberitahu bahwa saat ini sedang ada <b>Update Sipaduke</b>
          , yaitu
        </p>

        <div>
          <p>asd</p>
        </div>

        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};

export default ModalPopup;
