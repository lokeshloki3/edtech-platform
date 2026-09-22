import { FaFacebook, FaGoogle, FaTwitter, FaYoutube } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import Logo from '../../assets/Logo/Logo-Full-Light.png';
import { FooterLink2 } from '../../data/footer-links';

const CATALOG_ROUTE = '/catalog/web-development';

const withRoute = (labels, to) => labels.map((label) => ({ label, to }));

const COMPANY = withRoute(['About', 'Careers', 'Affiliates'], '/about');
const RESOURCES = withRoute(
  [
    'Articles',
    'Blog',
    'Chart Sheet',
    'Code challenges',
    'Docs',
    'Projects',
    'Videos',
    'Workspaces',
  ],
  CATALOG_ROUTE
);
const SUPPORT = withRoute(['Help Center'], '/contact');
const PLANS = withRoute(['Paid memberships', 'For students', 'Business solutions'], CATALOG_ROUTE);
const COMMUNITY = withRoute(['Forums', 'Chapters', 'Events'], '/about');
const LEGAL = ['Privacy Policy', 'Cookie Policy', 'Terms'];

const headingId = (title) => `footer-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

const FooterNav = ({ title, links, className }) => {
  const id = headingId(title);

  return (
    <nav aria-labelledby={id} className={className}>
      <h2 id={id} className="body-2-md text-global-text-secondary font-semibold">
        {title}
      </h2>
      <ul className="mt-2 flex flex-col gap-2">
        {links.map(({ label, to }) => (
          <li key={label}>
            <Link
              to={to}
              className="body-3 hover:text-global-text-secondary transition-all duration-200"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-global-bg-surface">
      <div className="text-global-text-tertiary relative mx-auto flex w-11/12 max-w-(--max-content) items-center justify-between gap-8 py-14 lg:flex-row">
        <div className="border-global-stroke-primary flex w-full flex-col border-b pb-5 lg:flex-row">
          <div className="border-global-stroke-primary flex flex-row flex-wrap justify-between gap-3 pl-3 lg:w-[50%] lg:border-r lg:pr-5">
            <div className="mb-7 flex w-[30%] flex-col gap-3 lg:w-[30%] lg:pl-0">
              <Link to="/">
                <img
                  src={Logo}
                  alt="StudySphere"
                  className="object-contain"
                  width={160}
                  height={32}
                  loading="lazy"
                />
              </Link>
              <FooterNav title="Company" links={COMPANY} />
              <div className="flex gap-3 text-lg">
                <FaFacebook />
                <FaGoogle />
                <FaTwitter />
                <FaYoutube />
              </div>
            </div>

            <div className="mb-7 w-[48%] lg:w-[30%] lg:pl-0">
              <FooterNav title="Resources" links={RESOURCES} />
              <FooterNav title="Support" links={SUPPORT} className="mt-7" />
            </div>

            <div className="mb-7 w-full md:w-[48%] lg:w-[30%] lg:pl-0">
              <div className="flex justify-between md:block">
                <FooterNav title="Plans" links={PLANS} />
                <FooterNav title="Community" links={COMMUNITY} className="mr-20 md:mt-7 md:mr-0" />
              </div>
            </div>
          </div>

          <div className="flex flex-row flex-wrap justify-between gap-3 pl-3 lg:w-[50%] lg:pl-5">
            {FooterLink2.map((section) => (
              <FooterNav
                key={section.title}
                title={section.title}
                links={section.links.map((link) => ({ label: link.title, to: CATALOG_ROUTE }))}
                className="mb-7 w-[48%] lg:w-[30%] lg:pl-0"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="text-global-text-tertiary mx-auto flex w-11/12 max-w-(--max-content) flex-row items-center justify-between pb-14">
        <div className="flex w-full flex-col items-center justify-between gap-3 lg:flex-row lg:items-start">
          <ul className="flex flex-row">
            {LEGAL.map((item, index) => (
              <li
                key={item}
                className={`body-3 px-3 ${
                  index === LEGAL.length - 1 ? '' : 'border-global-stroke-primary border-r'
                }`}
              >
                {item}
              </li>
            ))}
          </ul>
          <p className="body-3 text-center">© {year} StudySphere. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
