import { type JSX } from 'react';

const imgLogoFood =
  'https://www.figma.com/api/mcp/asset/03155a07-3cc4-4322-b47e-bf09636ecaaf';
const imgBgFooter =
  'https://www.figma.com/api/mcp/asset/6d9ac769-3192-466d-8850-ac00be810d15';
const imgInstagramIcon =
  'https://www.figma.com/api/mcp/asset/7323645a-1f09-4475-aef3-488faaa8892f';
const imgFacebookIcon =
  'https://www.figma.com/api/mcp/asset/46f266c9-87fc-4300-8016-1784f6f27a06';
const imgTwitterIcon =
  'https://www.figma.com/api/mcp/asset/17b15487-2f0b-4364-b7bb-1aa66e92c907';

export default function Footer(): JSX.Element {
  return (
    <footer
      className="relative"
      style={{ fontFamily: "'Readex Pro', sans-serif" }}
    >
      {/* Background image */}
      <img
        src={imgBgFooter}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />

      <div className="relative px-[130px] pt-[80px] pb-[60px]">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-10">
            {/* Brand */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-1">
                <span className="text-2xl font-semibold text-[#1d1d1d]">
                  Let&apos;sFood
                </span>
                <img
                  src={imgLogoFood}
                  alt="logo"
                  className="h-[47px] w-[47px] object-contain"
                />
              </div>
              <p className="max-w-[380px] text-[20px] font-normal text-[rgba(29,29,29,0.7)]">
                Jalan Semangka Raya, Telaga Murni,Cikarang Barat, Kab. Bekasi
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="#"
                  aria-label="Instagram"
                  className="flex h-[48px] w-[45px] items-center justify-center rounded-full bg-white shadow-[0px_4px_12px_0px_rgba(29,29,29,0.15)]"
                >
                  <img
                    src={imgInstagramIcon}
                    alt=""
                    className="h-[22px] w-[22px]"
                  />
                </a>
                <a
                  href="#"
                  aria-label="Facebook"
                  className="flex h-[48px] w-[46px] items-center justify-center rounded-full bg-[#FFCB45] shadow-[0px_4px_24px_0px_rgba(29,29,29,0.25)]"
                >
                  <img
                    src={imgFacebookIcon}
                    alt=""
                    className="h-[18px] w-[9px]"
                  />
                </a>
                <a
                  href="#"
                  aria-label="Twitter"
                  className="flex h-[48px] w-[45px] items-center justify-center rounded-full bg-white shadow-[0px_4px_12px_0px_rgba(29,29,29,0.15)]"
                >
                  <img
                    src={imgTwitterIcon}
                    alt=""
                    className="h-[18px] w-[23px]"
                  />
                </a>
              </div>
            </div>

            {/* Company */}
            <div className="flex flex-col gap-4">
              <h4 className="text-[20px] font-medium text-[#1d1d1d]">
                Company
              </h4>
              {['About Us', 'Career', 'How It Work'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-[18px] font-normal text-[rgba(29,29,29,0.7)] transition hover:text-[#1d1d1d]"
                >
                  {item}
                </a>
              ))}
            </div>

            {/* Policy */}
            <div className="flex flex-col gap-4">
              <h4 className="text-[20px] font-medium text-[#1d1d1d]">Policy</h4>
              {['FAQ', 'Privacy', 'Shipping'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-[18px] font-normal text-[rgba(29,29,29,0.7)] transition hover:text-[#1d1d1d]"
                >
                  {item}
                </a>
              ))}
            </div>

            {/* Get In Touch */}
            <div className="flex flex-col gap-4">
              <h4 className="text-[20px] font-medium text-[#1d1d1d]">
                Get In Touch
              </h4>
              <span className="text-[18px] font-normal text-[rgba(29,29,29,0.7)]">
                +62 896 7311 2766
              </span>
              <span className="text-[18px] font-normal text-[rgba(29,29,29,0.7)]">
                food@example.com
              </span>
            </div>
          </div>

          <div className="mt-16 border-t border-[rgba(29,29,29,0.15)] pt-6 text-center">
            <p className="text-[16px] font-normal text-[#1d1d1d]">
              © 2022 Let&apos;sFood. ALL RIGHT RESERVED.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
