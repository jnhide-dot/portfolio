# 문서와 파일 추가하기

이 저장소는 ‘포트폴리오 키우기’를 바탕으로 한 Jnhide의 문서형 포트폴리오입니다.

## 문서 편집

`content/`에서 해당 `.md` 파일을 열고 GitHub의 연필 버튼으로 수정합니다. 제목·설명·상태·목차는 `content/catalog.json`에서 관리합니다. main에 저장하면 홈페이지가 자동으로 갱신됩니다.

기획 주장은 작성자 본인이 결정합니다. 분석 5개는 Notion 원문을 옮긴 현재 작업본입니다. 원문 주석은 접을 수 있게 표시합니다. 시스템·캐릭터 제안은 현재 미확정 상태만 옮겼으며, 이전 미채택 사양을 확정안으로 사용하지 않았습니다. Notion과 자동 동기화되지는 않습니다.

## PDF·이미지·영상 추가

1. GitHub의 Add file → Upload files로 공개할 파일을 `dist/files/`에 추가합니다. 파일명은 영문·숫자·하이픈을 권장합니다.
2. `content/attachments.json`에 다음 항목을 추가합니다.

```json
[
  {
    "document": "project-g",
    "title": "캐릭터 전투 시스템 기획서",
    "type": "문서",
    "url": "files/project-g-combat.pdf"
  }
]
```

`document`에는 catalog.json의 id를 사용합니다. `type`은 문서·이미지·영상·빌드 중 하나입니다. 영상은 공개 YouTube 등 https 링크로도 등록할 수 있습니다. 파일이 없는 예시 항목은 실제 목록에 넣지 않았습니다.

이 저장소와 홈페이지는 공개 자료를 위한 공간입니다. ProjectMD의 기업 원본·비공개 소스, 과금 원본, 개인정보가 있는 지원서는 넣지 않습니다.

## 로컬 확인

`npm run build` 후 `npm run dev`로 http://127.0.0.1:4173 을 엽니다. 추가 패키지 설치 없이 Node.js로 실행됩니다.
