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

const COLUMN_GRID = 'grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3';

const headingId = (title) => `footer-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

const FooterNav = ({ title, links }) => {
  const id = headingId(title);

  return (
    <nav aria-labelledby={id}>
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
      <div className="text-global-text-tertiary mx-auto w-11/12 max-w-(--max-content) py-14">
        <div className="border-global-stroke-primary flex flex-col gap-10 border-b pb-10 lg:flex-row lg:gap-0">
          <div
            className={`${COLUMN_GRID} border-global-stroke-primary lg:w-1/2 lg:border-r lg:pr-8`}
          >
            <div className="flex flex-col gap-4">
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

            <div className="flex flex-col gap-7">
              <FooterNav title="Resources" links={RESOURCES} />
              <FooterNav title="Support" links={SUPPORT} />
            </div>

            <div className="flex flex-col gap-7">
              <FooterNav title="Plans" links={PLANS} />
              <FooterNav title="Community" links={COMMUNITY} />
            </div>
          </div>

          <div className={`${COLUMN_GRID} lg:w-1/2 lg:pl-8`}>
            {FooterLink2.map((section) => (
              <FooterNav
                key={section.title}
                title={section.title}
                links={section.links.map((link) => ({ label: link.title, to: CATALOG_ROUTE }))}
              />
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 lg:flex-row lg:items-start">
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
