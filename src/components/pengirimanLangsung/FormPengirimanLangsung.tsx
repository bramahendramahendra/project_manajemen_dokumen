import React, { useState, ChangeEvent } from "react";
import Image from "next/image";
import SuccessModal from "../modals/successModal";

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

const FormPengirimanLangsung = () => {
  const [searchTerm, setSearchTerm] = useState<string>(""); // Untuk pencarian
  const [showAll, setShowAll] = useState<boolean>(false); // Untuk mengatur apakah semua data ditampilkan
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]); // Dokumen yang dipilih
  const [namaDinas, setNamaDinas] = useState<string>(""); // Nama dinas
  const [judul, setJudul] = useState<string>(""); // Judul
  const [lampiran, setLampiran] = useState<string>(""); // Lampiran
  const [loading, setLoading] = useState<boolean>(false); // State loading
  
  // State untuk file upload
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [tempFilePaths, setTempFilePaths] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isUploadComplete, setIsUploadComplete] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  
  // State untuk SuccessModal
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);

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
  
  // Handle file change untuk upload
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files);
      setFiles(fileList);
      
      // Inisialisasi progress untuk setiap file
      setUploadProgress(fileList.map(() => 0));
      
      // Simulasi upload
      simulateFileUpload(fileList);
    }
  };
  
  // Simulasi upload file
  const simulateFileUpload = (fileList: File[]) => {
    setIsUploading(true);
    setError("");
    
    // Simulasi progressbar untuk masing-masing file
    fileList.forEach((_, index) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 1;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // Periksa jika semua file sudah 100%
          setUploadProgress(prev => {
            const newProgress = [...prev];
            newProgress[index] = progress;
            
            // Jika semua sudah 100%
            if (newProgress.every(p => p === 100)) {
              setIsUploading(false);
              setIsUploadComplete(true);
              setSuccess(true);
              
              // Simulasi path file yang diupload
              setTempFilePaths(fileList.map(file => `/uploads/${file.name}`));
            }
            
            return newProgress;
          });
        } else {
          setUploadProgress(prev => {
            const newProgress = [...prev];
            newProgress[index] = progress;
            return newProgress;
          });
        }
      }, 200);
    });
  };
  
  // Handle remove file
  const handleRemoveFile = () => {
    setFiles([]);
    setUploadProgress([]);
    setTempFilePaths([]);
    setIsUploadComplete(false);
    setSuccess(false);
  };
  
  // Handle pengiriman dokumen
  const handleSubmit = async () => {
    // Validasi form
    if (!namaDinas) {
      setError("Nama Dinas harus diisi");
      return;
    }
    
    if (!judul) {
      setError("Judul harus diisi");
      return;
    }
    
    // Hapus validasi dokumen yang wajib dipilih, sekarang opsional
    // Tetapi berikan peringatan jika tidak ada dokumen atau file yang dipilih
    if (selectedDocuments.length === 0 && files.length === 0) {
      // Masih diizinkan untuk submit, tapi ada peringatan
      if (!confirm("Anda belum memilih dokumen atau mengupload file. Tetap lanjutkan?")) {
        return;
      }
    }
    
    // Reset error
    setError("");
    
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
      //   lampiran: lampiran,
      //   files: tempFilePaths // Path file yang sudah diupload
      // });
      
      // if (!response.ok) {
      //   throw new Error("Gagal mengirim dokumen");
      // }
      
      // Jika berhasil, tampilkan modal sukses
      setSuccess(true);
      setIsSuccessModalOpen(true);
      
    } catch (error) {
      // Handle error
      console.error("Error sending documents:", error);
      setError("Terjadi kesalahan saat mengirim dokumen. Silakan coba lagi.");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };
  
  // Fungsi untuk menutup modal
  const handleCloseModal = () => {
    setIsSuccessModalOpen(false);
  };
  
  // Fungsi untuk menangani klik pada tombol di modal
  const handleSuccessButtonClick = () => {
    setIsSuccessModalOpen(false);
    
    // Reset form setelah berhasil
    setNamaDinas("");
    setJudul("");
    setLampiran("");
    setSelectedDocuments([]);
    setFiles([]);
    setUploadProgress([]);
    setTempFilePaths([]);
    setIsUploadComplete(false);
    setSuccess(false);
    
    // Opsional: redirect ke halaman lain
    // window.location.href = "/dokumen/daftar";
  };

  return (
    <>
      <div className="col-span-12 xl:col-span-12">
        <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <h4 className="mb-5.5 font-medium text-dark dark:text-white">
            Pengiriman dokumen secara langsung pada Dinas
          </h4>
          <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              <div className="grid grid-cols-12 gap-6 p-6.5">
                {/* Kolom Kiri */}
                <div className="col-span-12 lg:col-span-6">
                  {/* Kepada Dinas */}
                  <div className="mb-4.5">
                    <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                      Kepada Dinas
                    </label>
                    <input
                      type="text"
                      value={namaDinas}
                      onChange={(e) => setNamaDinas(e.target.value)}
                      placeholder="Masukkan Nama Dinas..."
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
                      value={judul}
                      onChange={(e) => setJudul(e.target.value)}
                      placeholder="Masukkan Nama Judul..."
                      className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark ring-1 ring-inset ring-[#1D92F9] transition placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                      required
                    />
                  </div>

                  <div className="mb-4.5">
                    <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                      Dokumen Yang Dipilih
                      <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">(opsional)</span>
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
                      value={lampiran}
                      onChange={(e) => setLampiran(e.target.value)}
                      placeholder="Isi Lampiran..."
                      className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark ring-1 ring-inset ring-[#1D92F9] transition placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                    ></textarea>
                  </div>
                  
                  {/* File Upload (Opsional) */}
                  <div className="mb-4.5">
                    <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                      Upload File (opsional)
                    </label>
                    
                    <div
                      id="FileUpload"
                      className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded-xl border border-dashed border-gray-4 bg-gray-2 px-4 py-4 hover:border-[#1D92F9] dark:border-dark-3 dark:bg-dark-2 dark:hover:border-primary sm:py-7.5"
                    >
                      <input
                        type="file"
                        multiple
                        name="profilePhoto"
                        id="profilePhoto"
                        accept="image/png, image/jpg, image/jpeg"
                        className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
                        onChange={handleFileChange}
                      />
                      <div className="flex flex-col items-center justify-center">
                        <span className="flex h-13.5 w-13.5 items-center justify-center rounded-full border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10.4613 2.07827C10.3429 1.94876 10.1755 1.875 10 1.875C9.82453 1.875 9.65714 1.94876 9.53873 2.07827L6.2054 5.7241C5.97248 5.97885 5.99019 6.37419 6.24494 6.6071C6.49969 6.84002 6.89502 6.82232 7.12794 6.56756L9.375 4.10984V13.3333C9.375 13.6785 9.65482 13.9583 10 13.9583C10.3452 13.9583 10.625 13.6785 10.625 13.3333V4.10984L12.8721 6.56756C13.105 6.82232 13.5003 6.84002 13.7551 6.6071C14.0098 6.37419 14.0275 5.97885 13.7946 5.7241L10.4613 2.07827Z"
                              fill="#1D92F9"
                            />
                            <path
                              d="M3.125 12.5C3.125 12.1548 2.84518 11.875 2.5 11.875C2.15482 11.875 1.875 12.1548 1.875 12.5V12.5457C1.87498 13.6854 1.87497 14.604 1.9721 15.3265C2.07295 16.0765 2.2887 16.7081 2.79029 17.2097C3.29189 17.7113 3.92345 17.9271 4.67354 18.0279C5.39602 18.125 6.31462 18.125 7.45428 18.125H12.5457C13.6854 18.125 14.604 18.125 15.3265 18.0279C16.0766 17.9271 16.7081 17.7113 17.2097 17.2097C17.7113 16.7081 17.9271 16.0765 18.0279 15.3265C18.125 14.604 18.125 13.6854 18.125 12.5457V12.5C18.125 12.1548 17.8452 11.875 17.5 11.875C17.1548 11.875 16.875 12.1548 16.875 12.5C16.875 13.6962 16.8737 14.5304 16.789 15.1599C16.7068 15.7714 16.5565 16.0952 16.3258 16.3258C16.0952 16.5565 15.7714 16.7068 15.1599 16.789C14.5304 16.8737 13.6962 16.875 12.5 16.875H7.5C6.30382 16.875 5.46956 16.8737 4.8401 16.789C4.22862 16.7068 3.90481 16.5565 3.67418 16.3258C3.44354 16.0952 3.29317 15.7714 3.21096 15.1599C3.12633 14.5304 3.125 13.6962 3.125 12.5Z"
                              fill="#1D92F9"
                            />
                          </svg>
                        </span>
                        <p className="mt-2.5 text-body-sm font-medium">
                          <span className="text-[#1D92F9]">Click to upload</span> or
                          drag and drop
                        </p>
                        <p className="mt-1 text-body-xs">
                          SVG, PNG, JPG or GIF (max, 800 X 800px)
                        </p>
                      </div>
                    </div>

                    {files.length > 0 && (
                      <div className="mt-4">
                        <h5 className="mb-3 font-semibold text-dark dark:text-white">
                          File Terpilih
                        </h5>
                        {files.map((file, index) => {
                          const isImage = file.type.startsWith("image/");
                          const percent = uploadProgress[index];

                          return (
                            <div
                              key={index}
                              className="relative flex items-center gap-4 rounded-md border bg-white p-3 shadow-sm dark:bg-dark-2"
                            >
                              {isImage && (
                                <Image
                                  src={URL.createObjectURL(file)}
                                  alt="preview"
                                  width={48}
                                  height={48}
                                  className="rounded-md border object-cover"
                                />
                              )}

                              <div className="flex-1 overflow-hidden">
                                <div className="mb-1 flex items-center justify-between">
                                  <span className="max-w-[80%] truncate text-sm font-medium">
                                    📄 {file.name}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {percent}%
                                  </span>
                                </div>
                                <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                  <div
                                    className={`h-2.5 rounded-full transition-all duration-300 ${
                                      percent === 100 ? "bg-green-500" : "bg-blue-600"
                                    }`}
                                    style={{ width: `${percent}%` }}
                                  ></div>
                                </div>
                              </div>

                              {/* Cancel Button */}
                              {!isUploadComplete && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFiles([]);
                                    setUploadProgress([]);
                                    setTempFilePaths([]);
                                    setIsUploading(false);
                                    setIsUploadComplete(false);
                                  }}
                                  className="ml-2 text-sm text-red-500 hover:text-red-700"
                                  title="Batalkan Upload"
                                >
                                  ✖
                                </button>
                              )}

                              {/* Tombol Hapus setelah upload selesai */}
                              {isUploadComplete && (
                                <button
                                  type="button"
                                  onClick={handleRemoveFile}
                                  className="mt-1 flex-shrink-0 text-sm text-red-500 hover:text-red-700"
                                  title="Hapus File"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Pesan Error/Success */}
                    {error && <p className="mt-2 text-red-500">{error}</p>}
                    {success && (
                      <p className="mt-2 text-green-500">
                        Upload Dokumen berhasil ditambahkan!
                      </p>
                    )}
                  </div>

                  {/* Tombol Kirim */}
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={loading || isUploading}
                      className="flex w-full justify-center rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] p-[13px] font-medium text-white hover:bg-opacity-90 hover:from-[#0C479F] hover:to-[#0C479F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70"
                    >
                      {loading ? "Mengirim..." : isUploading ? "Menunggu Upload..." : "Kirim"}
                    </button>
                  </div>
                </div>

                {/* Kolom Kanan */}
                <div className="col-span-12 lg:col-span-6">
                  <div className="mb-4.5">
                    <div className="flex items-center justify-between">
                      <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                        Dokumen
                        <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">(opsional)</span>
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
        onClose={handleCloseModal}
        title="Berhasil!"
        message="Dokumen berhasil dikirim ke Dinas."
        buttonText="Kembali ke Daftar Dokumen"
        onButtonClick={handleSuccessButtonClick}
      />
    </>
  );
};

export default FormPengirimanLangsung;