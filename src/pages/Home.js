import React from "react";
import { Navbar } from "../components/navbar/Navbar";
import Dashboard from "./Dashboard";

const Home = () => {
  return (
    <>
      <div className="flex flex-col justify-between md:flex-row">
        <Navbar className="basis-1/6"></Navbar>

        <div className=" basis-5/6 bg-blue-50">
          <Dashboard></Dashboard>
        </div>
      </div>
    </>
  );
};

export default Home;
