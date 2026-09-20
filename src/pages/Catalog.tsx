import { useParams } from 'react-router-dom';

import { useCatalogPageData, useCourseCategories } from '@/hooks/use-course-query';
import CatalogCourseCard from '../components/core/Catalog/CatalogCourseCard';
import CatalogCourseSlider from '../components/core/Catalog/CatalogCourseSlider';
import Footer from '../components/common/Footer';
import Error from './Error';
import { useState } from 'react';

const toSlug = (name: string) => name.split(' ').join('-').toLowerCase();

const Catalog = () => {
  const { catalogName } = useParams();
  const [active, setActive] = useState(1);

  const { data: categories = [], isLoading: isLoadingCategories } = useCourseCategories();

  // The route carries the category's slug, so the id has to be resolved from
  // the category list before the page itself can be fetched.
  const categoryId = categories.find((c) => toSlug(c.name) === catalogName)?._id ?? '';

  const {
    data: catalogPageData,
    isLoading: isLoadingPage,
    isError,
  } = useCatalogPageData(categoryId);

  if (isLoadingCategories || (categoryId && isLoadingPage)) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner" />
      </div>
    );
  }

  if (isError || !catalogPageData) {
    return <Error />;
  }

  return (
    <div>
      <div className="bg-global-bg-surface box-content px-4">
        <div className="mx-auto flex min-h-[260px] max-w-(--max-content-tab) flex-col justify-center gap-4 lg:max-w-(--max-content)">
          <p className="text-global-text-tertiary text-sm">
            {`Home / Catalog / `}
            <span className="text-global-highlight-text">
              {catalogPageData.selectedCategory?.name}
            </span>
          </p>
          <p className="text-global-text-primary text-3xl">
            {catalogPageData.selectedCategory?.name}
          </p>
          <p className="text-global-text-tertiary max-w-[870px]">
            {catalogPageData.selectedCategory?.description}
          </p>
        </div>
      </div>

      <div className="mx-auto box-content w-11/12 max-w-(--max-content-tab) px-4 py-12 md:w-full lg:max-w-(--max-content)">
        <div className="section_heading">Courses to get you started</div>
        <div className="border-b-global-stroke-secondary my-4 flex border-b text-sm">
          <p
            className={`px-4 py-2 ${
              active === 1
                ? 'border-b-global-highlight-text text-global-highlight-text border-b'
                : 'text-global-text-secondary'
            } cursor-pointer`}
            onClick={() => setActive(1)}
          >
            Most Popular
          </p>
          <p
            className={`px-4 py-2 ${
              active === 2
                ? 'border-b-global-highlight-text text-global-highlight-text border-b'
                : 'text-global-text-secondary'
            } cursor-pointer`}
            onClick={() => setActive(2)}
          >
            New
          </p>
        </div>
        <div>
          <CatalogCourseSlider Courses={catalogPageData.selectedCategory?.courses} delay={2500} />
        </div>
      </div>

      <div className="mx-auto box-content w-11/12 max-w-(--max-content-tab) px-4 py-12 md:w-full lg:max-w-(--max-content)">
        <div className="section_heading">
          Top Courses in {catalogPageData.differentCategory?.name}
        </div>
        <div className="py-8">
          <CatalogCourseSlider Courses={catalogPageData.differentCategory?.courses} delay={3000} />
        </div>
      </div>

      <div className="mx-auto box-content w-11/12 max-w-(--max-content-tab) px-4 py-12 md:w-full lg:max-w-(--max-content)">
        <div className="section_heading">Frequently Bought</div>
        <div className="py-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {catalogPageData.mostSellingCourses?.slice(0, 4).map((course) => (
              <CatalogCourseCard
                course={course}
                key={course._id}
                Height="h-[250px] md:h-[400px]"
                showEnrollment
              />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Catalog;
