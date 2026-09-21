import React from 'react';
import Instructor from '../../../assets/Images/Instructor.png';
import HighlightText from './HighlightText';
import CTAButton from './Button';
import { FaArrowRight } from 'react-icons/fa';

const InstructorSection = () => {
  return (
    <div className="mt-4 md:mt-16">
      <div className="flex flex-col items-center gap-10 md:flex-row">
        <div className="w-[50%]">
          <img src={Instructor} alt="InstructorImage" className="shadow-white" />
        </div>
        <div className="flex w-full flex-col gap-10 md:w-[50%]">
          <h2 className="text-center text-3xl font-semibold md:text-start md:text-4xl">
            Become an
            <HighlightText text={'Instructor'} />
          </h2>
          <div className="text-global-text-tertiary w-full text-[16px] font-medium md:w-[80%]">
            Instructors from around the world teach millions of students on StudySphere. We provide
            the tools and skills to teach what you love.
          </div>
          <div className="mx-auto w-fit">
            <CTAButton active={true} linkto={'/signup'}>
              <div className="flex items-center gap-2">
                Start Teaching Today
                <FaArrowRight />
              </div>
            </CTAButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorSection;
