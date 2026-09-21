import React, { useState } from 'react';
import { HomePageExplore } from '../../../data/homepage-explore';
import HighlightText from './HighlightText';
import CourseCard from './CourseCard';

const tabsName = ['Free', 'New to coding', 'Most popular', 'Skill paths', 'Career paths'];

const ExploreMore = () => {
  const [currentTab, setCurrentTab] = useState(tabsName[0]);
  const [courses, setCourses] = useState(HomePageExplore[0].courses);
  const [currentCard, setCurrentCard] = useState(HomePageExplore[0].courses[0].heading);

  const setMyCard = (value) => {
    setCurrentTab(value);
    const result = HomePageExplore.filter((course) => course.tag === value);
    setCourses(result[0].courses);
    setCurrentCard(result[0].courses[0].heading);
  };

  return (
    <div>
      <h2 className="text-center text-3xl font-semibold sm:text-4xl">
        Unlock the
        <HighlightText text={'Power of Code'} />
      </h2>

      <p className="text-global-text-tertiary mt-3 text-center text-sm text-[16px]">
        Learn to build anything you can imagine
      </p>

      <div className="bg-global-bg-surface border-global-stroke-tertiary mt-5 mb-5 grid grid-cols-5 rounded-lg px-1 py-1">
        {tabsName.map((element, index) => {
          return (
            <div
              className={`text-[16px] ${currentTab === element ? 'bg-global-bg text-global-text-primary font-medium' : 'text-global-text-tertiary'} hover:bg-global-bg hover:text-global-text-primary cursor-pointer rounded-lg px-1 py-1 text-center transition-all duration-200 sm:px-7 sm:py-2`}
              key={index}
              onClick={() => setMyCard(element)}
            >
              {element}
            </div>
          );
        })}
      </div>

      <div className="lg:h-[150px]">
        {/* Course card */}
        <div className="mb-7 flex w-full flex-wrap justify-center gap-10 px-3 text-black lg:absolute lg:bottom-[0] lg:left-[50%] lg:mb-0 lg:translate-x-[-50%] lg:translate-y-[50%] lg:justify-between lg:gap-0 lg:px-0">
          {courses.map((element, index) => {
            return (
              <CourseCard
                key={index}
                cardData={element}
                currentCard={currentCard}
                setCurrentCard={setCurrentCard}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExploreMore;
