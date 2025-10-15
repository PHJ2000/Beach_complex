import svgPaths from "./svg-1yaki799hn";
import imgImage5 from "figma:asset/4d414e7f8b2ce1c94b21db7928abbc05f3b6ee0f.png";
import imgImage6 from "figma:asset/5834b4abc3349e218166a4aa12b23ef87542b6a1.png";
import imgImage10 from "figma:asset/68d6b45c96227e3194749364b7a79d356611856c.png";

function IconMonitor() {
  return (
    <div className="absolute h-[42px] left-[200px] top-[685px] w-[52px]" data-name="icon-monitor">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 52 42">
        <g id="icon-monitor">
          <path clipRule="evenodd" d={svgPaths.p296c6300} fill="var(--fill-0, #2D3648)" fillRule="evenodd" id="Shape" />
        </g>
      </svg>
    </div>
  );
}

function IconMoon() {
  return (
    <div className="absolute h-[52px] left-[41px] top-[681px] w-[46px]" data-name="icon-moon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 46 52">
        <g id="icon-moon">
          <path clipRule="evenodd" d={svgPaths.pabc5c0} fill="var(--fill-0, #2D3648)" fillRule="evenodd" id="Shape" />
        </g>
      </svg>
    </div>
  );
}

function IconSun() {
  return (
    <div className="absolute h-[52px] left-[128px] top-[681px] w-[46px]" data-name="icon-sun">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 46 52">
        <g clipPath="url(#clip0_7001_50)" id="icon-sun">
          <g id="Shape">
            <path d={svgPaths.pacb9680} fill="var(--fill-0, #2D3648)" />
            <path clipRule="evenodd" d={svgPaths.p2d9a7200} fill="var(--fill-0, #2D3648)" fillRule="evenodd" />
            <path d={svgPaths.pf196e00} fill="var(--fill-0, #2D3648)" />
            <path d={svgPaths.p1d25a00} fill="var(--fill-0, #2D3648)" />
            <path d={svgPaths.p343fcd70} fill="var(--fill-0, #2D3648)" />
            <path d={svgPaths.p1cd3af80} fill="var(--fill-0, #2D3648)" />
            <path d={svgPaths.p335e6f80} fill="var(--fill-0, #2D3648)" />
            <path d={svgPaths.p14b2d5f0} fill="var(--fill-0, #2D3648)" />
            <path d={svgPaths.p3e40b700} fill="var(--fill-0, #2D3648)" />
          </g>
        </g>
        <defs>
          <clipPath id="clip0_7001_50">
            <rect fill="white" height="52" width="46" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Group9() {
  return (
    <div className="absolute contents left-[11px] top-[666px]">
      <div className="absolute bg-[#d9d9d9] h-[81px] left-[11px] top-[666px] w-[353px]" />
      <IconMonitor />
      <IconMoon />
      <IconSun />
    </div>
  );
}

function Group10() {
  return (
    <div className="absolute contents left-[14px] top-[99px]">
      <div className="absolute bg-[#d9d9d9] h-[83px] left-[16px] top-[131px] w-[317px]" />
      <p className="absolute font-['Noto_Sans_KR:Medium',_sans-serif] font-medium h-[42px] leading-[normal] left-[14px] text-[14px] text-black top-[99px] w-[203px]">{`알림 `}</p>
      <div className="absolute h-[84px] left-[254px] top-[131px] w-[113px]" data-name="image 5">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage5} />
      </div>
      <div className="absolute font-['Noto_Sans_KR:Medium',_sans-serif] font-medium h-[52px] leading-[normal] left-[34px] text-[15px] text-black top-[149px] w-[220px]">
        <p className="mb-0">{`피크 회피 알림 `}</p>
        <p className="mb-0">&nbsp;</p>
        <p>.... 알림</p>
      </div>
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
    <div className="absolute bg-white inset-[2.22%_5.6%_91.63%_81.07%] overflow-clip" data-name="Frame">
      <Frame />
    </div>
  );
}

export default function Component() {
  return (
    <div className="bg-white relative size-full" data-name="마이페이지">
      <p className="absolute font-['Noto_Sans_KR:Medium',_sans-serif] font-medium h-[42px] leading-[normal] left-[14px] text-[14px] text-black top-[246px] w-[203px]">캘린더</p>
      <p className="absolute font-['Noto_Sans_KR:Medium',_sans-serif] font-medium h-[33px] leading-[normal] left-[14px] text-[14px] text-black top-[614px] w-[245px]">화면 모드(다크/라이트/시스템설정)</p>
      <Group9 />
      <Group10 />
      <div className="absolute h-[304px] left-[11px] top-[288px] w-[337px]" data-name="image 6">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage6} />
      </div>
      <div className="absolute h-[53px] left-0 top-[759px] w-[375px]" data-name="image 10">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage10} />
      </div>
      <div className="absolute bg-[#d9d9d9] inset-[1.35%_38.67%_91.63%_5.6%]" />
      <p className="absolute font-['Inter:Semi_Bold',_'Noto_Sans_KR:Bold',_sans-serif] font-semibold inset-[3.45%_74.13%_93.35%_8.27%] leading-[normal] not-italic text-[16px] text-black">로고</p>
      <Frame1 />
      <p className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal inset-[3.82%_42.93%_91.75%_35.47%] leading-[normal] not-italic text-[12px] text-black">앱 이름</p>
      <p className="absolute font-['Noto_Sans_KR:Regular',_sans-serif] font-normal inset-[4.43%_18.93%_91.13%_67.73%] leading-[normal] text-[10px] text-black tracking-[-0.1px]">날짜</p>
    </div>
  );
}