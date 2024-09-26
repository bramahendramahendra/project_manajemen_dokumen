import Image from "next/image";
import { HiMiniUserGroup } from "react-icons/hi2";
import { HiMiniUserMinus } from "react-icons/hi2";
import { HiMiniUserPlus } from "react-icons/hi2";

const UserStats = () => {
    return (
        <div className="rounded-[10px] bg-[#041530] px-7.5 pb-4 pt-7.5 shadow-lg dark:bg-gray-dark dark:shadow-card">
            <h4 className="mb-5.5 text-body-2xlg font-bold text-white dark:text-white">
                User Stats
            </h4>
            <div className="flex flex-col">
                <div className="grid grid-cols-3 sm:grid-cols-3">
                    <div className="flex flex-col md:flex-row pb-3.5">
                        <div className="grid items-center justify-center self-start rounded-[7px] md:text-[36px] text-[25px] p-2 text-white bg-[#1D92F9] font-medium uppercase">
                            <HiMiniUserGroup />
                        </div>
                        <div className="capitalize px-0 md:px-3 pb-2">
                            <div className="text-[13px] md:text-[14px] text-gray-5 font-normal">Total User</div>
                            <div className="text-[24px] md:text-[30px] pt-0 md:pt-1 text-white font-medium">45</div>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row pb-3.5">
                        <div className="flex items-center justify-center self-start rounded-[7px] md:text-[36px] text-[25px] p-2 text-white bg-green-500 font-medium uppercase">
                            <HiMiniUserPlus />
                        </div>
                        <div className="capitalize px-0 md:px-3 pb-2">
                            <div className="text-[13px] md:text-[14px] text-gray-5 font-normal">Active User</div>
                            <div className="text-[24px] md:text-[30px] pt-0 md:pt-1 text-white font-medium">30</div>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row pb-3.5">
                        <div className="flex items-center justify-center self-start rounded-[7px] md:text-[36px] text-[25px] p-2 text-white bg-red-500 font-medium uppercase">
                            <HiMiniUserMinus />
                        </div>
                        <div className="capitalize px-0 md:px-3 pb-2">
                            <div className="text-[13px] md:text-[14px] text-gray-5 font-normal">Inactive User</div>
                            <div className="text-[24px] md:text-[30px] pt-0 md:pt-1 text-white font-medium">10</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default UserStats;