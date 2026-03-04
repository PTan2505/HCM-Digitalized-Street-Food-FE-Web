import { type JSX } from 'react';
import { Link } from 'react-router-dom';

const imgLogoFood =
  'https://www.figma.com/api/mcp/asset/03155a07-3cc4-4322-b47e-bf09636ecaaf';
const imgSearchIcon =
  'https://www.figma.com/api/mcp/asset/812a8525-5ae4-4d58-985a-e97285f0e190';
const imgCartIcon =
  'https://www.figma.com/api/mcp/asset/346bfb5e-d1c2-404f-94f6-04ac8a626aac';
const imgSignInIcon1 =
  'https://www.figma.com/api/mcp/asset/d36e223e-958c-4b17-9f29-7c6b3b1aaf2b';
const imgSignInIcon2 =
  'https://www.figma.com/api/mcp/asset/a0f88f35-086f-4327-9dda-12a34c303c4e';

export default function Navbar(): JSX.Element {
  return (
    <header
      className="sticky top-0 z-50 bg-[#fff9ea]"
      style={{ fontFamily: "'Readex Pro', sans-serif" }}
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-[130px] py-[30px]">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1">
          <span className="text-2xl font-semibold text-[#1d1d1d]">
            Let&apos;sFood
          </span>
          <img
            src={imgLogoFood}
            alt="logo"
            className="h-[47px] w-[47px] object-contain"
          />
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-10">
          {['Home', 'Menu', 'How it works', 'About', 'Contact'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, '-')}`}
              className="relative text-[22px] font-medium transition-colors hover:text-[#1d1d1d]"
              style={{
                color: item === 'Home' ? '#1d1d1d' : 'rgba(29,29,29,0.7)',
              }}
            >
              {item}
              {item === 'Home' && (
                <div className="absolute -bottom-1 left-0 h-[4px] w-full rounded bg-[#FFCB45]" />
              )}
            </a>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-5">
          <button aria-label="Search">
            <img src={imgSearchIcon} alt="" className="h-6 w-6" />
          </button>

          <button aria-label="Cart" className="relative">
            <img src={imgCartIcon} alt="" className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[#FFCB45] text-[9px] font-medium text-[#1d1d1d]">
              2
            </span>
          </button>

          <button className="flex items-center gap-2 rounded-full bg-[#FFCB45] px-6 py-3 text-sm font-bold text-[#1d1d1d] transition hover:bg-[#f5c03a]">
            <span className="relative h-[17px] w-[15px]">
              <img
                src={imgSignInIcon1}
                alt=""
                className="absolute top-0 left-[4px] h-[17px] w-[11px]"
              />
              <img
                src={imgSignInIcon2}
                alt=""
                className="absolute top-[4px] left-0 h-[8px] w-[12px]"
              />
            </span>
            Sign in
          </button>
        </div>
      </div>
    </header>
  );
}
