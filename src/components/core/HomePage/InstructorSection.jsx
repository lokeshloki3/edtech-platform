import React from "react";
import Instructor from "../../../assets/Images/Instructor.png"
import HighlightText from "./HighlightText";
import CTAButton from "./Button"
import { FaArrowRight } from "react-icons/fa";

const InstructorSection = () => {
    return (
        <div className="mt-4 md:mt-16">
            <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="w-[50%]">
                    <img
                        src={Instructor}
                        alt="InstructorImage"
                        className="shadow-white"
                    />
                </div>
                <div className="flex flex-col gap-10 w-full md:w-[50%]">
                    <div className="text-3xl md:text-4xl font-semibold text-center md:text-start">
                        Become an
                        <HighlightText text={"Instructor"} />
                    </div>
                    <div className="font-medium text-[16px] w-full md:w-[80%] text-richblack-300">
                        Instructors from around the world teach millions of students on StudySphere. We provide the tools and skills to teach what you love.
                    </div>
                    <div className="w-fit mx-auto">
                        <CTAButton active={true} linkto={"/signup"}>
                            <div className="flex items-center gap-2">
                                Start Teaching Today
                                <FaArrowRight />
                            </div>
                        </CTAButton>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InstructorSection