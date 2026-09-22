import { useBuyCourse } from '@/hooks/use-payment-query';
import { useAppSelector } from '@/reducer/hooks';
import IconBtn from '../../../common/IconBtn';

const RenderTotalAmount = () => {
  const { total, cart } = useAppSelector((state) => state.cart);
  const { mutate: buyCourse, isPending } = useBuyCourse();

  const handleBuyCourse = () => {
    buyCourse(cart.map((course) => course._id));
  };

  return (
    <div className="border-global-stroke-primary bg-global-bg-surface min-w-[280px] rounded-md border-[1px] p-6">
      <p className="text-global-text-tertiary mb-1 text-sm font-medium">Total:</p>
      <p className="text-global-highlight-text-muted mb-6 text-3xl font-medium">Rs {total}</p>

      <IconBtn
        text={isPending ? 'Processing...' : 'Buy Now'}
        disabled={isPending}
        onclick={handleBuyCourse}
        customClasses="w-full justify-center"
      />
    </div>
  );
};

export default RenderTotalAmount;
