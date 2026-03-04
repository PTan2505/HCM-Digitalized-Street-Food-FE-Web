import { type JSX } from 'react';
import Navbar from '@components/Navbar';
import Footer from '@components/Footer';

// ── Asset URLs from Figma ──

// Hero
const imgShapes =
  'https://www.figma.com/api/mcp/asset/ba9a1955-0ee8-4409-9ff7-935d48fe3962';
const imgHeroFood1 =
  'https://www.figma.com/api/mcp/asset/190dfb1f-b244-4f3f-967b-9b3205d80643';
const imgHeroFood2 =
  'https://www.figma.com/api/mcp/asset/67edf46a-871d-41fe-9887-9b091ab2b13f';
const imgHeroFood3 =
  'https://www.figma.com/api/mcp/asset/a8be35db-438b-4323-afeb-26b3084b45d5';
const imgEllipse1 =
  'https://www.figma.com/api/mcp/asset/d646d8a3-f3a9-4410-84f3-d3c5e182ab8c';
const imgEllipse2 =
  'https://www.figma.com/api/mcp/asset/fa5b8df7-86f3-41c2-bd43-ac8435edd30c';
const imgEllipse3 =
  'https://www.figma.com/api/mcp/asset/33155d63-e68e-4be5-a8b3-670b22cc2dd0';

// Services
const imgOrder =
  'https://www.figma.com/api/mcp/asset/1c2a635f-374a-42e1-b969-10e3806ea95a';
const imgDelivery =
  'https://www.figma.com/api/mcp/asset/c6bf1890-bba6-4bf1-9fdb-a104e60d9f47';
const imgCourier =
  'https://www.figma.com/api/mcp/asset/b579978b-4fb2-46c7-a3cc-ac1200b4a29e';

// Menu
const imgMieRamen =
  'https://www.figma.com/api/mcp/asset/275528fb-045d-44ff-97d8-1ae9b81ff812';
const imgSaladTahu =
  'https://www.figma.com/api/mcp/asset/fd2cbb09-0d6f-4a3b-82f9-092baa95f25a';
const imgRotibakar =
  'https://www.figma.com/api/mcp/asset/a7f564bd-76be-4873-b9fa-44f648f74fce';
const imgSpaghetti =
  'https://www.figma.com/api/mcp/asset/bd410b13-5d93-4e86-8506-0f028c2893fd';

// Testimonial
const imgTestiPhoto1 =
  'https://www.figma.com/api/mcp/asset/96fe6173-912a-44dc-8216-617ea82e114e';
const imgTestiPhoto2 =
  'https://www.figma.com/api/mcp/asset/048d5fac-3850-455e-bfdc-9cb25655fbf2';
const imgTestiFoodTop =
  'https://www.figma.com/api/mcp/asset/44d92fab-34d5-4b15-8f16-775421809498';
const imgTestiFoodBL =
  'https://www.figma.com/api/mcp/asset/c7ce1133-4c11-48ac-88e4-e74db8405fce';
const imgTestiFoodBR =
  'https://www.figma.com/api/mcp/asset/3a08b682-59af-438d-bdff-1f27663fde41';

// CTA
const imgCtaBg =
  'https://www.figma.com/api/mcp/asset/c045f58f-3e88-456c-8564-e39055cdd97c';
const imgStarIcon =
  'https://www.figma.com/api/mcp/asset/7a8485e3-e3c7-4fd2-a295-6bab03343b6a';
const imgStarHalfIcon =
  'https://www.figma.com/api/mcp/asset/170916df-1752-48bc-b2ec-47505132651a';
const imgHeartIcon =
  'https://www.figma.com/api/mcp/asset/b949d53a-7cbe-4e33-9892-69e7907f0c27';

// ── Data ──

const menuItems = [
  { name: 'Mie Ramen', desc: 'lorem ipsum', price: '$ 20.2', img: imgMieRamen },
  {
    name: 'Salad Tahu',
    desc: 'lorem ipsum',
    price: '$ 20.2',
    img: imgSaladTahu,
  },
  {
    name: 'Roti Bakar',
    desc: 'lorem ipsum',
    price: '$ 20.2',
    img: imgRotibakar,
  },
  {
    name: 'Spaghetti',
    desc: 'lorem ipsum',
    price: '$ 20.2',
    img: imgSpaghetti,
  },
];

