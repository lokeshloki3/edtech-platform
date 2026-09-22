import React from 'react';
import { useSelector } from 'react-redux';
import RenderCartCourses from './RenderCartCourses';
import RenderTotalAmount from './RenderTotalAmount';

const Cart = () => {
  const { total, totalItems } = useSelector((state) => state.cart);

  return (
    <div>
      <h1 className="text-global-text-primary mb-14 text-3xl font-medium">Your Cart</h1>
      <p className="border-b-richblack-400 text-global-text-tertiary border-b pb-2 font-semibold">
        {totalItems} Courses in Cart
      </p>

      {total > 0 ? (
        <div className="mt-8 flex flex-col items-center gap-x-10 gap-y-6 md:flex-col-reverse lg:flex-row">
          <RenderCartCourses />
          <RenderTotalAmount />
        </div>
      ) : (
        <p className="text-global-text-secondary mt-14 text-center text-3xl">Your Cart is Empty</p>
      )}
    </div>
  );
};

export default Cart;
