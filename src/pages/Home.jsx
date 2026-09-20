import React from 'react'
import { FaArrowRight } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import HighlightText from '../components/core/HomePage/HighlightText'
import CTAButton from "../components/core/HomePage/Button";
import Banner from "../assets/Images/banner.mp4"
import CodeBlocks from '../components/core/HomePage/CodeBlocks';
import TimeLineSection from '../components/core/HomePage/TimeLineSection';
import LearningLanguageSection from '../components/core/HomePage/LearningLanguageSection';
import InstructorSection from '../components/core/HomePage/InstructorSection';
import Footer from "../components/common/Footer";
import ExploreMore from "../components/core/HomePage/ExploreMore";
import ReviewSliderHome from '../components/common/ReviewSliderHome';

const Home = () => {
    return (
        <div>
            {/* Section 1 */}
            <div className='relative mx-auto w-11/12 max-w-(--max-content) flex flex-col justify-between
             items-center gap-8 text-white'>
                <Link to={"/signup"}>
                    {/* group property of parent */}
                    <div className='group mt-16 p-1 mx-auto rounded-full bg-richblack-800 font-bold
                     text-richblack-200 drop-shadow-[0_1.5px_rgba(255,255,255,0.25)] transition-all 
                     duration-200 hover:scale-95 hover:drop-shadow-none w-fit'>
                        <div className='flex items-center gap-2 rounded-full px-10 py-[5px] transition-all 
                         duration-200 group-hover:bg-richblack-900'>
                            <p>Become an Instructor</p>
                            <FaArrowRight />
                        </div>
                    </div>
                </Link>
                <div className='text-center text-4xl font-semibold'>
                    Empower Your Future with
                    <HighlightText text={"Coding Skills"} />
                </div>
                <div className='-mt-4 w-[90%] text-center text-lg font-bold text-richblack-300'>
                    With our online coding courses, you can learn at your own pace, from anywhere in the
                    world, and get access to a wealth of resources, including hands-on projects, quizzes,
                    and personalized feedback from instructors.
                </div>
                <div className='flex gap-7 mt-8'>
                    <CTAButton active={true} linkto={"/signup"}>
                        Learn More
                    </CTAButton>
                    <CTAButton active={false} linkto={"/signup"}>
                        Book a Demo
                    </CTAButton>
                </div>
                {/* Shadow added in video */}
                <div className='mx-4 my-7 shadow-[10px_-5px_50px_-5px] shadow-blue-200'>
                    <video
                        className="shadow-[20px_20px_rgba(255,255,255)]"
                        muted
                        loop
                        autoPlay
                    >
                        <source src={Banner} type='video/mp4' />
                    </video>
                </div>
                <div>
                    <CodeBlocks
                        position={"lg:flex-row"}
                        heading={
                            <div className='text-3xl md:text-4xl font-semibold'>
                                Unlock your
                                <HighlightText text={"coding potential "} />
                                with our online courses
                            </div>
                        }
                        subheading={"Our courses are designed and taught by industry experts who have years of experience in coding and are passionate about sharing their knowledge with you."}
                        ctabtn1={
                            {
                                btnText: "Try it Yourself",
                                linkto: "/signup",
                                active: true,
                            }
                        }
                        ctabtn2={
                            {
                                btnText: "Learn more",
                                linkto: "/login",
                                active: false,
                            }
                        }
                        codeColor={"text-yellow-25"}
                        codeblock={`<!DOCTYPE html>\n <html lang="en">\n<head>\n<title>This is myPage</title>\n</head>\n<body>\n<h1><a href="/">Header</a></h1>\n<nav> <a href="/one">One</a> <a href="/two">Two</a> <a href="/three">Three</a>\n</nav>\n</body>`}
                        backgroundGradient={<div className="codeblock1 absolute"></div>}
                    />
                </div>

                {/* Code Section 2 */}
                <div>
                    <CodeBlocks
                        position={"lg:flex-row-reverse"}
                        heading={
                            <div className="w-[100%] text-3xl md:text-4xl font-semibold lg:w-[50%]">
                                Start
                                <HighlightText text={"coding in seconds"} />
                            </div>
                        }
                        subheading={
                            "Go ahead, give it a try. Our hands-on learning environment means you'll be writing real code from your very first lesson."
                        }
                        ctabtn1={{
                            btnText: "Continue Lesson",
                            link: "/signup",
                            active: true,
                        }}
                        ctabtn2={{
                            btnText: "Learn More",
                            link: "/signup",
                            active: false,
                        }}
                        codeColor={"text-white"}
                        codeblock={`import React from "react";\n import CTAButton from "./Button";\nimport TypeAnimation from "react-type";\nimport { FaArrowRight } from "react-icons/fa";\n\nconst Home = () => {\nreturn (\n<div>Home</div>\n)\n}\nexport default Home;`}
                        backgroundGradient={<div className="codeblock2 absolute"></div>}
                    />
                </div>

                <ExploreMore />
            </div>
            {/* Section 2 */}
            <div className='bg-puregreys-5 text-richblack-700'>
                <div className='homepage_bg h-16 md:h-[310px]'>
                    <div className='w-11/12 max-w-(--max-content) flex flex-col items-center justify-between gap-5 mx-auto'>
                        <div className='h-10 md:h-[150px]'></div>
                        <div className='flex gap-7 text-white'>
                            <CTAButton active={true} linkto={"/signup"}>
                                <div className='flex items-center gap-3'>
                                    Explore Full Catalog
                                    <FaArrowRight />
                                </div>
                            </CTAButton>
                            <CTAButton active={false} linkto={"/signup"}>
                                <div>
                                    Learn more
                                </div>
                            </CTAButton>
                        </div>
                    </div>
                </div>
                <div className='w-11/12 max-w-(--max-content) flex flex-col items-center justify-between gap-7 mx-auto'>
                    <div className='flex flex-col md:flex-row gap-5 mb-10 mt-[95px]'>
                        <div className='text-3xl md:text-4xl font-semibold w-full md:w-[45%]'>
                            Get the Skills you need for about
                            <HighlightText text={"Job that is in demand"} />
                        </div>
                        <div className='flex flex-col gap-10 w-full md:w-[40%] items-start'>
                            <div className='text-[16px]'>
                                The modern StudySphere is the dictates its own terms. Today, to be a competitive specialist requires more than professional skills.
                            </div>
                            <CTAButton active={true} linkto={"/signup"}>
                                <div>
                                    Learn More
                                </div>
                            </CTAButton>
                        </div>
                    </div>
                    <TimeLineSection />
                    <LearningLanguageSection />
                </div>
            </div>
            {/* Section 3 */}
            <div className='w-11/12 my-20 mx-auto flex flex-col max-w-(--max-content) items-center justify-between gap-8 bg-richblack-900 text-white'>
                <InstructorSection />
                
                <h2 className='text-center text-3xl md:text-4xl font-semibold mt-10'>Review from Other Learners</h2>
                {/* Review Silder */}
                <ReviewSliderHome />
            </div>
            {/* Footer */}
            <Footer />
        </div>
    )
}

export default Home