import React from 'react';
import Logo1 from '../../../assets/TimeLineLogo/Logo1.svg';
import Logo2 from '../../../assets/TimeLineLogo/Logo2.svg';
import Logo3 from '../../../assets/TimeLineLogo/Logo3.svg';
import Logo4 from '../../../assets/TimeLineLogo/Logo4.svg';
import TimeLineImage from '../../../assets/Images/TimelineImage.png';

const timeline = [
  {
    Logo: Logo1,
    Heading: 'Leadership',
    Description: 'Fully committed to the success company',
  },
  {
    Logo: Logo2,
    Heading: 'Leadership',
    Description: 'Fully committed to the success company',
  },
  {
    Logo: Logo3,
    Heading: 'Leadership',
    Description: 'Fully committed to the success company',
  },
  {
    Logo: Logo4,
    Heading: 'Leadership',
    Description: 'Fully committed to the success company',
  },
];

const TimeLineSection = () => {
  return (
    <div className="flex flex-col items-center gap-15 md:flex-row">
      <div className="flex w-full flex-col gap-5 md:w-[45%]">
        {timeline.map((element, index) => {
          return (
            <div className="flex gap-6" key={index}>
              <div className="flex h-[50px] w-[50px] items-center justify-center bg-white">
                <img src={element.Logo} />
              </div>
              <div>
                <h3 className="body-1-md font-semibold">{element.Heading}</h3>
                <p className="text-base">{element.Description}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="relative shadow-blue-200">
        <img src={TimeLineImage} alt="TimeLineImage" />
        <div className="bg-status-success-surface absolute left-[50%] flex translate-x-[-50%] translate-y-[-50%] py-7 text-white uppercase">
          <div className="border-status-success-stroke flex items-center gap-5 border-r px-7">
            <p className="text-3xl font-bold">10</p>
            <p className="text-status-success text-sm">Years of Experience</p>
          </div>
          <div className="flex items-center gap-5 px-7">
            <p className="text-3xl font-bold">250</p>
            <p className="text-status-success text-sm">Type of Courses</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeLineSection;