const services = [
  {
    img: imgOrder,
    title: 'Easy To Order',
    desc: 'You only order through the app',
  },
  {
    img: imgDelivery,
    title: 'Fastest Delivery',
    desc: 'Delivery will be on time',
  },
  {
    img: imgCourier,
    title: 'Best Quality',
    desc: 'The best quality of food for you',
  },
];

const testimonials = [
  {
    name: 'Naura Silvana',
    rating: 4.5,
    photo: imgTestiPhoto1,
    text: '\u201CLorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis.\u201D',
  },
  {
    name: 'Azura',
    rating: 4.5,
    photo: imgTestiPhoto2,
    text: '\u201CLorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam, purus sit amet luctus venenatis.\u201D',
  },
];

// ── Sub-components ──

function StarRating({ rating }: { rating: number }): JSX.Element {
  const full = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <img key={i} src={imgStarIcon} alt="star" className="h-5 w-5" />
      ))}
      {hasHalf && (
        <img src={imgStarHalfIcon} alt="half star" className="h-5 w-5" />
      )}
    </div>
  );
}

// ── Main Component ──

export default function HomePage(): JSX.Element {
  return (
    <div
      className="min-h-screen bg-white text-[#1d1d1d]"
      style={{ fontFamily: "'Readex Pro', sans-serif" }}
    >
      {/* ═══════════ NAVBAR ═══════════ */}
      <Navbar />

      {/* ═══════════ HERO ═══════════ */}
      <section id="home" className="relative overflow-hidden bg-[#fff9ea]">
        <img
          src={imgShapes}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />

        <div className="relative mx-auto flex max-w-[1440px] items-center px-[130px] py-[80px]">
          {/* Text */}
          <div className="flex max-w-[480px] flex-col gap-6">
            <h1 className="text-[48px] leading-tight font-semibold">
              Be The Fastest In Delivery Your{' '}
              <span className="text-[#FFCB45]">Food</span>
            </h1>
            <p className="max-w-[370px] text-[18px] leading-relaxed font-normal text-[rgba(29,29,29,0.7)]">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit ut
              aliquam, purus sit amet
            </p>
            <button className="w-fit rounded-full bg-[#FFCB45] px-6 py-3 text-sm font-bold transition hover:bg-[#f5c03a]">
              Get Started
            </button>
          </div>

          {/* Hero images */}
          <div className="relative ml-auto h-[500px] w-[550px]">
            <img
              src={imgEllipse1}
              alt=""
              className="pointer-events-none absolute top-[50px] right-[50px] h-[275px] w-[286px]"
            />
            <img
              src={imgEllipse2}
              alt=""
              className="pointer-events-none absolute right-0 bottom-[10px] h-[224px] w-[229px]"
            />
            <img
              src={imgEllipse3}
              alt=""
              className="pointer-events-none absolute bottom-[70px] left-0 h-[168px] w-[167px]"
            />

            <img
              src={imgHeroFood1}
              alt="Salad bowl"
              className="absolute top-[10px] right-[30px] h-[338px] w-[343px] rounded-full object-cover"
            />
            <img
              src={imgHeroFood2}
              alt="Food bowl"
              className="absolute right-0 bottom-0 h-[262px] w-[275px] rounded-full object-cover"
            />
            <img
              src={imgHeroFood3}
              alt="Food bowl"
              className="absolute bottom-[30px] left-0 h-[200px] w-[202px] rounded-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ═══════════ WHAT WE SERVE ═══════════ */}
      <section id="how-it-works" className="bg-white px-[130px] py-[80px]">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-14 text-center">
            <p className="text-[22px] font-medium text-[#FFCB45]">
              How it works
            </p>
            <h2 className="mt-2 text-[32px] font-bold">What We Serve</h2>
            <p className="mx-auto mt-4 max-w-[611px] text-[22px] font-medium text-[rgba(29,29,29,0.7)]">
              Product Quality Is Our Priority, And Always Guarantees Halal And
              Safety Until It Is In Your Hands.
            </p>
          </div>

          <div className="flex justify-center gap-16">
            {services.map((s) => (
              <div
                key={s.title}
                className="flex w-[240px] flex-col items-center gap-4 text-center"
              >
                <img
                  src={s.img}
                  alt={s.title}
                  className="h-[180px] w-[180px] object-contain"
                />
                <h3 className="text-[28px] font-semibold">{s.title}</h3>
                <p className="text-[20px] font-medium text-[rgba(29,29,29,0.7)]">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ POPULAR MENU ═══════════ */}
      <section id="menu" className="bg-white px-[130px] py-[60px]">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-12 text-center">
            <p className="text-[22px] font-medium text-[#FFCB45]">Our menu</p>
            <h2 className="mt-2 text-[32px] font-bold">Our Popular Menu</h2>
            <p className="mx-auto mt-4 max-w-[518px] text-[22px] font-medium text-[rgba(29,29,29,0.7)]">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam
            </p>
          </div>

          <div className="flex justify-center gap-6">
            {menuItems.map((item) => (
              <div
                key={item.name}
                className="w-[280px] overflow-hidden rounded-[10px] bg-[#f1f1f1]"
              >
                <div className="flex justify-center px-[25px] pt-[13px]">
                  <div className="h-[230px] w-[230px] overflow-hidden rounded-[10px]">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <div className="mt-3 rounded-b-[10px] bg-white px-5 pt-3 pb-4">
                  <h4 className="text-center text-[20px] font-medium">
                    {item.name}
                  </h4>
                  <p className="mt-1 text-center text-[18px] font-normal text-[rgba(29,29,29,0.7)]">
                    {item.desc}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[22px] font-medium">
                      {item.price}
                    </span>
                    <button aria-label="Like">
                      <img
                        src={imgHeartIcon}
                        alt=""
                        className="h-6 w-6 opacity-60"
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <button className="rounded-full bg-[#FFCB45] px-6 py-3 text-sm font-bold transition hover:bg-[#f5c03a]">
              More Menu
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="bg-white px-[130px] py-[80px]">
        <div className="mx-auto flex max-w-[1440px] items-start gap-16">
          {/* Food collage */}
          <div className="grid w-[431px] shrink-0 grid-cols-2 gap-0 overflow-hidden rounded-[10px] shadow-[4px_4px_20px_0px_rgba(0,0,0,0.25)]">
            <img
              src={imgTestiFoodTop}
              alt="food"
              className="col-span-2 h-[187px] w-full object-cover"
            />
            <img
              src={imgTestiFoodBL}
              alt="food"
              className="h-[208px] w-full object-cover"
            />
            <img
              src={imgTestiFoodBR}
              alt="food"
              className="h-[208px] w-full object-cover"
            />
          </div>

          {/* Reviews */}
          <div className="flex flex-col pt-2">
            <p className="text-[22px] font-medium text-[#FFCB45]">
              What the say
            </p>
            <h2 className="mt-2 max-w-[481px] text-[32px] leading-tight font-bold">
              What Our Customers Say About Us
            </h2>

            <div className="mt-8 flex gap-6 overflow-x-auto">
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="w-[452px] shrink-0 rounded-[10px] bg-[#f1f1f1] p-5"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={t.photo}
                      alt={t.name}
                      className="h-[60px] w-[59px] rounded-full object-cover"
                    />
                    <div>
                      <p className="text-[20px] font-medium">{t.name}</p>
                      <StarRating rating={t.rating} />
                    </div>
                  </div>
                  <p className="mt-4 text-[18px] leading-relaxed font-normal text-[rgba(29,29,29,0.7)]">
                    {t.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <span className="h-2 w-2 rounded-full bg-[#FFCB45]" />
              <span className="h-2 w-2 rounded-full bg-gray-300" />
              <span className="h-2 w-2 rounded-full bg-gray-300" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ CTA BANNER ═══════════ */}
      <section className="px-[130px] py-[40px]">
        <div className="relative mx-auto max-w-[1180px] overflow-hidden rounded-[10px]">
          <img
            src={imgCtaBg}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 rounded-[10px] bg-[rgba(0,0,0,0.71)]" />
          <div className="relative flex flex-col items-center gap-6 py-[60px] text-center text-white">
            <h2 className="max-w-[524px] text-[32px] leading-tight font-bold">
              Join our member and get discount up to 50%
            </h2>
            <button className="rounded-full bg-[#FFCB45] px-6 py-3 text-sm font-bold text-[#1d1d1d] transition hover:bg-[#f5c03a]">
              Sign Up
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <Footer />
    </div>
  );
}
