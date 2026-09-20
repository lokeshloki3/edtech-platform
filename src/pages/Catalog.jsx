import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { apiConnector } from '../services/apiConnector';
import { categories } from '../services/apis';
import { getCatalogPageData } from '../services/operations/pageAndComponentData';
import { useSelector } from 'react-redux';
import Error from './Error';
import CatalogCourseSlider from '../components/core/Catalog/CatalogCourseSlider';
import Footer from "../components/common/Footer"
import CatalogCourseCard from '../components/core/Catalog/CatalogCourseCard';

const Catalog = () => {

  const { catalogName } = useParams();
  const [catalogPageData, setCatalogPageData] = useState(null);
  const [categoryId, setCategoryId] = useState("");
  const { loading } = useSelector((state) => state.profile);
  const [active, setActive] = useState(1);

  // fetch all categories
  useEffect(() => {
    const getCategories = async () => {
      const response = await apiConnector("GET", categories.CATEGORIES_API);
      const category_id =
        response?.data?.data?.filter((ct) => ct.name.split(" ").join("-").toLowerCase() === catalogName)[0]._id;
      setCategoryId(category_id);
    }
    getCategories();
  }, [catalogName]);

  useEffect(() => {
    if (categoryId) {
      const getCategoryDetails = async () => {
        try {
          const response = await getCatalogPageData(categoryId);
          // console.log("Printing one Category Details: ", response);
          setCatalogPageData(response);
        } catch (error) {
          // console.log(error);
        }
      }
      getCategoryDetails();
    }
  }, [categoryId])

  if (loading || !catalogPageData) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    )
  }
  if (!loading && !catalogPageData.success) {
    return <Error />
  }

  return (
    <div>
      {/* Hero Section */}
      <div className='box-content bg-richblack-800 px-4'>
        <div className='mx-auto flex min-h-[260px] max-w-(--max-content-tab) lg:max-w-(--max-content) flex-col justify-center gap-4'>
          <p className='text-sm text-richblack-300'>
            {`Home / Catalog / `}
            <span className='text-yellow-25'>
              {catalogPageData?.data?.selectedCategory?.name}
            </span>
          </p>
          <p className='text-3xl text-richblack-5'>
            {catalogPageData?.data?.selectedCategory?.name}
          </p>
          <p className='max-w-[870px] text-richblack-200'>
            {catalogPageData?.data?.selectedCategory?.description}
          </p>
        </div>
      </div>

      {/* Section 1 */}
      <div className='mx-auto box-content w-11/12 md:w-full max-w-(--max-content-tab) px-4 py-12 lg:max-w-(--max-content)'>
        <div className='section_heading'>Courses to get you started</div>
        <div className='my-4 flex border-b border-b-richblack-600 text-sm'>
          {/* Add logic here to also show New and Popular */}
          <p
            className={`px-4 py-2 ${active === 1
              ? "border-b border-b-yellow-25 text-yellow-25"
              : "text-richblack-50"
              } cursor-pointer`}
            onClick={() => setActive(1)}
          >
            Most Popular
          </p>
          <p
            className={`px-4 py-2 ${active === 2
              ? "border-b border-b-yellow-25 text-yellow-25"
              : "text-richblack-50"
              } cursor-pointer`}
            onClick={() => setActive(2)}
          >
            New
          </p>
        </div>
        <div>
          <CatalogCourseSlider Courses={catalogPageData?.data?.selectedCategory?.courses} delay={2500} />
        </div>
      </div>

      {/* Section 2 */}
      <div className='mx-auto box-content w-11/12 md:w-full max-w-(--max-content-tab) px-4 py-12 lg:max-w-(--max-content)'>
        <div className='section_heading'>
          Top Courses in {catalogPageData?.data?.differentCategory?.name}
        </div>
        <div className='py-8'>
          <CatalogCourseSlider Courses={catalogPageData?.data?.differentCategory?.courses} delay={3000} />
        </div>
      </div>

      {/* Section 3 */}
      <div className="mx-auto box-content w-11/12 md:w-full max-w-(--max-content-tab) px-4 py-12 lg:max-w-(--max-content)">
        <div className="section_heading">Frequently Bought</div>
        <div className="py-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {catalogPageData?.data?.mostSellingCourses
              ?.slice(0, 4)
              .map((course, index) => (
                <CatalogCourseCard course={course} key={index} Height={"h-[250px] md:h-[400px]"} showEnrollment={true} /> // Only show enrollment in this section
              ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Catalog