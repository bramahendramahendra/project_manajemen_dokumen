import React, { useState } from "react";
import SuccessModal from "../modals/successModal";

// Modal untuk error message
interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl max-w-md w-full mx-4 overflow-hidden shadow-xl">
        <div className="flex flex-col items-center px-6 pt-8 pb-6 text-center">
          {/* Icon container with red background */}
          <div className="relative mb-6">
            {/* Background circular gradient */}
            <div className="absolute inset-0 bg-red-500 rounded-full opacity-20"></div>
            
            {/* Small dots around the circle */}
            <div className="absolute w-2 h-2 bg-red-500 rounded-full -top-1 left-1/2 -translate-x-1/2"></div>
            <div className="absolute w-2 h-2 bg-red-500 rounded-full top-1/4 -right-1"></div>
            <div className="absolute w-2 h-2 bg-red-500 rounded-full -bottom-1 left-1/2 -translate-x-1/2"></div>
            <div className="absolute w-2 h-2 bg-red-500 rounded-full top-1/4 -left-1"></div>
            
            {/* Main circle with X mark */}
            <div className="w-16 h-16 flex items-center justify-center bg-red-500 rounded-full relative z-10">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-white" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={3} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </div>
          </div>
          
          {/* Title */}
          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            {title}
          </h2>
          
          {/* Message */}
          <p className="text-gray-600 text-lg mb-8">
            {message}
          </p>
          
          {/* Small dot indicator */}
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mb-6"></div>
          
          {/* Button */}
          <button
            onClick={onClose}
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white text-xl font-medium rounded-xl transition-colors"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};

const people = [
  { id: 1, name: "DPA" },
  { id: 2, name: "RKA" },
  { id: 3, name: "Anggaran Kas" },
  { id: 4, name: "Laporan Tahunan" },
  { id: 5, name: "Budget Proposal" },
  { id: 6, name: "DPA" },
  { id: 7, name: "RKA" },
  { id: 8, name: "Anggaran Kas" },
  { id: 9, name: "Laporan Tahunan" },
  { id: 10, name: "Budget Proposal" },
  { id: 11, name: "Dokumen Ekstra" },
  { id: 12, name: "Anggaran Baru" },
];

