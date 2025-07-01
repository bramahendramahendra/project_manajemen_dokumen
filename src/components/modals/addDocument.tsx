"use client";
import { useState, useEffect } from "react";
import { FaFileAlt, FaCheckCircle } from "react-icons/fa";
import { HiOutlineXMark } from "react-icons/hi2";

const AddDocument = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) => {
  const [files, setFiles] = useState<{ file: File; name: string; size: string; progress: number }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [allFilesUploaded, setAllFilesUploaded] = useState(false); // Untuk cek semua file sudah 100%

  const [category, setCategory] = useState("");  // State untuk pilihan kategori
  const [documentType, setDocumentType] = useState(""); // State untuk pilihan tipe dokumen

  // Simulasi progress upload langsung saat file dimasukkan
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (uploadedFiles) {
      const fileArray = Array.from(uploadedFiles).map((file) => ({
        file,
        name: file.name,
        size: (file.size / 1024).toFixed(2) + " KB", // Mengubah ukuran file menjadi KB
        progress: 0, // Progress dimulai dari 0%
      }));

      // Gunakan callback di setFiles untuk mendapatkan state sebelumnya
      setFiles((prevFiles) => {
        const newFiles = [...prevFiles, ...fileArray];
        // Mulai simulasi progress upload untuk file baru
        fileArray.forEach((file, index) => simulateUploadProgress(prevFiles.length + index));
        return newFiles;
      });
    }
  };

  // Fungsi simulasi progress
  const simulateUploadProgress = (index: number) => {
    setIsUploading(true);
    const simulateProgress = setInterval(() => {
      setFiles((prevFiles) =>
        prevFiles.map((f, idx) => {
          if (idx === index) {
            const newProgress = Math.min(f.progress + 10, 100); // Simulasi penambahan progress
            return { ...f, progress: newProgress };
          }
          return f;
        })
      );

      if (files[index]?.progress >= 100) {
        clearInterval(simulateProgress); // Menghentikan simulasi jika sudah mencapai 100%
      }
    }, 500);
  };

  // Mengecek jika semua file progress-nya 100%
  useEffect(() => {
    const allUploaded = files.length > 0 && files.every((file) => file.progress === 100);
    setAllFilesUploaded(allUploaded); // Update state untuk tombol "Upload"
  }, [files]);

  // Fungsi untuk menangani upload final dan mencegah refresh
  const handleFinalUpload = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();  // Mencegah refresh otomatis
    // console.log('Files uploaded to the server:', files);
    
    // Lakukan operasi upload ke server di sini, misalnya:
    // fetch('/upload-endpoint', { method: 'POST', body: formData });
    
    onClose(); // Tutup modal setelah upload selesai
    window.location.reload();
  };

  // Jika modal tidak terbuka, jangan render apa pun
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full relative max-h-[90vh] overflow-y-auto"> {/* Tambahan max-height dan overflow */}
        <button
          className="absolute text-[24px] top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <HiOutlineXMark />
        </button>

        {/* Dropdown Kategori */}
        <div className="mb-4 mt-4">
          <label className="block text-sm font-medium text-gray-700">Document</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select Category</option>
            <option value="finance">Finance</option>
            <option value="legal">Legal</option>
            <option value="marketing">Marketing</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Dropdown Tipe Dokumen */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Sub Document</label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select Type</option>
            <option value="report">Report</option>
            <option value="invoice">Invoice</option>
            <option value="contract">Contract</option>
            <option value="memo">Memo</option>
          </select>
        </div>

        <h2 className="text-lg font-semibold mb-4 text-center">Upload your file</h2>

        {/* File Upload Area */}
        <div className="border-2 border-dashed border-blue-500 p-6 text-center cursor-pointer hover:bg-blue-50">
          <label className="cursor-pointer">
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-4 rounded-full">
                <FaFileAlt className="text-blue-500 text-4xl" />
              </div>
              <span className="mt-2 text-blue-500">Browse File to upload</span>
              <input type="file" className="hidden" onChange={handleFileUpload} multiple />
            </div>
          </label>
        </div>

        {/* File Progress and List */}
        {files.length > 0 && (
          <div className="mt-4">
            {files.map((file, index) => (
              <div key={index} className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FaFileAlt className="text-blue-500 text-2xl" />
                    <div>
                      <p className="text-sm font-semibold">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.size}</p>
                    </div>
                  </div>

                  {file.progress === 100 ? (
                    <FaCheckCircle className="text-green-500 text-2xl" />
                  ) : (
                    <span className="text-sm">{file.progress}%</span>
                  )}
                </div>

                {file.progress < 100 && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${file.progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tombol Upload muncul hanya jika semua file selesai (progress 100%) */}
        {allFilesUploaded && (
          <button
            className="mt-4 w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
            onClick={handleFinalUpload} // Fungsi untuk menyimpan file ke server
          >
            Upload
          </button>
        )}
      </div>
    </div>
  );
};

export default AddDocument;
