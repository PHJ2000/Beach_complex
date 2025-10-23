import svgPaths from "./svg-hi4imqtl6p";
import imgImage7 from "figma:asset/9e37fa47dd4c36536c3dbff797de36f7c97e61ae.png";
import imgImage8 from "figma:asset/0f479ae13aeeec4c4c5fbe69018d93878895c993.png";
import imgImage11 from "figma:asset/f84c8d08dbe6e75dfc4c19c8c7ceedae02b45f80.png";
import imgImage10 from "figma:asset/68d6b45c96227e3194749364b7a79d356611856c.png";
import imgImage12 from "figma:asset/5834b4abc3349e218166a4aa12b23ef87542b6a1.png";

function Group11() {
  return (
    <div className="absolute contents left-[17px] top-[473px]">
      <div className="absolute h-[96px] left-[17px] top-[473px] w-[97px]" data-name="image 7">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage7} />
      </div>
      <div className="absolute h-[97px] left-[17px] top-[598px] w-[98px]" data-name="image 8">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage8} />
      </div>
      <div className="absolute bg-[#d9d9d9] h-[90px] left-[120px] top-[476px] w-[245px]" />
      <div className="absolute font-['Noto_Sans_KR:Medium',_sans-serif] font-medium h-[66px] leading-[normal] left-[134px] text-[14px] text-black top-[489px] w-[213px]">
        <p className="mb-0">부산불꽃축제 2.1km 오늘 20-21</p>
        <p className="mb-0">&nbsp;</p>
        <p>혼잡 → 22시 이후 권장</p>
      </div>
      <div className="absolute bg-[#d9d9d9] h-[90px] left-[120px] top-[602px] w-[245px]" />
      <div className="absolute bg-[#d9d9d9] h-[90px] left-[118px] top-[728px] w-[245px]" />
      <div className="absolute font-['Noto_Sans_KR:Medium',_sans-serif] font-medium h-[66px] leading-[normal] left-[134px] text-[14px] text-black top-[615px] w-[213px]">
        <p className="mb-0">서핑체험 1.3km 상시</p>
        <p className="mb-0">&nbsp;</p>
        <p>오전 6-8시 여유</p>
      </div>
      <div className="absolute h-[101px] left-[17px] top-[724px] w-[103px]" data-name="image 11">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage11} />
      </div>
      <div className="absolute font-['Noto_Sans_KR:Medium',_sans-serif] font-medium h-[81px] leading-[normal] left-[134px] text-[14px] text-black top-[752px] w-[144px]">
        <p className="mb-0">{`개막작 상영 7.2km `}</p>
        <p className="mb-0">&nbsp;</p>
        <p>오후 6-8시 혼잡</p>
      </div>
    </div>
  );
}

function Group12() {
  return (
    <div className="absolute contents left-[17px] top-[473px]">
      <Group11 />
    </div>
  );
}

function Group13() {
  return (
    <div className="absolute contents left-[17px] top-[452px]">
      <p className="absolute font-['Noto_Sans_KR:Medium',_sans-serif] font-medium h-[42px] leading-[normal] left-[22px] text-[14px] text-black top-[452px] w-[203px]">주변 행사 / 활동 추천</p>
      <Group12 />
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute left-0 size-[50px] top-0" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 50 50">
        <g id="Frame">
          <path d={svgPaths.p2a8354c0} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.75" />
        </g>
      </svg>
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute bg-white inset-[1.97%_5.6%_91.87%_81.07%] overflow-clip" data-name="Frame">
      <Frame />
    </div>
  );
}

export default function Component() {
  return (
    <div className="bg-white relative size-full" data-name="주변행사">
      <Group13 />
      <div className="absolute h-[53px] left-0 top-[759px] w-[375px]" data-name="image 10">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage10} />
      </div>
      <div className="absolute bg-[#d9d9d9] inset-[1.11%_38.67%_91.87%_5.6%]" />
      <p className="absolute font-['Inter:Semi_Bold',_'Noto_Sans_KR:Bold',_sans-serif] font-semibold inset-[3.2%_74.13%_93.6%_8.27%] leading-[normal] not-italic text-[16px] text-black">로고</p>
      <Frame1 />
      <p className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal inset-[3.57%_42.93%_92%_35.47%] leading-[normal] not-italic text-[12px] text-black">앱 이름</p>
      <div className="absolute h-[304px] left-[17px] top-[128px] w-[337px]" data-name="image 11">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage12} />
      </div>
      <p className="absolute font-['Noto_Sans_KR:Regular',_sans-serif] font-normal inset-[3.82%_18.93%_91.75%_67.73%] leading-[normal] text-[10px] text-black tracking-[-0.1px]">날짜</p>
    </div>
  );
}