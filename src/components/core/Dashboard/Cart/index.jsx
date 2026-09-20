import React from 'react'
import { useSelector } from 'react-redux'
import RenderCartCourses from './RenderCartCourses';
import RenderTotalAmount from './RenderTotalAmount';

const Cart = () => {

    const { total, totalItems } = useSelector((state) => state.cart);

    return (
        <div>
            <h1 className='mb-14 text-3xl font-medium text-global-text-primary'>Your Cart</h1>
            <p className='border-b border-b-richblack-400 pb-2 font-semibold text-global-text-tertiary'>
                {totalItems} Courses in Cart
            </p>

            {total > 0 ? (
                <div className='mt-8 flex flex-col md:flex-col-reverse items-center gap-x-10 gap-y-6 lg:flex-row'>
                    <RenderCartCourses />
                    <RenderTotalAmount />
                </div>
            ) : (
                <p className='mt-14 text-center text-3xl text-global-text-secondary'>
                    Your Cart is Empty
                </p>
            )}
        </div>
    )
}

export default Cart