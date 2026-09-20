import React from 'react'
import IconBtn from "../../../common/IconBtn";
import { useDispatch, useSelector } from 'react-redux';
import { buyCourse } from '../../../../services/operations/studentPaymentAPI';
import { useNavigate } from 'react-router-dom';

const RenderTotalAmount = () => {

  const { total, cart } = useSelector((state) => state.cart);
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleBuyCourse = () => {
    const courses = cart.map((course) => course._id);
    console.log("Bought these courses:", courses);
    // Integrate payment gateway here
    buyCourse(token, courses, user, navigate, dispatch);
  }

  return (
    <div className="min-w-[280px] rounded-md border-[1px] border-global-stroke-primary bg-global-bg-surface p-6">
      <p className="mb-1 text-sm font-medium text-global-text-tertiary">Total:</p>
      <p className="mb-6 text-3xl font-medium text-global-highlight-text-muted">Rs {total}</p>

      <IconBtn
        text="Buy Now"
        onclick={handleBuyCourse}
        customClasses={"w-full justify-center"}
      />
    </div>
  )
}

export default RenderTotalAmount