import React, { useState, useEffect } from 'react'
import IconBtn from '../../common/IconBtn'
import { addCategory, fetchCourseCategories } from '../../../services/operations/courseDetailsAPI'
import { useSelector } from 'react-redux'

const Category = () => {

  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    categoryName: "",
    categoryDescription: "",
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const getCategories = async () => {
    setLoading(true);
    const categories = await fetchCourseCategories();
    if (categories?.length > 0) {
      setCategories(categories);
    }
    setLoading(false);
  };

  useEffect(() => {
    getCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      name: formData.categoryName,
      description: formData.categoryDescription,
    };

    const newCategory = await addCategory(data, token);

    if (newCategory) {
      // setCategories(prevCategories => [...prevCategories, newCategory]);
      getCategories();
      setFormData({
        categoryName: "",
        categoryDescription: "",
      });
    }
  };

  return (
    <div className='text-white flex flex-col md:flex gap-8 w-full h-full'>
      <div className='w-full md:w-2/3'>
        <form onSubmit={handleSubmit}>
          <div className='w-full flex flex-col gap-7 min-h-44'>
            <div className='flex flex-col md:flex-row gap-4'>
              <div className="flex flex-col gap-2 lg:w-[48%]">
                <label htmlFor="categoryName" className="label-style">
                  Category Name <sup className="text-pink-200">*</sup>
                </label>
                <input
                  type="text"
                  name="categoryName"
                  id="categoryName"
                  placeholder="Enter category name"
                  className="form-style"
                  value={formData.categoryName}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col gap-2 lg:w-[48%]">
                <label htmlFor="categoryDescription" className="label-style">
                  Category Description
                </label>
                <textarea
                  id="categoryDescription"
                  name="categoryDescription"
                  placeholder="Enter description"
                  className="form-style min-h-[130px]"
                  value={formData.categoryDescription}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className='flex justify-end mr-2'>
              <IconBtn
                text="Add Category"
                customClasses="w-fit"
              />
            </div>
          </div>
        </form>
      </div>
      <div className='w-full md:w-1/3 bg-richblack-800 p-2 rounded-lg'>
        <h2 className='text-2xl font-semibold mb-4 text-center border-b-2 border-richblack-300'>All Categories</h2>
        {loading ? (
          <p className='spinner'></p>
        ) : (
          <div className='pl-4 space-y-2'>
            {
              categories.map(category => (
                <p key={category._id} className='font-bold'>{category.name}</p>
              ))
            }
          </div>
        )}
      </div>
    </div>
  )
}

export default Category