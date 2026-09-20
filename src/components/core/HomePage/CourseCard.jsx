import React from 'react'
import { HiUsers } from 'react-icons/hi'
import { ImTree } from 'react-icons/im'

const CourseCard = ({ cardData, currentCard, setCurrentCard }) => {
  return (
    <div className={`w-[360px] lg:w-[30%]
    ${currentCard === cardData?.heading
        ? "bg-white shadow-[12px_12px_0_0] shadow-yellow-50"
        : "bg-global-bg-surface"}
     text-global-text-secondary h-[300px] box-border cursor-pointer`}
      onClick={() => setCurrentCard(cardData?.heading)}
    >
      <div className='border-b-[2px] border-global-stroke-tertiary border-dashed h-[80%] p-6 flex flex-col gap-3'>
        <div
          className={`${currentCard === cardData?.heading && "text-global-text-inverse"} font-semibold text-[20px]`}>
          {cardData?.heading}
        </div>
        <div className="text-global-text-tertiary">{cardData?.description}</div>
      </div>

      <div
        className={`flex justify-between ${currentCard === cardData?.heading
          ? "text-status-info" : "text-global-text-tertiary"}
          px-6 py-3 font-medium`}
      >
        <div className='flex items-center gap-2 text-[16px]'>
          <HiUsers />
          <p>{cardData?.level}</p>
        </div>

        <div className='flex items-center gap-2 text-[16px]'>
          <ImTree />
          <p>{cardData.lessionNumber}</p>
        </div>
      </div>
    </div>
  )
}

export default CourseCard