import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useCourseCategories, useCreateCategory } from '@/hooks/use-course-query';
import {
  createCategorySchema,
  type CreateCategoryPayload,
} from '@/zod-validations/course.validation';
import IconBtn from '../../common/IconBtn';

const Category = () => {
  const { data: categories = [], isLoading } = useCourseCategories();
  const { mutate: addCategory, isPending } = useCreateCategory();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCategoryPayload>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { name: '', description: '' },
  });

  const onSubmit = (values: CreateCategoryPayload) => {
    addCategory(values, { onSuccess: () => reset() });
  };

  return (
    <div className="flex h-full w-full flex-col gap-8 text-white md:flex">
      <h1 className="sr-only">Categories</h1>

      <div className="w-full md:w-2/3">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex min-h-44 w-full flex-col gap-7">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex flex-col gap-2 lg:w-[48%]">
                <label htmlFor="name" className="label-style">
                  Category Name <sup className="text-status-error">*</sup>
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="Enter category name"
                  className="form-style"
                  {...register('name')}
                />
                {errors.name && (
                  <span className="text-status-error -mt-1 text-[12px]">{errors.name.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-2 lg:w-[48%]">
                <label htmlFor="description" className="label-style">
                  Category Description
                </label>
                <textarea
                  id="description"
                  placeholder="Enter description"
                  className="form-style min-h-[130px]"
                  {...register('description')}
                />
                {errors.description && (
                  <span className="text-status-error -mt-1 text-[12px]">
                    {errors.description.message}
                  </span>
                )}
              </div>
            </div>

            <div className="mr-2 flex justify-end">
              <IconBtn
                type="submit"
                text={isPending ? 'Adding...' : 'Add Category'}
                disabled={isPending}
                customClasses="w-fit"
              />
            </div>
          </div>
        </form>
      </div>

      <div className="bg-global-bg-surface w-full rounded-lg p-2 md:w-1/3">
        <h2 className="border-global-stroke-tertiary mb-4 border-b-2 text-center text-2xl font-semibold">
          All Categories
        </h2>
        {isLoading ? (
          <p className="spinner" />
        ) : (
          <div className="space-y-2 pl-4">
            {categories.map((category) => (
              <p key={category._id} className="font-bold">
                {category.name}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;