const FormPengirimanLangsungAdmin = () => {
  const [searchTerm, setSearchTerm] = useState<string>(""); // Untuk pencarian
  const [showAll, setShowAll] = useState<boolean>(false); // Untuk mengatur apakah semua data ditampilkan
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]); // Dokumen yang dipilih
  const [namaDinas, setNamaDinas] = useState<string>(""); // Nama dinas
  const [judul, setJudul] = useState<string>(""); // Judul
  const [lampiran, setLampiran] = useState<string>(""); // Lampiran
  const [loading, setLoading] = useState<boolean>(false); // State loading
  
  // State untuk menampilkan SuccessModal
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  
  // State untuk menampilkan ErrorModal
  const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false);
  const [errorTitle, setErrorTitle] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Filter dokumen berdasarkan pencarian
  const filteredPeople = people.filter((person) =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Tentukan jumlah data yang ditampilkan
  const displayedPeople = showAll
    ? filteredPeople
    : filteredPeople.slice(0, 10);

  // Handle perubahan checkbox
  const handleCheckboxChange = (personName: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedDocuments((prev) => [...prev, personName]);
    } else {
      setSelectedDocuments((prev) => prev.filter((doc) => doc !== personName));
    }
  };

  // Handle hapus dokumen
  const handleRemoveDocument = (personName: string) => {
    setSelectedDocuments((prev) => prev.filter((doc) => doc !== personName));
  };
  
  // Fungsi untuk menampilkan error modal
  const showErrorModal = (title: string, message: string) => {
    setErrorTitle(title);
    setErrorMessage(message);
    setIsErrorModalOpen(true);
  };
  
  // Handle pengiriman form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi form dengan modal error
    if (!namaDinas) {
      showErrorModal("Validasi Gagal", "Nama Admin harus diisi");
      return;
    }
    
    if (!judul) {
      showErrorModal("Validasi Gagal", "Judul harus diisi");
      return;
    }
    
    if (selectedDocuments.length === 0) {
      showErrorModal("Validasi Gagal", "Pilih minimal 1 dokumen");
      return;
    }
    
    // Set loading
    setLoading(true);
    
    try {
      // Simulasi API call (ganti dengan API call sebenarnya)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Di sini Anda bisa melakukan API call untuk mengirim data
      // const response = await apiRequest("/send-documents", "POST", {
      //   kepada: namaDinas,
      //   judul: judul,
      //   dokumen: selectedDocuments,
      //   lampiran: lampiran
      // });
      
      // if (!response.ok) {
      //   throw new Error("Gagal mengirim dokumen");
      // }
      
      // Jika berhasil, tampilkan modal sukses
      setIsSuccessModalOpen(true);
      
      // Reset form dilakukan setelah user mengklik tombol di modal sukses
      
    } catch (error) {
      // Handle error dengan modal
      console.error("Error sending documents:", error);
      showErrorModal(
        "Pengiriman Gagal", 
        "Terjadi kesalahan saat mengirim dokumen. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Fungsi untuk menutup modal
  const handleCloseErrorModal = () => {
    setIsErrorModalOpen(false);
  };
  
  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
  };
  
  // Fungsi untuk menangani klik pada tombol di modal sukses
  const handleSuccessButtonClick = () => {
    setIsSuccessModalOpen(false);
    
    // Reset form setelah berhasil
    setNamaDinas("");
    setJudul("");
    setLampiran("");
    setSelectedDocuments([]);
    setSearchTerm("");
    
    // Opsional: redirect ke halaman lain
    // window.location.href = "/dokumen/daftar";
  };

  return (
    <>
      <div className="col-span-12 xl:col-span-12">
        <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <h4 className="mb-5.5 font-medium text-dark dark:text-white">
            Pengiriman dokumen secara langsung pada Admin
          </h4>
          <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
            <form onSubmit={handleSubmitForm}>
              <div className="grid grid-cols-12 gap-6 p-6.5">
                {/* Kolom Kiri */}
                <div className="col-span-12 lg:col-span-6">
                  {/* Kepada Dinas */}
                  <div className="mb-4.5">
                    <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                      Kepada Admin
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan Nama Dinas..."
                      value={namaDinas}
                      onChange={(e) => setNamaDinas(e.target.value)}
                      className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark ring-1 ring-inset ring-[#1D92F9] transition placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                      required
                    />
                  </div>

                  {/* Judul */}
                  <div className="mb-4.5">
                    <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                      Judul
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan Nama Judul..."
                      value={judul}
                      onChange={(e) => setJudul(e.target.value)}
                      className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark ring-1 ring-inset ring-[#1D92F9] transition placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                      required
                    />
                  </div>

                  <div className="mb-4.5">
                    <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                      Dokumen Yang Dipilih
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedDocuments.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 rounded-md bg-gray-100 px-3 py-2 shadow-sm dark:bg-gray-700"
                        >
                          <span className="text-sm text-gray-700 dark:text-white">
                            {doc}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDocument(doc)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              className="h-4 w-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                      {selectedDocuments.length === 0 && (
                        <span className="text-gray-500 dark:text-gray-400">
                          Belum ada dokumen yang dipilih.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Lampiran */}
                  <div className="mb-4.5">
                    <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                      Lampiran (opsional)
                    </label>
                    <textarea
                      rows={6}
                      placeholder="Isi Lampiran..."
                      value={lampiran}
                      onChange={(e) => setLampiran(e.target.value)}
                      className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark ring-1 ring-inset ring-[#1D92F9] transition placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                    ></textarea>
                  </div>

                  {/* Tombol Kirim */}
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex w-full justify-center rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] p-[13px] font-medium text-white hover:bg-opacity-90 hover:from-[#0C479F] hover:to-[#0C479F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70"
                    >
                      {loading ? "Mengirim..." : "Kirim"}
                    </button>
                  </div>
                </div>

                {/* Kolom Kanan */}
                <div className="col-span-12 lg:col-span-6">
                  <div className="mb-4.5">
                    <div className="flex items-center justify-between">
                      <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                        Dokumen
                      </label>
                      {/* Input Pencarian */}
                      <input
                        type="text"
                        placeholder="Cari dokumen..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-[200px] rounded-[7px] bg-transparent px-5 py-2 text-dark ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                      />
                    </div>
                    <fieldset>
                      <div className="mt-4 divide-y divide-gray-200 border-b border-t border-gray-200">
                        {displayedPeople.map((person) => (
                          <div
                            key={person.id}
                            className="relative flex items-start py-4"
                          >
                            <div className="min-w-0 flex-1 text-[12px]">
                              <label
                                htmlFor={`person-${person.id}`}
                                className="select-none font-medium text-gray-500"
                              >
                                {person.name}
                              </label>
                            </div>
                            <div className="ml-3 flex h-6 items-center">
                              <input
                                id={`person-${person.id}`}
                                name={`person-${person.id}`}
                                type="checkbox"
                                checked={selectedDocuments.includes(
                                  person.name,
                                )}
                                onChange={(e) =>
                                  handleCheckboxChange(
                                    person.name,
                                    e.target.checked,
                                  )
                                }
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                              />
                            </div>
                          </div>
                        ))}
                        {filteredPeople.length > 10 && !showAll && (
                          <div className="py-4 text-center">
                            <button
                              type="button"
                              onClick={() => setShowAll(true)}
                              className="text-[#0C479F] hover:underline"
                            >
                              Lihat Semua Dokumen
                            </button>
                          </div>
                        )}
                      </div>
                    </fieldset>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* SuccessModal Component */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleCloseSuccessModal}
        title="Berhasil!"
        message="Dokumen berhasil dikirim ke Admin."
        buttonText="Kembali ke Daftar Dokumen"
        onButtonClick={handleSuccessButtonClick}
      />
      
      {/* ErrorModal Component */}
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={handleCloseErrorModal}
        title={errorTitle}
        message={errorMessage}
      />
    </>
  );
};

export default FormPengirimanLangsungAdmin;