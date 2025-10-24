
  # 부산 해수욕장 혼잡도 앱_박재홍

  This is a code bundle for 부산 해수욕장 혼잡도 앱_박재홍. The original project is available at https://www.figma.com/design/a3ofEvvgfRDF8TI3YaG6dA/%EB%B6%80%EC%82%B0-%ED%95%B4%EC%88%98%EC%9A%95%EC%9E%A5-%ED%98%BC%EC%9E%A1%EB%8F%84-%EC%95%B1_%EB%B0%95%EC%9E%AC%ED%99%8D.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  

  ## 로컬 테스트 시 참고 사항
 해당 명령어를 사용 후 진행하세요
 docker compose exec postgres psql -U beach -d beach_complex -c \
 "UPDATE beaches SET status='normal' WHERE code='HAEUNDAE';
 UPDATE beaches SET status='free'   WHERE code='SONGJEONG';
 UPDATE beaches SET status='busy'   WHERE code='GWANGALLI';"
