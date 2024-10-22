"use client";
import React, { useState } from "react";
import ElementCombobox from "../elements/ElementCombobox";

const dataJenis = [
  { name: "Banten" },
  { name: "DKJ" },
  { name: "Jabar" },
  { name: "Jateng" },
  { name: "DIY" },
  { name: "JATIM" },
];

const dataSubJenis = [
  { name: "Rembang" },
  { name: "Semarang" },
  { name: "Surakarta" },
  { name: "Pekalongan" },
  { name: "Magelang" },
];

const dataTahun = [
  { name: 2020 },
  { name: 2021 },
  { name: 2022 },
  { name: 2023 },
  { name: 2024 },
  { name: 2025 },
];

const UploadDokumen = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadComplete, setIsUploadComplete] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      setFiles([selectedFile]);
      setUploadProgress([0]);
  
      // Mulai upload secara langsung
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
  
      // Simulate file upload progress
      new Promise((resolve) => {
        const fakeUpload = setInterval(() => {
          setUploadProgress((prev) => {
            const updatedProgress = [...prev];
            updatedProgress[0] += 10; // Simulasi upload progress
            if (updatedProgress[0] >= 100) {
              clearInterval(fakeUpload);
              resolve(true);
            }
            return updatedProgress;
          });
        }, 200); // Simulasi upload setiap 200ms
      }).then(() => {
        setIsUploading(false);
        setIsUploadComplete(true); // Upload selesai
      });
    }
  };
  

  const handleSave = () => {
    // Simpan semua data ke server setelah upload selesai
    if (isUploadComplete) {
      // Simpan data ke server, lakukan operasi penyimpanan disini
      console.log("Data siap disimpan ke server...");
    }
  };

  return (
    <div className="col-span-12 xl:col-span-6">
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <h4 className="mb-5.5 font-medium text-dark dark:text-white">
          Upload dokumenmu sekarang juga
        </h4>
        <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
          <form>
            <div className="p-6.5">
              {/* Nama Dinas */}
              <div className="mb-4.5">
                <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
                  Nama Dinas
                </label>
                <input
                  type="text"
                  placeholder="Masukkan Nama Dinas..."
                  className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark ring-1 ring-inset ring-[#1D92F9] transition placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                  required
                />
              </div>

              <ElementCombobox
                label="Jenis"
                placeholder="Pilih jenis"
                options={dataJenis}
              />
              <ElementCombobox
                label="Sub Jenis"
                placeholder="Pilih sub jenis"
                options={dataSubJenis}
              />
              <ElementCombobox
                label="Tahun"
                placeholder="Pilih tahun"
                options={dataTahun}
              />

              {/* Upload File */}
              <div
                id="FileUpload"
                className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded-xl border border-dashed border-gray-4 bg-gray-2 px-4 py-4 hover:border-[#1D92F9] dark:border-dark-3 dark:bg-dark-2 dark:hover:border-primary sm:py-7.5"
              >
                <input
                  type="file"
                  // multiple
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
                  <h5 className="text-dark dark:text-white">
                    Files selected ({files.length}):
                  </h5>
                  <ul>
                    {files.map((file, index) => (
                      <li key={index} className="my-2">
                        {file.name}
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{
                              width: `${uploadProgress[index]}%`,
                            }}
                          ></div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="button"
                className="flex w-full justify-center rounded-[7px] bg-gradient-to-r from-[#0C479F] to-[#1D92F9] p-[13px] font-medium text-white hover:bg-opacity-90 hover:from-[#0C479F] hover:to-[#0C479F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                onClick={handleSave}
                disabled={isUploading || !isUploadComplete}
              >
                {isUploading
                  ? "Uploading..."
                  : isUploadComplete
                  ? "Simpan Document"
                  : "Menunggu Upload"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadDokumen;
