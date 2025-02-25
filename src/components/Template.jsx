import React from 'react'
import { Navbar } from './navbar/Navbar'
const Template = () => {
    return (
        <>
            <div className="flex flex-col justify-between md:flex-row">
                <Navbar className="basis-1/6"></Navbar>

                <div className=" basis-5/6 bg-blue-50">
                    <div class="h-screen w-full bg-indigo-100">


                        <div class="mx-auto flex h-[96%] max-w-screen-lg bg-blue-50">
                            <div class="m-2 flex w-full flex-col bg-blue-50 p-2">



                                <div class="heading bg-white">
                                    <span class="mx-2 text-2xl font-semibold text-violet-800">
                                        Dashboard
                                    </span>
                                </div>






                            </div>
                        </div>






                    </div>
                </div>
            </div>

        </>
    )
}

export default Template