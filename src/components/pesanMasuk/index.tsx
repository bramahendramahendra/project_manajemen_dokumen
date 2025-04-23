"use client";
import React, { useState } from "react";
import { MessageList } from "./messageList";
import { MessageDetail } from "./messageDetails";
import Pagination from "../pagination/Pagination";

const dummyMessages = [
  {
    id: 1,
    sender: "John Doe",
    date: "2024-06-17",
    subject: "Meeting Reminder",
    content: "Don’t forget about the meeting tomorrow at 10 AM.",
  },
  {
    id: 2,
    sender: "Jane Smith",
    date: "2024-06-18",
    subject: "Project Update",
    content: "The project is progressing well and will be delivered on time.",
  },
  {
    id: 3,
    sender: "Mark Lee",
    date: "2024-06-19",
    subject: "Invoice Due",
    content: "Please find the attached invoice. Payment is due by Friday.",
  },
  {
    id: 4,
    sender: "Emily Clark",
    date: "2024-06-20",
    subject: "Team Outing",
    content: "We’re planning a team outing next month. Details to follow soon.",
  },
  {
    id: 5,
    sender: "Michael Brown",
    date: "2024-06-21",
    subject: "Weekly Report",
    content: "Please submit your weekly report by end of day Friday.",
  },
  {
    id: 6,
    sender: "Sarah Johnson",
    date: "2024-06-22",
    subject: "HR Announcement",
    content: "Please review the updated company policies in the HR portal.",
  },
  {
    id: 7,
    sender: "David Kim",
    date: "2024-06-23",
    subject: "Conference Invitation",
    content: "You’re invited to speak at the upcoming tech conference.",
  },
  {
    id: 8,
    sender: "Olivia White",
    date: "2024-06-24",
    subject: "Task Completion",
    content: "The assigned tasks have been completed ahead of schedule.",
  },
  {
    id: 9,
    sender: "Chris Wilson",
    date: "2024-06-25",
    subject: "Follow-Up Required",
    content: "We need your input on the pending project decisions.",
  },
  {
    id: 10,
    sender: "Sophia Martinez",
    date: "2024-06-26",
    subject: "Vacation Approval",
    content: "Your vacation request has been approved for the selected dates.",
  },
];

const MainPage = () => {
  const [activeMessage, setActiveMessage] = useState(dummyMessages[0]); // Default message aktif
  const [currentPage, setCurrentPage] = useState(1); // State untuk halaman saat ini
  const [itemsPerPage, setItemsPerPage] = useState(10); // State untuk jumlah item per halaman
  const totalPages = Math.ceil(dummyMessages.length / itemsPerPage); // Total halaman

  // Pesan yang ditampilkan berdasarkan halaman dan jumlah item per halaman
  const paginatedMessages = dummyMessages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="col-span-12 xl:col-span-12">
      {/* <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card"> */}
      <div className="rounded-[10px] bg-white pr-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <h4 className="mb-5.5 font-medium text-dark dark:text-white"></h4>
        <div className="grid grid-cols-12">
          {/* Daftar Pesan */}
          {/* <div className="col-span-12 xl:col-span-6 border-r border-gray-200"> */}
          <div className="col-span-12 border-r border-gray-200 xl:col-span-2">
            <MessageList
              messages={paginatedMessages}
              activeMessage={activeMessage}
              onMessageSelect={setActiveMessage}
            />
          </div>

          {/* Detail Pesan */}
          <div className="col-span-12 xl:col-span-6">
            <MessageDetail message={activeMessage} />
          </div>
        </div>
        
        <div className="my-4 border-t pb-4 pl-7.5">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      </div>
    </div>
  );
};

export default MainPage;
