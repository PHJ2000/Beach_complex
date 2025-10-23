import svgPaths from "./svg-2c99s1bff9";
import imgImage13 from "figma:asset/9d8f5cd1f203a3bfab1fdbfc94c0e49b7e5e0cc2.png";
import imgImage15 from "figma:asset/5ed0cbf4b0233625f7aaba0474ed0928adb308e3.png";
import imgImage10 from "figma:asset/68d6b45c96227e3194749364b7a79d356611856c.png";

function IconCalendar() {
  return (
    <div className="absolute inset-[2.22%_23.2%_91.63%_63.47%]" data-name="icon-calendar">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 50 50">
        <g id="icon-calendar">
          <path clipRule="evenodd" d={svgPaths.p1b9c87f0} fill="var(--fill-0, #2D3648)" fillRule="evenodd" id="Shape" />
        </g>
      </svg>
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
    <div className="absolute bg-white inset-[3.08%_5.87%_90.76%_80.8%] overflow-clip" data-name="Frame">
      <Frame />
    </div>
  );
}

export default function Component() {
  return (
    <div className="bg-white relative size-full" data-name="개발자 모드">
      <div className="absolute bg-[#d9d9d9] h-[81px] left-[30px] top-[89px] w-[316px]" />
      <p className="absolute font-['Noto_Sans_KR:Regular',_sans-serif] font-normal h-[46px] leading-[normal] left-[44px] text-[10px] text-black top-[107px] tracking-[-0.1px] w-[286px]">모델 지표</p>
      <div className="absolute bg-[#d9d9d9] h-[86px] left-[33px] top-[203px] w-[313px]" />
      <p className="absolute font-['Noto_Sans_KR:Regular',_sans-serif] font-normal h-[67px] leading-[normal] left-[44px] text-[10px] text-black top-[213px] tracking-[-0.1px] w-[286px]">구간별 신뢰성</p>
      <div className="absolute bg-[#d9d9d9] h-[86px] left-[38px] top-[320px] w-[308px]" />
      <p className="absolute font-['Noto_Sans_KR:Regular',_sans-serif] font-normal h-[59px] leading-[normal] left-[51px] text-[10px] text-black top-[334px] tracking-[-0.1px] w-[270px]">피처별 히트맵</p>
      <div className="absolute h-[56px] left-[100px] top-[102px] w-[221px]" data-name="image 13">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage13} />
      </div>
      <div className="absolute h-[84px] left-[124px] top-[322px] w-[174px]" data-name="image 15">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage15} />
      </div>
      <div className="absolute h-[53px] left-0 top-[759px] w-[375px]" data-name="image 10">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage10} />
      </div>
      <div className="absolute bg-[#d9d9d9] inset-[2.22%_38.93%_90.76%_5.33%]" />
      <p className="absolute font-['Inter:Semi_Bold',_'Noto_Sans_KR:Bold',_sans-serif] font-semibold inset-[4.31%_74.4%_92.49%_8%] leading-[normal] not-italic text-[16px] text-black">로고</p>
      <IconCalendar />
      <Frame1 />
      <p className="absolute font-['Inter:Regular',_'Noto_Sans_KR:Regular',_sans-serif] font-normal inset-[4.68%_43.2%_90.89%_35.2%] leading-[normal] not-italic text-[12px] text-black">앱 이름</p>
      <div className="absolute bg-[#d9d9d9] h-[95px] left-[38px] top-[433px] w-[308px]" />
      <div className="absolute font-['Noto_Sans_KR:Medium',_sans-serif] font-medium h-[75px] leading-[normal] left-[50px] text-[14px] text-black top-[444px] w-[278px]">
        <p className="mb-0">{`주간 접속자 수 `}</p>
        <p className="mb-0">&nbsp;</p>
        <p>그래프 형태로 들어간다.(주간으로 6개월 정도)</p>
      </div>
      <div className="absolute bg-[#d9d9d9] h-[94px] left-[39px] top-[535px] w-[307px]" />
      <div className="absolute bg-[#d9d9d9] h-[94px] left-[39px] top-[647px] w-[307px]" />
      <div className="absolute font-['Noto_Sans_KR:Medium',_sans-serif] font-medium h-[69px] leading-[normal] left-[52px] text-[14px] text-black top-[547px] w-[278px]">
        <p className="mb-0">화면 별 로딩 시간</p>
        <p className="mb-0">&nbsp;</p>
        <p>화면 별 로딩 시간 테스트 각 화면 당 페이지 확인</p>
      </div>
      <div className="absolute font-['Noto_Sans_KR:Medium',_sans-serif] font-medium h-[68px] leading-[normal] left-[55px] text-[14px] text-black top-[663px] w-[273px]">
        <p className="mb-0">API 상태</p>
        <p className="mb-0">&nbsp;</p>
        <p>현재 살아있는 거 초록색 , 빨색색</p>
      </div>
    </div>
  );
}