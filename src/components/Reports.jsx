import React from 'react'

const Reports = () => {
    return (

        <>

            {/* <div class="flex bg-bllue-50 p-4 text-2xl font-medium text-blue-950">Documents</div> */}
            


            <div class="bg-white rounded-md mt-4 flex flex-row flex-wrap gap-1 sm:gap-2 p-4 sm:flex-col ">

            <div class="flex bg-bluve-50 border-b-2 border-violet-800    font-medium text-blue-950 ">
                <span class="p-2 sm:text-lg ">Medical</span>
                <span class="p-2 sm:text-lg ">Access</span>
                <span class="p-2 sm:text-lg ">History</span>
            </div>
                <div class="bgc-slate-400  w-full items-center gap-1 p-2 flex flex-row">
                    <div class="bg-fslate-500 min-w-40 flex justify-center">
                        <div class="flex w-full p-1  justify-cventer">
                            <div class="w-full">
                                <select class="form-select m-0 block w-full appearance-none rounded border border-solid border-gray-300 bg-white bg-clip-padding bg-no-repeat px-3 py-1.5 text-base font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none" aria-label="Default select example">
                                    <option selected>All Reports</option>
                                    <option value="1">One</option>
                                    <option value="2">Two</option>
                                    <option value="3">Three</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="bgs-slate-500 flex justify-center">
                        <div class="relative" id="input">
                            <input
                                value=""
                                placeholder="Search..."
                                class="block w-full text-sm h-10 px-4 text-slate-900 bg-white rounded-[8px] border border-gray-300 appearance-none focus:border-transparent focus:outline focus:outline-2 focus:outline-primary focus:ring-0 hover:border-brand-500-secondary- peer invalid:border-error-500 invalid:focus:border-error-500 overflow-ellipsis overflow-hidden text-nowrap pr-[48px]"
                                id="floating_outlined"
                                type="text"
                            />

                            <div class="absolute top-2 right-3">
                                <i class='bx bx-search bx-sm text-blue-500'></i>
                            </div>
                        </div>

                    </div>
                </div>

                <div class="bgs-slate-400 hidden w-full   items-center gap-1 p-2 sm:flex">
                    <div class="bgs-slate-500 flex basis-1/6 justify-center"><span>Images</span></div>
                    <div class="bgs-slate-500 flex basis-1/6 justify-center"><span>Name</span></div>
                    <div class="bgs-slate-500 flex basis-1/6 justify-center"><span>DocType</span></div>
                    <div class="bgs-slate-500 flex basis-1/6 justify-center"><span>Date</span></div>
                    <div class="bgs-slate-500 flex basis-2/6 justify-center">none</div>
                </div>

                <div class="flex w-full sm:w-1/2 flex-col items-center gap-1 bg-gray-50 shadow-lg p-2 sm:w-full sm:flex-row">
                    <div class="bgs-slate-500 flex basis-1/6 justify-center">
                        <img class="w-64 sm:max-w-20 object-cover sm:w-3/4" src="https://plus.unsplash.com/premium_photo-1661313626999-90d230cabf8d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZG9jdW1lbnRzfGVufDB8fDB8fHww" alt="" />
                    </div>
                    <div class="bgs-slate-500 flex basis-1/6 justify-center"><span class="">Aadhar Card </span></div>
                    <div class="bgs-slate-500 flex basis-1/6 justify-center"><span>PDF</span></div>
                    <div class="bgs-slate-500 flex basis-1/6 justify-center"><span>23/11/1232</span></div>
                    <div class="bgs-slate-500 flex basis-2/6 justify-center  gap-3">
                        <div class="flex">
                            <span><i class="bx  bx-info-square text-blue-800 bg-blue-100 p-1.5"></i></span>
                        </div>
                        <div class="flex">
                            <span><i class="bx bx-bell text-blue-800 bg-blue-100 p-1.5"></i></span>
                        </div>
                        <div class="flex">
                            <span><i class="bx bxs-download text-blue-800 bg-blue-100 p-1.5"></i></span>
                        </div>
                        <div class="flex">
                            <span><i class="bx bx-exit text-blue-800 bg-blue-100 p-1.5"></i></span>
                        </div>
                        <div class="flex">
                            <span><i class="bx bxs-calendar text-red-700 bg-red-300 p-1.5"></i></span>
                        </div>
                    </div>
                </div>

                <div class="flex w-full sm:w-1/2 flex-col items-center gap-1 bg-gray-50 shadow p-2 sm:w-full sm:flex-row">
                    <div class="bgs-slate-500 flex basis-1/6 justify-center">
                        <img class="w-64 sm:max-w-20 object-cover sm:w-3/4" src="https://plus.unsplash.com/premium_photo-1661313626999-90d230cabf8d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZG9jdW1lbnRzfGVufDB8fDB8fHww" alt="" />
                    </div>
                    <div class="bgs-slate-500 flex basis-1/6 justify-center"><span class="">Aadhar Card </span></div>
                    <div class="bgs-slate-500 flex basis-1/6 justify-center"><span>PDF</span></div>
                    <div class="bgs-slate-500 flex basis-1/6 justify-center"><span>23/11/1232</span></div>
                    <div class="bgs-slate-500 flex basis-2/6 justify-center  gap-3">
                        <div class="flex">
                            <span><i class="bx  bx-info-square text-blue-800 bg-blue-100 p-1.5"></i></span>
                        </div>
                        <div class="flex">
                            <span><i class="bx bx-bell text-blue-800 bg-blue-100 p-1.5"></i></span>
                        </div>
                        <div class="flex">
                            <span><i class="bx bxs-download text-blue-800 bg-blue-100 p-1.5"></i></span>
                        </div>
                        <div class="flex">
                            <span><i class="bx bx-exit text-blue-800 bg-blue-100 p-1.5"></i></span>
                        </div>
                        <div class="flex">
                            <span><i class="bx bxs-calendar text-red-700 bg-red-300 p-1.5"></i></span>
                        </div>
                    </div>
                </div>





                <div class="flex w-full sm:w-1/2 flex-col items-center gap-1 bg-gray-50 shadow p-2 sm:w-full sm:flex-row">
                    <div class="bgs-slate-500 flex basis-1/6 justify-center">
                        <img class="w-64 sm:max-w-20 object-cover sm:w-3/4" src="https://plus.unsplash.com/premium_photo-1661313626999-90d230cabf8d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZG9jdW1lbnRzfGVufDB8fDB8fHww" alt="" />
                    </div>
                    <div class="bgs-slate-500 flex basis-1/6 justify-center"><span class="">Aadhar Card </span></div>
                    <div class="bgs-slate-500 flex basis-1/6 justify-center"><span>PDF</span></div>
                    <div class="bgs-slate-500 flex basis-1/6 justify-center"><span>23/11/1232</span></div>
                    <div class="bgs-slate-500 flex basis-2/6 justify-center  gap-3">
                        <div class="flex">
                            <span><i class="bx  bx-info-square text-blue-800 bg-blue-100 p-1.5"></i></span>
                        </div>
                        <div class="flex">
                            <span><i class="bx bx-bell text-blue-800 bg-blue-100 p-1.5"></i></span>
                        </div>
                        <div class="flex">
                            <span><i class="bx bxs-download text-blue-800 bg-blue-100 p-1.5"></i></span>
                        </div>
                        <div class="flex">
                            <span><i class="bx bx-exit text-blue-800 bg-blue-100 p-1.5"></i></span>
                        </div>
                        <div class="flex">
                            <span><i class="bx bxs-calendar text-red-700 bg-red-300 p-1.5"></i></span>
                        </div>
                    </div>
                </div>





                <div class="flex w-full sm:w-1/2 flex-col items-center gap-1 bg-white shadow p-2 sm:w-full sm:flex-row">
                    <div class="bgs-slate-500 flex basis-1/6 justify-center">
                        <img class="w-64 sm:max-w-20 object-cover sm:w-3/4" src="https://plus.unsplash.com/premium_photo-1661313626999-90d230cabf8d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZG9jdW1lbnRzfGVufDB8fDB8fHww" alt="" />
                    </div>
                    <div class="bgs-slate-500 flex basis-1/6 justify-center"><span class="">Aadhar Card </span></div>
                    <div class="bgs-slate-500 flex basis-1/6 justify-center"><span>PDF</span></div>
                    <div class="bgs-slate-500 flex basis-1/6 justify-center"><span>23/11/1232</span></div>
                    <div class="bgs-slate-500 flex basis-2/6 justify-center  gap-3">
                        <div class="flex">
                            <span><i class="bx  bx-info-square text-blue-800 bg-blue-100 p-1.5"></i></span>
                        </div>
                        <div class="flex">
                            <span><i class="bx bx-bell text-blue-800 bg-blue-100 p-1.5"></i></span>
                        </div>
                        <div class="flex">
                            <span><i class="bx bxs-download text-blue-800 bg-blue-100 p-1.5"></i></span>
                        </div>
                        <div class="flex">
                            <span><i class="bx bx-exit text-blue-800 bg-blue-100 p-1.5"></i></span>
                        </div>
                        <div class="flex">
                            <span><i class="bx bxs-calendar text-red-700 bg-red-300 p-1.5"></i></span>
                        </div>
                    </div>
                </div>




                <div class="flex w-full sm:w-1/2 flex-col items-center gap-1 bg-white shadow p-2 sm:w-full sm:flex-row">
                    <div class="bgs-slate-500 flex basis-1/6 justify-center">
                        <img class="w-64 sm:max-w-20 object-cover sm:w-3/4" src="https://plus.unsplash.com/premium_photo-1661313626999-90d230cabf8d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZG9jdW1lbnRzfGVufDB8fDB8fHww" alt="" />
                    </div>
                    <div class="bgs-slate-500 flex basis-1/6 justify-center"><span class="">Aadhar Card </span></div>
                    <div class="bgs-slate-500 flex basis-1/6 justify-center"><span>PDF</span></div>
                    <div class="bgs-slate-500 flex basis-1/6 justify-center"><span>23/11/1232</span></div>
                    <div class="bgs-slate-500 flex basis-2/6 justify-center  gap-3">
                        <div class="flex">
                            <span><i class="bx  bx-info-square text-blue-800 bg-blue-100 p-1.5"></i></span>
                        </div>
                        <div class="flex">
                            <span><i class="bx bx-bell text-blue-800 bg-blue-100 p-1.5"></i></span>
                        </div>
                        <div class="flex">
                            <span><i class="bx bxs-download text-blue-800 bg-blue-100 p-1.5"></i></span>
                        </div>
                        <div class="flex">
                            <span><i class="bx bx-exit text-blue-800 bg-blue-100 p-1.5"></i></span>
                        </div>
                        <div class="flex">
                            <span><i class="bx bxs-calendar text-red-700 bg-red-300 p-1.5"></i></span>
                        </div>
                    </div>
                </div>


            </div>
        </>


    )
}

export default Reports